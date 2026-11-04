import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Appointment, BookingStatus } from '../../types';
import { detectBookingCollision } from '../../domain/booking';
import { X, Calendar, AlertTriangle, CheckCircle2, Clock, User, BedSingle, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { QuickAddCustomerModal } from '../customers/QuickAddCustomerModal';
import { CustomerSearchSelect } from '../../components/common/CustomerSearchSelect';

interface EditBookingModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({ appointment, onClose }) => {
  const { customers, services, staffList, appointments, updateAppointment } = useSpaData();

  const [customerId, setCustomerId] = useState(appointment.customerId);
  const [serviceId, setServiceId] = useState(appointment.serviceId);
  const [staffId, setStaffId] = useState(appointment.staffId);
  const [bedId, setBedId] = useState(appointment.bedId);

  const initialDate = appointment.startTime.slice(0, 10);
  const initialTime = appointment.startTime.slice(11, 16);

  const [date, setDate] = useState(initialDate);
  const [startTimeStr, setStartTimeStr] = useState(initialTime);
  const [status, setStatus] = useState<BookingStatus>(appointment.status);
  const [notes, setNotes] = useState(appointment.notes || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId) || services[0];
  const selectedCustomer = customers.find((c) => c.id === customerId) || customers[0];
  const selectedStaff = staffList.find((s) => s.id === staffId) || staffList[0];

  // Calculate end time automatically based on service duration
  const startDateTime = `${date}T${startTimeStr}`;
  const startDateObj = new Date(startDateTime);
  const endDateObj = new Date(startDateObj.getTime() + (selectedService?.durationMinutes || 60) * 60 * 1000);
  const endTimeStr = !isNaN(endDateObj.getTime())
    ? `${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`
    : '11:00';
  const endDateTime = `${date}T${endTimeStr}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Collision check excluding current appointment
    const otherAppointments = appointments.filter((a) => a.id !== appointment.id);
    const collision = detectBookingCollision(
      {
        staffId,
        bedId,
        startTime: startDateTime,
        endTime: endDateTime,
      },
      otherAppointments
    );

    if (collision.hasCollision) {
      setErrorMsg(collision.reason || 'Trùng lịch hẹn với KTV hoặc Giường này!');
      return;
    }

    updateAppointment(appointment.id, {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      customerPhone: selectedCustomer.phone,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      bedId,
      startTime: startDateTime,
      endTime: endDateTime,
      status,
      notes,
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  const bedOptions = [
    'Giường 01 (Phòng Facial)',
    'Giường 02 (Phòng Laser)',
    'Giường 03 (Phòng Body VIP)',
    'Giường 04 (Phòng Chăm Sóc Da)',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Cập Nhật Lịch Hẹn & Giường</h3>
              <p className="text-[11px] text-rose-200">Mã lịch hẹn: {appointment.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-start gap-3 text-xs text-rose-800 animate-shake">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cảnh báo trùng lịch hẹn:</span>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer Selection */}
          <CustomerSearchSelect
            selectedCustomerId={customerId}
            onSelectCustomer={(c) => setCustomerId(c.id)}
            onOpenQuickAdd={() => setShowQuickAddCustomer(true)}
            placeholder="Gõ tên hoặc số điện thoại khách đặt lịch..."
          />

          {/* Service Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Dịch Vụ Thực Hiện (*)</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} phút)
                </option>
              ))}
            </select>
          </div>

          {/* Staff & Bed Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kỹ thuật viên</label>
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
              >
                {staffList.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.role === 'technician' ? 'KTV' : st.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phòng / Giường</label>
              <select
                value={bedId}
                onChange={(e) => setBedId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
              >
                {bedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày hẹn</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giờ bắt đầu</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => setStartTimeStr(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Time range info */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500">Khung giờ dự kiến:</span>
            <span className="font-mono font-bold text-rose-700">
              {startTimeStr} - {endTimeStr} ({selectedService?.durationMinutes} phút)
            </span>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Trạng thái lịch hẹn</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
            >
              <option value="booked">Đã đặt trước (Booked)</option>
              <option value="arrived">Khách đã đến (Arrived)</option>
              <option value="in_progress">Đang thực hiện dịch vụ (In Progress)</option>
              <option value="completed">Đã hoàn thành (Completed)</option>
              <option value="cancelled">Đã hủy hẹn (Cancelled)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú & Yêu cầu đặc biệt</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Yêu cầu KTV tay nghề cao, da mụn nhạy cảm..."
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold shadow-luxury flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Lịch Hẹn</span>
            </button>
          </div>
        </form>

        {/* Quick Add Customer Modal */}
        {showQuickAddCustomer && (
          <QuickAddCustomerModal
            onClose={() => setShowQuickAddCustomer(false)}
            onCustomerCreated={(newCus) => setCustomerId(newCus.id)}
          />
        )}
      </div>
    </div>
  );
};

