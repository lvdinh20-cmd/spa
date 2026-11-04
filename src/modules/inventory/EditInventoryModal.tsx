import React, { useState } from 'react';
import { InventoryItem, InventoryType } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { X, Package, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditInventoryModalProps {
  item: InventoryItem;
  onClose: () => void;
}

export const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ item, onClose }) => {
  const { updateInventoryItem } = useSpaData();

  const [sku, setSku] = useState(item.sku);
  const [name, setName] = useState(item.name);
  const [type, setType] = useState<InventoryType>(item.type);
  const [unit, setUnit] = useState(item.unit);
  const [quantity, setQuantity] = useState(item.quantity);
  const [minThreshold, setMinThreshold] = useState(item.minThreshold);
  const [costPrice, setCostPrice] = useState(item.costPrice);
  const [retailPrice, setRetailPrice] = useState(item.retailPrice);
  const [expiryDate, setExpiryDate] = useState(
    item.expiryDate ? item.expiryDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [batchNumber, setBatchNumber] = useState(item.batchNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sku || !name || !unit) {
      alert('Vui lòng điền đầy đủ Mã SKU, Tên mặt hàng và Đơn vị tính!');
      return;
    }

    updateInventoryItem(item.id, {
      sku: sku.toUpperCase(),
      name,
      type,
      unit,
      quantity: Number(quantity),
      minThreshold: Number(minThreshold),
      costPrice: Number(costPrice),
      retailPrice: type === 'commercial' ? Number(retailPrice) : 0,
      expiryDate,
      batchNumber,
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Cập Nhật Thông Tin Hàng Hóa</h3>
              <p className="text-[11px] text-rose-200">Mã SKU: {item.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mã SKU (*)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold uppercase"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Phân loại Kho</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as InventoryType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
              >
                <option value="consumable">Kho Tiêu Hao Nội Bộ (Làm dịch vụ)</option>
                <option value="commercial">Kho Thương Mại (Bán lẻ mang về)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Hàng Hóa / Mỹ Phẩm (*)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đơn vị tính (*)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="ml, chai, lọ..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số lượng tồn kho</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Định mức tối thiểu</label>
              <input
                type="number"
                min={0}
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-rose-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giá vốn (VND)</label>
              <input
                type="number"
                min={0}
                step={1000}
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                required
              />
            </div>

            {type === 'commercial' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">Giá bán lẻ niêm yết (VND)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={retailPrice}
                  onChange={(e) => setRetailPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-emerald-700"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-400 mb-1">Giá bán lẻ</label>
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-400 text-center font-medium">
                  Hàng tiêu hao không bán lẻ
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Số Lô sản xuất (Batch/Lot)</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="LOT-2026-01"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hạn sử dụng</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                required
              />
            </div>
          </div>

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
              <span>Lưu Thông Tin Hàng Hóa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

