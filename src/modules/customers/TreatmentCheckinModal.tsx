import React, { useState } from 'react';
import { TreatmentCard } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { X, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TreatmentCheckinModalProps {
  card: TreatmentCard;
  onClose: () => void;
}

export const TreatmentCheckinModal: React.FC<TreatmentCheckinModalProps> = ({ card, onClose }) => {
  const { staffList, createTreatmentCheckin } = useSpaData();

  const technicians = staffList.filter((s) => s.role === 'technician' || s.role === 'admin');

  const [primaryTechId, setPrimaryTechId] = useState(technicians[0]?.id || '');
  const [secondaryTechId, setSecondaryTechId] = useState('');
  const [stepsPerformed, setStepsPerformed] = useState(
    'Lấy sạch nhân mụn chuẩn y khoa, chiếu ánh sáng sinh học Bio-Light kháng khuẩn và đắp mặt nạ làm dịu.'
  );
  const [clientReaction, setClientReaction] = useState(
    'Khách hài lòng, không bị châm chích, da giảm đỏ rõ rệt sau đắp nạ.'
  );
  const [beforePhotoUrl, setBeforePhotoUrl] = useState(
    'https://images.unsplash.com/photo-1512290900672-1f551a37c385?auto=format&fit=crop&w=400&q=80'
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  );

  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!primaryTechId) {
      setFeedbackMessage({ text: 'Vui lòng chọn Kỹ thuật viên chính thực hiện.', isError: true });
      return;
    }

    const res = createTreatmentCheckin({
      cardId: card.id,
      primaryTechId,
      secondaryTechId: secondaryTechId || undefined,
      stepsPerformed,
      clientReaction,
      beforePhotoUrl,
      afterPhotoUrl,
    });

    if (res.success) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      alert(res.message);
      onClose();
    } else {
      setFeedbackMessage({ text: res.message, isError: true });
    }
  };

  const nextSessionNumber = card.usedSessions + 1;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg">Check-in Buổi Điều trị #{nextSessionNumber}</h3>
            <p className="text-xs text-rose-200">
              Khách hàng: <span className="font-bold text-white">{card.customerName}</span> ({card.customerPhone})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Card Info Summary */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800">{card.packageName}</div>
              <div className="text-slate-500 mt-0.5">
                Tiến độ: Đã làm <span className="font-bold text-rose-700">{card.usedSessions}</span> / {card.totalSessions} buổi
              </div>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold font-mono text-xs">
                Còn lại: {card.remainingSessions} buổi
              </span>
            </div>
          </div>

          {feedbackMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                feedbackMessage.isError
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {feedbackMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Technicians selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KTV Chính Thực Hiện (*)</label>
              <select
                value={primaryTechId}
                onChange={(e) => setPrimaryTechId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                required
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.title})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KTV Phụ (Nếu có)</label>
              <select
                value={secondaryTechId}
                onChange={(e) => setSecondaryTechId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
              >
                <option value="">-- Không có KTV phụ --</option>
                {technicians
                  .filter((t) => t.id !== primaryTechId)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Steps performed */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Các bước quy trình đã thực hiện</label>
            <textarea
              rows={2}
              value={stepsPerformed}
              onChange={(e) => setStepsPerformed(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Ghi chú chi tiết các bước điều trị..."
            />
          </div>

          {/* Client reaction */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phản ứng của khách & Ghi chú da</label>
            <input
              type="text"
              value={clientReaction}
              onChange={(e) => setClientReaction(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Tình trạng da sau buổi trị liệu..."
            />
          </div>

          {/* Before & After photo simulation */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-600" />
                <span>Hình ảnh Đối chiếu Trước & Sau (Before / After)</span>
              </span>
              <span className="text-[10px] text-slate-400">Tự động gắn tem bảo mật</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Ảnh Trước (Before)</span>
                <img
                  src={beforePhotoUrl}
                  alt="Before"
                  className="w-full h-24 object-cover rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-500 mb-1">Ảnh Sau (After)</span>
                <img
                  src={afterPhotoUrl}
                  alt="After"
                  className="w-full h-24 object-cover rounded-xl border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác nhận Hoàn thành Buổi {nextSessionNumber}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

