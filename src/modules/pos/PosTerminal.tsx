import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { useAuth } from '../../context/AuthContext';
import { OrderItem, PaymentMethod } from '../../types';
import { formatVND } from '../../domain/financial';
import {
  ShoppingBag,
  Plus,
  Trash2,
  QrCode,
  CreditCard,
  Banknote,
  Wallet,
  Receipt,
  Search,
  UserPlus,
} from 'lucide-react';
import { VietQrModal } from './VietQrModal';
import { QuickAddCustomerModal } from '../customers/QuickAddCustomerModal';
import { CustomerSearchSelect } from '../../components/common/CustomerSearchSelect';
import confetti from 'canvas-confetti';

export const PosTerminal: React.FC = () => {
  const { services, packages, inventory, customers, staffList, createOrder } = useSpaData();
  const { currentUser } = useAuth();

  // Commercial retail products only
  const retailProducts = inventory.filter((i) => i.type === 'commercial');

  // Active Category Tab in Catalog
  const [activeCatalog, setActiveCatalog] = useState<'service' | 'package' | 'product'>('service');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Cart State
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [sellerId, setSellerId] = useState(currentUser.id);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vietqr');
  const [partialPaidInput, setPartialPaidInput] = useState<string>(''); // For deposit/installment

  // VietQR Modal
  const [showVietQrModal, setShowVietQrModal] = useState(false);
  const [pendingOrderCode, setPendingOrderCode] = useState('');

  // Quick Add Customer Modal
  const [showQuickAddCustomer, setShowQuickAddCustomer] = useState(false);

  // Last Created Invoice Modal
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Add Item to Cart
  const handleAddToCart = (type: 'service' | 'package' | 'product', item: any) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) => (i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [
        ...prev,
        {
          type,
          itemId: item.id,
          name: item.name,
          quantity: 1,
          price: item.price || item.retailPrice || 0,
        },
      ];
    });
  };

  // Update Cart Qty
  const handleUpdateQty = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Partial or full payment
  const paidAmount = partialPaidInput !== '' ? Math.min(totalAmount, Math.max(0, Number(partialPaidInput))) : totalAmount;
  const debtAmount = totalAmount - paidAmount;

  // Checkout trigger
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống! Vui lòng chọn dịch vụ hoặc sản phẩm.');
      return;
    }

    if (!selectedCustomer) {
      alert('Vui lòng chọn khách hàng.');
      return;
    }

    const seller = staffList.find((s) => s.id === sellerId) || currentUser;

    // If payment method is VietQR and not yet confirmed, open VietQR modal
    if (paymentMethod === 'vietqr' && !showVietQrModal) {
      const previewCode = `HD-${Date.now().toString().slice(-6)}`;
      setPendingOrderCode(previewCode);
      setShowVietQrModal(true);
      return;
    }

    finishOrder();
  };

  const finishOrder = () => {
    const seller = staffList.find((s) => s.id === sellerId) || currentUser;

    const order = createOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      customerPhone: selectedCustomer.phone,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      sellerId: seller.id,
      sellerName: seller.name,
      items: cartItems,
      subtotal,
      discountAmount,
      totalAmount,
      paidAmount,
      debtAmount,
      paymentMethod,
    });

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    setCompletedOrder(order);
    setShowVietQrModal(false);
    setCartItems([]);
    setDiscountAmount(0);
    setPartialPaidInput('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
          Điểm Bán Hàng & Thu Ngân (POS)
        </h1>
        <p className="text-xs text-slate-500">
          Kết hợp Dịch vụ lẻ + Gói Combo + Mỹ phẩm trên 1 đơn hàng, tạo mã VietQR động & tính lợi nhuận tức thì
        </p>
      </div>

      {/* Grid: 2 Columns (Catalog on Left 7 cols, Cart & Payment on Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product & Service Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          {/* Catalog Type Pills & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveCatalog('service')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCatalog === 'service' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                💆 Dịch vụ Lẻ ({services.length})
              </button>
              <button
                onClick={() => setActiveCatalog('package')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCatalog === 'package' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                ✨ Gói Combo ({packages.length})
              </button>
              <button
                onClick={() => setActiveCatalog('product')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeCatalog === 'product' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                🧴 Mỹ phẩm Bán lẻ ({retailProducts.length})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Tìm món..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 w-44"
              />
            </div>
          </div>

          {/* Catalog Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1">
            {activeCatalog === 'service' &&
              services
                .filter((s) => s.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                .map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => handleAddToCart('service', srv)}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-rose-300 bg-slate-50/50 hover:bg-rose-50/30 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-mono text-rose-600 font-semibold">{srv.code}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 text-[10px] font-medium">{srv.category}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-rose-700 transition-colors">
                        {srv.name}
                      </h4>
                      {srv.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                          {srv.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="font-bold text-sm text-slate-900">{formatVND(srv.price)}</span>
                      <button className="w-7 h-7 rounded-lg bg-white group-hover:bg-rose-600 group-hover:text-white border border-slate-200 group-hover:border-rose-600 flex items-center justify-center transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

            {activeCatalog === 'package' &&
              packages
                .filter((p) => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                .map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handleAddToCart('package', pkg)}
                    className="p-3.5 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-rose-50/30 hover:border-amber-400 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-1">
                        Gói Trọn Gói {pkg.validityDays} ngày
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-800 transition-colors">
                        {pkg.name}
                      </h4>
                      <div className="text-[10px] text-slate-400 line-through mt-1">
                        {formatVND(pkg.originalPrice)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-100">
                      <span className="font-bold text-sm text-rose-700">{formatVND(pkg.price)}</span>
                      <button className="w-7 h-7 rounded-lg bg-white group-hover:bg-amber-500 group-hover:text-white border border-amber-200 flex items-center justify-center transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

            {activeCatalog === 'product' &&
              retailProducts
                .filter((p) => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                .map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => handleAddToCart('product', prod)}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/50 hover:bg-emerald-50/30 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-mono">{prod.sku}</span>
                        <span>Còn {prod.quantity} {prod.unit}</span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {prod.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="font-bold text-sm text-slate-900">{formatVND(prod.retailPrice)}</span>
                      <button className="w-7 h-7 rounded-lg bg-white group-hover:bg-emerald-600 group-hover:text-white border border-slate-200 flex items-center justify-center transition-all shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
          </div>
        </div>

        {/* Right Column: Order Checkout & Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Customer & Staff Selector */}
            <div className="space-y-3 text-xs">
              <CustomerSearchSelect
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={(c) => setSelectedCustomerId(c.id)}
                onOpenQuickAdd={() => setShowQuickAddCustomer(true)}
                placeholder="Gõ tên hoặc vài số ĐT để tìm khách..."
              />

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Người chốt đơn (Hoa hồng)</label>
                <select
                  value={sellerId}
                  onChange={(e) => setSellerId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.salesCommissionRate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 border-t border-b border-slate-100 py-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Món đã chọn ({cartItems.length})</span>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCartItems([])}
                    className="text-[10px] text-rose-600 hover:underline"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chưa có món nào trong đơn. Bấm vào dịch vụ hoặc sản phẩm bên trái để thêm!
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-slate-800 line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{formatVND(item.price)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <button
                          onClick={() => handleUpdateQty(item.itemId, -1)}
                          className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-slate-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.itemId, 1)}
                          className="px-2 py-0.5 text-slate-500 hover:bg-slate-100 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleUpdateQty(item.itemId, -item.quantity)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tạm tính:</span>
                <span className="font-bold text-slate-900">{formatVND(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Giảm giá / Voucher (VND):</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={discountAmount || ''}
                  onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-28 p-1.5 text-right rounded-lg border border-slate-200 font-mono font-bold text-rose-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t">
                <span>Tổng phải thu:</span>
                <span className="text-base text-rose-700">{formatVND(totalAmount)}</span>
              </div>

              {/* Deposit / Partial payment input */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                  <span>Khách thanh toán trước (Cọc/Đợt 1):</span>
                  <input
                    type="number"
                    min="0"
                    max={totalAmount}
                    value={partialPaidInput}
                    onChange={(e) => setPartialPaidInput(e.target.value)}
                    placeholder="Mặc định trả đủ"
                    className="w-28 p-1 text-right rounded-md border border-amber-300 font-mono font-bold text-xs"
                  />
                </div>
                {debtAmount > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-rose-700 font-bold">
                    <span>Ghi nhận công nợ còn lại:</span>
                    <span>{formatVND(debtAmount)}</span>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Phương thức thanh toán</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('vietqr')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'vietqr'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[10px] block">VietQR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'cash'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[10px] block">Tiền mặt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[10px] block">Quẹt thẻ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'wallet'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[10px] block">Ví {formatVND(selectedCustomer?.walletBalance || 0)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <button
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-luxury flex items-center justify-center gap-2 transition-all ${
              cartItems.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-700 hover:to-amber-800 text-white'
            }`}
          >
            {paymentMethod === 'vietqr' ? <QrCode className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
            <span>
              {paymentMethod === 'vietqr' ? 'Tạo mã VietQR & Thanh toán' : 'Xác nhận Thanh toán Đơn hàng'}
            </span>
          </button>
        </div>
      </div>

      {/* VietQR Modal */}
      {showVietQrModal && (
        <VietQrModal
          amount={paidAmount}
          orderCode={pendingOrderCode}
          customerName={selectedCustomer?.fullName || 'Khách hàng'}
          onSuccess={finishOrder}
          onClose={() => setShowVietQrModal(false)}
        />
      )}

      {/* Completed Order Invoice Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Thanh toán Thành Công!</h3>
              <p className="text-xs text-slate-500 font-mono">Mã hóa đơn: {completedOrder.code}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-bold">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Người thu ngân:</span>
                <span>{completedOrder.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hình thức:</span>
                <span className="uppercase font-bold text-emerald-700">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t">
                <span>Số tiền đã thanh toán:</span>
                <span className="text-rose-700">{formatVND(completedOrder.paidAmount)}</span>
              </div>
              {completedOrder.debtAmount > 0 && (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Ghi nợ đợt sau:</span>
                  <span>{formatVND(completedOrder.debtAmount)}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setCompletedOrder(null)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md"
            >
              Đóng & Tiếp tục Bán hàng
            </button>
          </div>
        </div>
      )}
      {/* Quick Add Customer Modal */}
      {showQuickAddCustomer && (
        <QuickAddCustomerModal
          onClose={() => setShowQuickAddCustomer(false)}
          onCustomerCreated={(newCus) => setSelectedCustomerId(newCus.id)}
        />
      )}
    </div>
  );
};

