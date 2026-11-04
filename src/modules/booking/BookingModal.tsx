import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Appointment } from '../../types';
import { detectBookingCollision } from '../../domain/booking';
import { X, Calendar, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { QuickAddCustomerModal } from '../customers/QuickAddCustomerModal';
import { CustomerSearchSelect } from '../../components/common/CustomerSearchSelect';

interface BookingModalProps {
  onClose: () => void;
  defaultDate?: string;
  defaultBed?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  onClose,
  defaultDate = '2026-11-04',
  defaultBed = 'Giường 01 (Phòng Facial)',
}) => {
  const { customers, services, staffList, appointments, createAppointment } = useSpaData();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [staffId, setStaffId] = useState(staffList.find((s) => s.role === 'technician')?.id || staffList[0].id);
  const [bedId, setBedId] = useState(defaultBed);

  const [date, setDate] = useState(defaultDate);
  const [startTimeStr, setStartTimeStr] = useState('10:00');
  const [notes, setNotes] = useState('');
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

    // Check collision engine
    const collision = detectBookingCollision(
      {
        staffId,
        bedId,
        startTime: startDateTime,
        endTime: endDateTime,
      },
      appointments
    );

    if (collision.hasCollision) {
      setErrorMsg(collision.reason || 'Trùng lịch hẹn!');
      return;
    }

    createAppointment({
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
      status: 'booked',
      notes,
    });

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
            <h3 className="font-bold text-base">Đặt Lịch Hẹn & Giữ Giường</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="block">Cảnh báo Xung đột Lịch:</strong>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <CustomerSearchSelect
            selectedCustomerId={customerId}
            onSelectCustomer={(c) => setCustomerId(c.id)}
            onOpenQuickAdd={() => setShowQuickAddCustomer(true)}
            placeholder="Gõ tên hoặc số điện thoại khách đặt lịch..."
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dịch vụ (*)</label>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes}p)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">KTV Phụ trách (*)</label>
              <select
                value={staffId}
                onChange={(e) => {
                  setStaffId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chọn Giường / Phòng (*)</label>
              <select
                value={bedId}
                onChange={(e) => {
                  setBedId(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {bedOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày hẹn</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-2 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giờ bắt đầu</label>
              <input
                type="time"
                value={startTimeStr}
                onChange={(e) => {
                  setStartTimeStr(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full p-2 rounded-lg border border-slate-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dự kiến xong</label>
              <div className="p-2 font-mono font-bold text-rose-700 text-sm">
                {endTimeStr} ({selectedService?.durationMinutes} phút)
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Ghi chú yêu cầu đặc biệt</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Khách thích KTV làm êm, chuẩn bị tinh dầu hoa hồng..."
              className="w-full p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác nhận Đặt lịch</span>
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

