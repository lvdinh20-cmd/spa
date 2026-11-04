import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Order, PaymentMethod } from '../../types';
import { formatVND } from '../../domain/financial';
import { excelService } from '../../services/excel';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  QrCode,
  Wallet,
  Banknote,
  Sparkles,
  Calendar,
  Clock,
  User,
  Phone,
  FileSpreadsheet,
  X,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderManagement: React.FC = () => {
  const { orders, customers, staffList, updateOrder, deleteOrder } = useSpaData();

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'paid' | 'debt'>('all');

  // Modals
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.code.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search);

    const matchPayment = paymentFilter === 'all' || o.paymentMethod === paymentFilter;

    const matchDebt =
      debtFilter === 'all'
        ? true
        : debtFilter === 'paid'
        ? o.debtAmount === 0
        : o.debtAmount > 0;

    return matchSearch && matchPayment && matchDebt;
  });

  // Calculate high-level KPIs
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalDebt = orders.reduce((acc, curr) => acc + curr.debtAmount, 0);
  const totalGrossProfit = orders.reduce((acc, curr) => acc + curr.grossProfit, 0);

  const paymentBadges: Record<PaymentMethod, { label: string; color: string; icon: React.ReactNode }> = {
    cash: { label: 'Tiền mặt', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: <Banknote className="w-3 h-3 text-emerald-600" /> },
    vietqr: { label: 'VietQR', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: <QrCode className="w-3 h-3 text-indigo-600" /> },
    card: { label: 'Cà thẻ', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CreditCard className="w-3 h-3 text-blue-600" /> },
    wallet: { label: 'Ví trả trước', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <Wallet className="w-3 h-3 text-purple-600" /> },
    mixed: { label: 'Hỗn hợp', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Sparkles className="w-3 h-3 text-amber-600" /> },
  };

  const handleExportExcel = () => {
    const dataToExport = filteredOrders.map((o) => ({
      'Mã Đơn Hàng': o.code,
      'Ngày Tạo': o.createdAt.slice(0, 16).replace('T', ' '),
      'Khách Hàng': o.customerName,
      'Số Điện Thoại': o.customerPhone,
      'Tổng Tiền Đơn (VND)': o.totalAmount,
      'Đã Thu (VND)': o.paidAmount,
      'Ghi Nhận Công Nợ (VND)': o.debtAmount,
      'Phương Thức': paymentBadges[o.paymentMethod]?.label || o.paymentMethod,
      'Lợi Nhuận Gộp (VND)': o.grossProfit,
      'Người Bán': o.sellerName,
      'Thu Ngân': o.cashierName,
      'Số Mục Mua': o.items.length,
    }));

    excelService.exportToExcel(dataToExport, 'DanhSach_DonHang_LiinSpa', 'DonHang');
  };

  const handleDeleteConfirmed = () => {
    if (!deletingOrder) return;

    const res = deleteOrder(deletingOrder.id);
    if (res.success) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      alert(res.message);
      setDeletingOrder(null);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <span>Quản Lý Đơn Hàng & Hóa Đơn</span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              Admin Only
            </span>
          </h1>
          <p className="text-xs text-slate-500">
            Theo dõi dòng tiền, đối soát thanh toán POS, sửa hoặc xóa đơn hàng tạo sai với cơ chế hoàn tác an toàn
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Xuất Excel Đơn Hàng</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Đơn Hàng</span>
          <div className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            {orders.length} <span className="text-xs font-normal text-slate-400">đơn</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Doanh Số Thực Thu</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-700">
            {formatVND(totalRevenue)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Công Nợ Phát Sinh</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-amber-700">
            {formatVND(totalDebt)}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Lợi Nhuận Gộp (Gross)</span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-rose-700">
            {formatVND(totalGrossProfit)}
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã đơn (HD-...), tên khách, số điện thoại..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="p-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
            >
              <option value="all">Tất cả phương thức</option>
              <option value="cash">Tiền mặt</option>
              <option value="vietqr">VietQR</option>
              <option value="card">Cà thẻ ngân hàng</option>
              <option value="wallet">Ví trả trước</option>
              <option value="mixed">Hỗn hợp</option>
            </select>

            <select
              value={debtFilter}
              onChange={(e) => setDebtFilter(e.target.value as any)}
              className="p-2 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none"
            >
              <option value="all">Tất cả công nợ</option>
              <option value="paid">Đã thanh toán đủ (0đ nợ)</option>
              <option value="debt">Còn nợ (Chưa thu hết)</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100">
              <tr>
                <th className="p-3 rounded-l-xl">Mã Hóa Đơn</th>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Chi Tiết Mặt Hàng</th>
                <th className="p-3 text-right">Tổng Tiền</th>
                <th className="p-3 text-right">Thực Thu</th>
                <th className="p-3 text-right">Công Nợ</th>
                <th className="p-3 text-center">Thanh Toán</th>
                <th className="p-3 text-center rounded-r-xl">Thao Tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const payment = paymentBadges[order.paymentMethod] || {
                    label: order.paymentMethod,
                    color: 'bg-slate-100 text-slate-800',
                    icon: null,
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-rose-800 whitespace-nowrap">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5 text-rose-600" />
                          <span>{order.code}</span>
                        </button>
                      </td>
                      <td className="p-3 text-slate-500 whitespace-nowrap">
                        <div>{order.createdAt.slice(0, 10)}</div>
                        <div className="text-[10px] font-mono text-slate-400">{order.createdAt.slice(11, 16)}</div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{order.customerPhone}</div>
                      </td>
                      <td className="p-3 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[11px] truncate">
                              <span
                                className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                                  item.type === 'service'
                                    ? 'bg-rose-50 text-rose-700'
                                    : item.type === 'package'
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-emerald-50 text-emerald-800'
                                }`}
                              >
                                {item.type === 'service' ? 'DV' : item.type === 'package' ? 'Gói' : 'SP'}
                              </span>
                              <span className="truncate">{item.name} (x{item.quantity})</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatVND(order.totalAmount)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                        {formatVND(order.paidAmount)}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        {order.debtAmount > 0 ? (
                          <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{formatVND(order.debtAmount)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">0 đ</span>
                        )}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${payment.color}`}
                        >
                          {payment.icon}
                          <span>{payment.label}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setViewingOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                            title="Xem chi tiết hóa đơn"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
                            title="Sửa thông tin đơn hàng"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                          </button>
                          <button
                            onClick={() => setDeletingOrder(order)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                            title="Xóa đơn hàng này"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Order Detail Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base">Hóa Đơn: {viewingOrder.code}</h3>
                  <p className="text-[11px] text-rose-200">
                    Thời gian tạo: {viewingOrder.createdAt.slice(0, 16).replace('T', ' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Customer info */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Khách hàng:</span>
                  <strong className="text-slate-900">{viewingOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số điện thoại:</span>
                  <span className="font-mono font-bold text-rose-700">{viewingOrder.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thu ngân / Người bán:</span>
                  <span>{viewingOrder.cashierName} / {viewingOrder.sellerName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 block">Chi tiết các mặt hàng:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {viewingOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">
                          {formatVND(item.price)} x {item.quantity}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-slate-900">
                        {formatVND(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Tổng tiền thanh toán:</span>
                  <strong className="text-slate-900 font-mono">{formatVND(viewingOrder.totalAmount)}</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Khách thực trả:</span>
                  <span className="font-mono">{formatVND(viewingOrder.paidAmount)}</span>
                </div>
                {viewingOrder.debtAmount > 0 && (
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Ghi nhận công nợ:</span>
                    <span className="font-mono">+{formatVND(viewingOrder.debtAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-rose-200/60">
                  <span>Lợi nhuận gộp đơn (Gross Profit):</span>
                  <strong className="text-rose-800 font-mono">{formatVND(viewingOrder.grossProfit)}</strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setViewingOrder(null)}
                className="px-5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSave={(updates) => {
            updateOrder(editingOrder.id, updates);
            confetti({ particleCount: 30, spread: 40, origin: { y: 0.6 } });
            setEditingOrder(null);
            alert(`Đã cập nhật đơn hàng ${editingOrder.code} thành công!`);
          }}
        />
      )}

      {/* Delete Order Confirmation Modal */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-gradient-to-r from-rose-900 to-rose-700 text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">Xác Nhận Xóa Đơn Hàng</h3>
                <p className="text-[11px] text-rose-200">Quyền quản trị viên tối cao (Admin)</p>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-600">
              <p>
                Bạn có chắc chắn muốn xóa đơn hàng <strong className="text-rose-700 font-mono text-sm">{deletingOrder.code}</strong> của khách hàng <strong>"{deletingOrder.customerName}"</strong>?
              </p>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1.5 text-[11px]">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Hệ thống sẽ tự động hoàn tác các dữ liệu sau:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>Trừ giảm chi tiêu và hoàn tác công nợ ({formatVND(deletingOrder.debtAmount)}) của khách hàng.</li>
                  <li>Thu hồi điểm tích lũy thành viên đã cộng từ đơn này.</li>
                  <li>Hoàn trả lại số lượng tồn kho nếu đơn có bán sản phẩm mang về.</li>
                  <li>Thu hồi tiền hoa hồng doanh số đã cộng cho nhân viên bán.</li>
                </ul>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-luxury transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Đơn & Hoàn Tác</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface EditOrderModalProps {
  order: Order;
  onClose: () => void;
  onSave: (updates: Partial<Order>) => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, onClose, onSave }) => {
  const { staffList } = useSpaData();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [paidAmount, setPaidAmount] = useState(order.paidAmount);
  const [sellerId, setSellerId] = useState(order.sellerId);

  const debtAmount = Math.max(0, order.totalAmount - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const seller = staffList.find((s) => s.id === sellerId);

    onSave({
      paymentMethod,
      paidAmount: Number(paidAmount),
      debtAmount,
      sellerId,
      sellerName: seller?.name || order.sellerName,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gradient-to-r from-amber-700 to-rose-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm sm:text-base">Chỉnh Sửa Đơn Hàng: {order.code}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between">
            <span className="text-slate-500">Khách hàng:</span>
            <strong className="text-slate-900">{order.customerName} ({order.customerPhone})</strong>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 flex justify-between font-bold">
            <span className="text-rose-900">Tổng giá trị đơn:</span>
            <span className="font-mono text-rose-800 text-sm">{formatVND(order.totalAmount)}</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Phương thức thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="cash">Tiền mặt (Cash)</option>
              <option value="vietqr">Chuyển khoản VietQR</option>
              <option value="card">Cà thẻ ngân hàng (POS/Card)</option>
              <option value="wallet">Trừ ví trả trước</option>
              <option value="mixed">Hỗn hợp</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Số tiền khách đã trả (VND)</label>
            <input
              type="number"
              min={0}
              max={order.totalAmount}
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-slate-900"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between text-xs">
            <span className="text-amber-900 font-bold">Công nợ tự tính lại:</span>
            <strong className="font-mono text-amber-800">{formatVND(debtAmount)}</strong>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nhân viên bán (Người hưởng hoa hồng)</label>
            <select
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium"
            >
              {staffList.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.title})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-luxury"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
