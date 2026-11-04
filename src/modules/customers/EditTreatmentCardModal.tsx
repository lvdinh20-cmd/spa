import React, { useState } from 'react';
import { TreatmentCard } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditTreatmentCardModalProps {
  card: TreatmentCard;
  onClose: () => void;
}

export const EditTreatmentCardModal: React.FC<EditTreatmentCardModalProps> = ({ card, onClose }) => {
  const { updateTreatmentCard } = useSpaData();

  const [packageName, setPackageName] = useState(card.packageName);
  const [totalSessions, setTotalSessions] = useState(card.totalSessions);
  const [usedSessions, setUsedSessions] = useState(card.usedSessions);
  const [status, setStatus] = useState<TreatmentCard['status']>(card.status);
  const [expiryDate, setExpiryDate] = useState(
    card.expiryDate ? card.expiryDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  const remainingSessions = Math.max(0, totalSessions - usedSessions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (totalSessions < 1) {
      alert('Tổng số buổi phải lớn hơn hoặc bằng 1!');
      return;
    }

    if (usedSessions < 0 || usedSessions > totalSessions) {
      alert('Số buổi đã làm không hợp lệ (phải từ 0 đến Tổng số buổi)!');
      return;
    }

    let finalStatus = status;
    if (usedSessions >= totalSessions && status === 'active') {
      finalStatus = 'depleted';
    }

    updateTreatmentCard(card.id, {
      packageName,
      totalSessions,
      usedSessions,
      remainingSessions,
      status: finalStatus,
      expiryDate: new Date(expiryDate).toISOString(),
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
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Cập Nhật Thông Tin Thẻ Liệu Trình</h3>
              <p className="text-[11px] text-rose-200">Khách hàng: {card.customerName} ({card.customerPhone})</p>
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
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tên Gói / Liệu Trình (*)</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tổng số buổi</label>
              <input
                type="number"
                min={1}
                max={100}
                value={totalSessions}
                onChange={(e) => setTotalSessions(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Đã thực hiện</label>
              <input
                type="number"
                min={0}
                max={totalSessions}
                value={usedSessions}
                onChange={(e) => setUsedSessions(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-amber-600"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số buổi còn lại</label>
              <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 font-mono font-bold text-rose-600 text-center">
                {remainingSessions} buổi
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Trạng thái thẻ</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TreatmentCard['status'])}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
              >
                <option value="active">Đang sử dụng (Active)</option>
                <option value="paused">Tạm dừng (Paused)</option>
                <option value="depleted">Đã hết buổi (Depleted)</option>
                <option value="expired">Hết hạn (Expired)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hạn sử dụng thẻ</label>
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
              <span>Lưu Thay Đổi Thẻ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

