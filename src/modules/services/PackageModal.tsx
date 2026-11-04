import React, { useState } from 'react';
import { PackageCombo, PackageServiceItem } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { formatVND } from '../../domain/financial';
import { X, Layers, Plus, Trash2, Sparkles, CheckCircle2, Calculator, Clock, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PackageModalProps {
  packageToEdit?: PackageCombo | null;
  onClose: () => void;
}

export const PackageModal: React.FC<PackageModalProps> = ({ packageToEdit, onClose }) => {
  const { services, addPackage, updatePackage } = useSpaData();

  const isEditing = Boolean(packageToEdit);

  const [name, setName] = useState(packageToEdit?.name || '');
  const [validityDays, setValidityDays] = useState(packageToEdit?.validityDays || 180);
  const [salesCommission, setSalesCommission] = useState(packageToEdit?.salesCommission || 200000);

  // Constituent services
  const [packageServices, setPackageServices] = useState<PackageServiceItem[]>(() => {
    if (packageToEdit?.services && packageToEdit.services.length > 0) {
      return packageToEdit.services.map((s) => ({ ...s }));
    }
    return [
      {
        serviceId: services[0]?.id || 'srv-01',
        serviceName: services[0]?.name || 'Dịch vụ liệu trình',
        sessionCount: 10,
      },
    ];
  });

  // Calculate sum of original single service prices * sessionCount
  const calculatedOriginalPrice = packageServices.reduce((sum, item) => {
    const srv = services.find((s) => s.id === item.serviceId);
    return sum + (srv ? srv.price * item.sessionCount : 0);
  }, 0);

  const [originalPrice, setOriginalPrice] = useState(
    packageToEdit?.originalPrice || (calculatedOriginalPrice > 0 ? calculatedOriginalPrice : 4000000)
  );

  const [price, setPrice] = useState(
    packageToEdit?.price || Math.round((calculatedOriginalPrice > 0 ? calculatedOriginalPrice : 4000000) * 0.8)
  );

  const totalSessions = packageServices.reduce((sum, item) => sum + item.sessionCount, 0);
  const savings = Math.max(0, originalPrice - price);
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  // Handler to add another service
  const handleAddServiceItem = () => {
    const availableService = services.find(
      (s) => !packageServices.some((ps) => ps.serviceId === s.id)
    ) || services[0];

    if (!availableService) return;

    setPackageServices((prev) => [
      ...prev,
      {
        serviceId: availableService.id,
        serviceName: availableService.name,
        sessionCount: 1,
      },
    ]);
  };

  // Handler to update service in row
  const handleServiceChange = (index: number, newServiceId: string) => {
    const srv = services.find((s) => s.id === newServiceId);
    if (!srv) return;

    setPackageServices((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              serviceId: srv.id,
              serviceName: srv.name,
            }
          : item
      )
    );
  };

  // Handler to update session count
  const handleSessionCountChange = (index: number, count: number) => {
    const validCount = Math.max(1, count);
    setPackageServices((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, sessionCount: validCount } : item))
    );
  };

  // Handler to remove a service
  const handleRemoveServiceItem = (index: number) => {
    if (packageServices.length <= 1) {
      alert('Gói combo phải có ít nhất 1 dịch vụ thành phần!');
      return;
    }
    setPackageServices((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Auto-apply calculated original price
  const handleApplyCalculatedOriginal = () => {
    setOriginalPrice(calculatedOriginalPrice);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Vui lòng nhập tên gói combo!');
      return;
    }

    if (packageServices.length === 0) {
      alert('Vui lòng thêm ít nhất 1 dịch vụ vào gói combo!');
      return;
    }

    if (price <= 0) {
      alert('Giá bán gói combo phải lớn hơn 0 VND!');
      return;
    }

    if (isEditing && packageToEdit) {
      updatePackage(packageToEdit.id, {
        name: name.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice),
        validityDays: Number(validityDays),
        salesCommission: Number(salesCommission),
        services: packageServices,
      });
    } else {
      addPackage({
        name: name.trim(),
        price: Number(price),
        originalPrice: Number(originalPrice),
        validityDays: Number(validityDays),
        salesCommission: Number(salesCommission),
        services: packageServices,
      });
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-900 via-amber-800 to-rose-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {isEditing ? 'Chỉnh Sửa Gói Combo Liệu Trình' : 'Tạo Gói Combo Liệu Trình Mới'}
              </h3>
              <p className="text-[11px] text-amber-200">
                Cấu hình các dịch vụ thành phần, số lượng buổi và chính sách giá ưu đãi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Tên Gói Liệu Trình / Combo (*)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Gói Trị Mụn Chuyên Sâu 10 Buổi..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Thời hạn sử dụng (Ngày)</label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium"
                  required
                />
                <span className="absolute right-3 top-2.5 text-slate-400 font-medium">ngày</span>
              </div>
            </div>
          </div>

          {/* Dịch vụ thành phần & Số lượng buổi */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Dịch Vụ Thành Phần & Số Lượng Buổi Trong Gói (*)</span>
                </h4>
                <p className="text-[11px] text-amber-700">
                  Tổng số buổi trị liệu khách hàng nhận được khi mua gói: <strong>{totalSessions} buổi</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddServiceItem}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dịch vụ</span>
              </button>
            </div>

            {/* Service Rows */}
            <div className="space-y-2.5">
              {packageServices.map((item, index) => {
                const srv = services.find((s) => s.id === item.serviceId);
                const itemTotal = (srv?.price || 0) * item.sessionCount;

                return (
                  <div
                    key={index}
                    className="p-3 bg-white rounded-xl border border-amber-200/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">
                        Dịch vụ #{index + 1}
                      </label>
                      <select
                        value={item.serviceId}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {services.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({formatVND(s.price)}/buổi)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 mb-1 text-center">
                          Số buổi
                        </label>
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => handleSessionCountChange(index, item.sessionCount - 1)}
                            className="w-7 h-8 text-slate-600 hover:bg-slate-100 font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.sessionCount}
                            onChange={(e) => handleSessionCountChange(index, Number(e.target.value))}
                            className="w-12 h-8 text-center font-mono font-bold text-amber-700 focus:outline-none border-x border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleSessionCountChange(index, item.sessionCount + 1)}
                            className="w-7 h-8 text-slate-600 hover:bg-slate-100 font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="w-24 text-right">
                        <span className="block text-[10px] text-slate-400">Đơn giá lẻ</span>
                        <span className="font-mono font-bold text-slate-700">{formatVND(itemTotal)}</span>
                      </div>

                      {packageServices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveServiceItem(index)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-3 sm:mt-0"
                          title="Xóa dịch vụ này khỏi gói"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick calculation helper bar */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-amber-900 border-t border-amber-200/50">
              <span className="flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  Tổng giá trị các buổi mua lẻ: <strong>{formatVND(calculatedOriginalPrice)}</strong>
                </span>
              </span>

              {calculatedOriginalPrice !== originalPrice && (
                <button
                  type="button"
                  onClick={handleApplyCalculatedOriginal}
                  className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer text-left sm:text-right"
                >
                  Sử dụng giá trị này làm Giá Gốc niêm yết
                </button>
              )}
            </div>
          </div>

          {/* Chính sách giá & Chiết khấu trọn gói */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giá Bán Ưu Đãi Trọn Gói (VND) (*)</label>
              <input
                type="number"
                step={50000}
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-rose-700 text-sm"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Giá thực tế khách hàng thanh toán tại quầy
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Giá Gốc Niêm Yết (VND)</label>
              <input
                type="number"
                step={50000}
                min={0}
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-medium text-slate-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Tổng giá niêm yết trước khi chiết khấu combo
              </span>
            </div>
          </div>

          {/* Hoa hồng bán gói & Preview chiết khấu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hoa Hồng Bán Gói (Sales Commission)
              </label>
              <input
                type="number"
                step={10000}
                min={0}
                value={salesCommission}
                onChange={(e) => setSalesCommission(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold text-amber-700"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Tiền thưởng trả cho người chốt gói thành công
              </span>
            </div>

            {/* Savings Badge Box */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-center">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                Ưu đãi cho khách hàng
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-emerald-900 font-medium">Tiết kiệm:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {formatVND(savings)} ({savingsPercent}%)
                </span>
              </div>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold shadow-luxury flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'Lưu Thay Đổi Gói Combo' : 'Tạo Gói Combo Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

