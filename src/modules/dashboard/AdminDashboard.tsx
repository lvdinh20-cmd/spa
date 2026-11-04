import React from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { formatVND } from '../../domain/financial';
import { getInventoryAlerts } from '../../domain/inventory';
import {
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  ShoppingBag,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { TabKey } from '../../components/layout/Sidebar';

interface AdminDashboardProps {
  onNavigate: (tab: TabKey) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { orders, customers, checkins, appointments, inventory } = useSpaData();

  // Metrics calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const totalGrossProfit = orders.reduce((sum, o) => sum + o.grossProfit, 0);
  const totalDebt = customers.reduce((sum, c) => sum + c.debtBalance, 0);
  const { lowStock, nearExpiry } = getInventoryAlerts(inventory);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white shadow-luxury relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-xs font-semibold mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trung tâm Điều hành Spa & Thẩm mỹ viện</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mb-2">
            Chào mừng trở lại, Quản trị viên Liin Spa
          </h1>
          <p className="text-rose-100/90 text-sm leading-relaxed">
            Hệ thống đang hoạt động tối ưu. Hôm nay có{' '}
            <span className="font-bold text-amber-300">{appointments.length} lịch hẹn</span> và{' '}
            <span className="font-bold text-amber-300">{checkins.length} lượt trị liệu</span> đã thực hiện.
          </p>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={() => onNavigate('pos')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 rounded-xl font-bold text-xs shadow-gold transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bán hàng POS (VietQR)</span>
            </button>
            <button
              onClick={() => onNavigate('booking')}
              className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-xs backdrop-blur-sm border border-white/20 transition-all"
            >
              <Calendar className="w-4 h-4" />
              <span>Xếp lịch Giường & KTV</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Doanh thu</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatVND(totalRevenue)}</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Thực thu từ {orders.length} hóa đơn</span>
          </div>
        </div>

        {/* Lợi nhuận gộp ước tính */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lợi nhuận gộp (P&L)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatVND(totalGrossProfit)}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Đã trừ Hoa hồng + BOM tiêu hao
          </div>
        </div>

        {/* Công nợ khách hàng */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công nợ phải thu</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{formatVND(totalDebt)}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Khách nợ trả góp theo đợt
          </div>
        </div>

        {/* Khách hàng */}
        <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hồ sơ khách hàng</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{customers.length} khách</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Đang quản lý hồ sơ da & liệu trình
          </div>
        </div>
      </div>

      {/* Inventory Alerts Banner if any */}
      {(lowStock.length > 0 || nearExpiry.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                Cảnh báo kho hàng ({lowStock.length} mặt hàng sắp hết, {nearExpiry.length} mặt hàng cận Date)
              </div>
              <div className="text-[11px] text-amber-800">
                {lowStock.map((i) => `${i.name} (còn ${i.quantity} ${i.unit})`).join('; ')}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
          >
            Quản lý 2 Kho
          </button>
        </div>
      )}

      {/* Main Grid: Recent Orders & Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Đơn hàng mới nhất</h2>
              <p className="text-xs text-slate-500">Doanh thu & lợi nhuận gộp theo từng hóa đơn</p>
            </div>
            <button
              onClick={() => onNavigate('pos')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Tạo hóa đơn</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Mã Đơn</th>
                  <th className="p-2.5">Khách hàng</th>
                  <th className="p-2.5">Thanh toán</th>
                  <th className="p-2.5 text-right">Tổng tiền</th>
                  <th className="p-2.5 text-right rounded-r-lg">Lợi nhuận gộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-2.5 font-mono font-bold text-slate-800">{order.code}</td>
                    <td className="p-2.5">
                      <div className="font-semibold text-slate-900">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-bold text-slate-900">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600">
                      +{formatVND(order.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today Appointments List (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">Lịch hẹn hôm nay</h2>
              <p className="text-xs text-slate-500">{appointments.length} khách đã đặt</p>
            </div>
            <button
              onClick={() => onNavigate('booking')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Xem Timeline
            </button>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-rose-200 bg-slate-50/50 hover:bg-white transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">{apt.customerName}</span>
                  <span className="font-mono text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {apt.startTime.slice(11, 16)} - {apt.endTime.slice(11, 16)}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium">{apt.serviceName}</div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span>KTV: {apt.staffName}</span>
                  <span className="text-slate-600 font-medium">{apt.bedId.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

