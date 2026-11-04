import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Appointment } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Sparkles,
  CheckCircle2,
  Edit3,
  Trash2,
  QrCode,
  Globe,
  XCircle,
  CreditCard,
} from 'lucide-react';
import { BookingModal } from './BookingModal';
import { EditBookingModal } from './EditBookingModal';
import { OnlineBookingQrModal } from './OnlineBookingQrModal';

export const BookingCalendar: React.FC = () => {
  const { appointments, updateAppointmentStatus, deleteAppointment } = useSpaData();
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const handleDeleteAppointment = (apt: Appointment) => {
    if (confirm(`Bạn có chắc chắn muốn xóa lịch hẹn của khách hàng "${apt.customerName}" (${apt.serviceName})?`)) {
      deleteAppointment(apt.id);
    }
  };

  const beds = [
    'Giường 01 (Phòng Facial)',
    'Giường 02 (Phòng Laser)',
    'Giường 03 (Phòng Body VIP)',
    'Giường 04 (Phòng Chăm Sóc Da)',
  ];

  // Filter appointments for selected date
  const dayAppointments = appointments.filter((a) => a.startTime.startsWith(selectedDate));
  const pendingOnlineApts = appointments.filter((a) => a.status === 'pending_online');

  const statusBadges: Record<string, { label: string; color: string }> = {
    pending_online: {
      label: '🌐 Chờ Duyệt Online',
      color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    },
    booked: { label: 'Đã đặt', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    arrived: { label: 'Đã đến', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    in_progress: { label: 'Đang làm', color: 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse' },
    completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    cancelled: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500 border-slate-200' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Lịch Hẹn & Điều Phối Phòng / Giường
          </h1>
          <p className="text-xs text-slate-500">
            Trực quan hóa timeline, tự động kiểm soát chống trùng lịch KTV và quá tải giường trị liệu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-sm">
            <CalendarIcon className="w-4 h-4 text-rose-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-bold text-slate-800 focus:outline-none bg-transparent"
            />
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 hover:from-amber-700 hover:to-rose-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
            title="Mã QR và Link để khách hàng tự đặt chỗ online"
          >
            <QrCode className="w-4 h-4 text-amber-200" />
            <span>Mã QR Đặt Lịch Online</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đặt Lịch Mới</span>
          </button>
        </div>
      </div>

      {/* Online Bookings Pending Approval Banner */}
      {pendingOnlineApts.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 font-bold shrink-0">
              <Globe className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-amber-950">
                  🛎️ Có {pendingOnlineApts.length} lịch đặt trực tuyến từ khách hàng đang chờ phê duyệt!
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  Mới từ QR
                </span>
              </div>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Khách quét QR tự chọn ngày giờ & giường. Đã tự động đối chiếu chống trùng lịch và thông báo Gmail admin.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => {
                const firstPending = pendingOnlineApts[0];
                if (firstPending) {
                  setSelectedDate(firstPending.startTime.slice(0, 10));
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-sm cursor-pointer text-xs"
            >
              Xem ngày chờ duyệt ({pendingOnlineApts[0]?.startTime.slice(0, 10)})
            </button>
          </div>
        </div>
      )}

      {/* Bed Timeline Grid */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 border-b pb-3">
          <span className="font-bold text-slate-700">Timeline theo từng Giường điều trị</span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Chờ duyệt Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Đã đặt
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Đang phục vụ
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Hoàn thành
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {beds.map((bed) => {
            const bedApts = dayAppointments.filter((a) => a.bedId === bed);

            return (
              <div key={bed} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                    <h3 className="font-bold text-xs text-slate-900">{bed}</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {bedApts.length} lượt hẹn trong ngày
                  </span>
                </div>

                {/* Appointment Cards on this Bed */}
                {bedApts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white/50">
                    Giường đang trống suốt ngày
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {bedApts.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-rose-300 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{apt.customerName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              statusBadges[apt.status]?.color || ''
                            }`}
                          >
                            {statusBadges[apt.status]?.label || apt.status}
                          </span>
                        </div>

                        {(apt.isOnlineBooking || apt.status === 'pending_online') && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 w-fit">
                            <Globe className="w-3 h-3 text-amber-600" />
                            <span>Khách Đặt Online</span>
                            {apt.emailNotifiedTo && (
                              <span className="text-[9px] text-slate-400 font-normal ml-0.5 hidden sm:inline">
                                (Gmail: {apt.emailNotifiedTo.split('@')[0]})
                              </span>
                            )}
                          </div>
                        )}

                        {(apt.isCardBooking || apt.cardId) && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300 w-fit">
                            <CreditCard className="w-3 h-3 text-amber-700" />
                            <span>Buổi Thẻ Liệu Trình</span>
                            {apt.sessionDeducted ? (
                              <span className="text-emerald-700 font-bold ml-1">✓ Đã trừ thẻ</span>
                            ) : (
                              <span className="text-amber-700 font-medium ml-1">(Chưa trừ thẻ)</span>
                            )}
                          </div>
                        )}

                        <div className="text-slate-600 font-medium">{apt.serviceName}</div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span className="flex items-center gap-1 font-mono font-bold text-rose-700">
                            <Clock className="w-3 h-3" />
                            {apt.startTime.slice(11, 16)} - {apt.endTime.slice(11, 16)}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-3 h-3 text-slate-400" />
                            {apt.staffName}
                          </span>
                        </div>

                        {/* Status Switcher & Quick Approvals */}
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          {apt.status === 'pending_online' && (
                            <div className="flex items-center gap-1.5 flex-1">
                              <button
                                onClick={() => {
                                  updateAppointmentStatus(apt.id, 'booked');
                                }}
                                className="flex-1 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                                title="Phê duyệt lịch hẹn này"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-200" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc muốn từ chối lịch hẹn online của ${apt.customerName}?`)) {
                                    updateAppointmentStatus(apt.id, 'cancelled');
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] transition-colors flex items-center justify-center gap-1 border border-rose-200 cursor-pointer"
                                title="Từ chối lịch hẹn này"
                              >
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Hủy</span>
                              </button>
                            </div>
                          )}

                          {apt.status === 'booked' && (
                            <button
                              onClick={() => updateAppointmentStatus(apt.id, 'in_progress')}
                              className="flex-1 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px] transition-colors"
                            >
                              Bắt đầu làm
                            </button>
                          )}
                          {apt.status === 'in_progress' && (
                            <button
                              onClick={() => {
                                updateAppointmentStatus(apt.id, 'completed');
                                if (apt.cardId && !apt.sessionDeducted) {
                                  alert(`✅ Ca làm đẹp đã hoàn tất! Hệ thống đã tự động trừ lùi 1 buổi trong thẻ liệu trình của khách hàng "${apt.customerName}".`);
                                }
                              }}
                              className="flex-1 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã xong</span>
                            </button>
                          )}
                          {apt.status !== 'booked' && apt.status !== 'in_progress' && apt.status !== 'pending_online' && (
                            <span className="text-[10px] text-slate-400 font-medium">Trạng thái: {apt.status}</span>
                          )}

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingAppointment(apt)}
                              className="p-1 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
                              title="Sửa thông tin lịch hẹn"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteAppointment(apt)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                              title="Xóa lịch hẹn này"
                            >
                              <Trash2 className="w-3 h-3 text-rose-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <BookingModal defaultDate={selectedDate} onClose={() => setShowAddModal(false)} />
      )}
      {/* Edit Modal */}
      {editingAppointment && (
        <EditBookingModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
        />
      )}

      {/* Online Booking QR Modal */}
      {showQrModal && (
        <OnlineBookingQrModal onClose={() => setShowQrModal(false)} />
      )}
    </div>
  );
};

