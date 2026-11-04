import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSpaData } from '../../context/SpaDataContext';
import { formatVND } from '../../domain/financial';
import {
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  Award,
} from 'lucide-react';
import { TabKey } from '../../components/layout/Sidebar';

interface StaffDashboardProps {
  onNavigate: (tab: TabKey) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigate }) => {
  const { currentUser, hasPermission } = useAuth();
  const { appointments, commissions, cards } = useSpaData();

  // Filter commissions for current staff member
  const myCommissions = commissions.filter((c) => c.staffId === currentUser.id);
  const myTotalCommission = myCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Filter appointments assigned to this technician (or all for receptionist)
  const myAppointments =
    currentUser.role === 'technician'
      ? appointments.filter((a) => a.staffId === currentUser.id)
      : appointments;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white shadow-luxury relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold mb-3 border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khu vực Tác nghiệp Nhân viên</span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight mb-2">
            Xin chào, {currentUser.name} ({currentUser.title})
          </h1>
          <p className="text-slate-300 text-sm">
            Hôm nay bạn có{' '}
            <span className="font-bold text-amber-300">{myAppointments.length} lịch phục vụ</span>. Chúc bạn một ngày làm việc tràn đầy năng lượng!
          </p>

          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={() => onNavigate('customers')}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Check-in Liệu trình</span>
            </button>
            {hasPermission('use_pos') && (
              <button
                onClick={() => onNavigate('pos')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Bán hàng POS</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('booking')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Xem Lịch Đặt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick KPI stats for this staff */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Hoa hồng tích lũy tháng này</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{formatVND(myTotalCommission)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Từ {myCommissions.length} lượt tour / sale</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lịch hẹn cần phục vụ</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{myAppointments.length} lượt</div>
          <div className="text-[11px] text-slate-500 mt-1">Hôm nay tại phòng trị liệu</div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Thẻ liệu trình đang theo dõi</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{cards.length} gói</div>
          <div className="text-[11px] text-slate-500 mt-1">Khách đang làm dở liệu trình</div>
        </div>
      </div>

      {/* Today's Schedule & My Commission Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lịch làm việc hôm nay */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="font-bold text-slate-900 text-base mb-1">Lịch phục vụ của bạn</h2>
          <p className="text-xs text-slate-500 mb-4">Các lượt làm dịch vụ được phân công trong ngày</p>

          <div className="space-y-3">
            {myAppointments.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Chưa có lịch hẹn nào được xếp hôm nay</div>
            ) : (
              myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900">{apt.customerName}</div>
                    <div className="text-xs text-rose-700 font-medium">{apt.serviceName}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{apt.bedId}</div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold font-mono">
                      {apt.startTime.slice(11, 16)}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1 capitalize font-medium">{apt.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bảng kê thu nhập hoa hồng gần nhất */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Bảng kê hoa hồng gần đây</h2>
              <p className="text-xs text-slate-500">Đối soát minh bạch theo từng ca làm</p>
            </div>
            <button
              onClick={() => onNavigate('staff')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Chi tiết tháng
            </button>
          </div>

          <div className="space-y-2.5">
            {myCommissions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">Chưa có lượt ghi nhận hoa hồng nào</div>
            ) : (
              myCommissions.map((com) => (
                <div
                  key={com.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-800">{com.description}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(com.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <div className="font-bold text-sm text-emerald-600 whitespace-nowrap pl-3">
                    +{formatVND(com.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

