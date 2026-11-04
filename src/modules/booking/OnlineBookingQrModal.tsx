import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { PublicOnlineBookingModal } from './PublicOnlineBookingModal';

interface OnlineBookingQrModalProps {
  onClose: () => void;
}

export const OnlineBookingQrModal: React.FC<OnlineBookingQrModalProps> = ({ onClose }) => {
  const { settings } = useSpaData();
  const [copied, setCopied] = useState(false);
  const [showLiveSimulator, setShowLiveSimulator] = useState(false);

  // Online booking URL (supports standalone parameter or simulator)
  const bookingUrl = `${window.location.origin}${window.location.pathname}?mode=online_booking`;

  // Standard QR API generator
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
    bookingUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="font-bold text-base">Mã QR Đặt Chỗ Online</h3>
                <p className="text-[11px] text-rose-200">Quét mã bằng Camera điện thoại hoặc Zalo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* QR Container & Body */}
          <div className="p-6 text-center space-y-4 text-xs">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm text-slate-900">
                {settings.spaName || 'Liin Spa & Clinic'}
              </h4>
              <p className="text-slate-500 text-[11px]">
                In mã này đặt tại quầy lễ tân, fanpage hoặc gửi qua tin nhắn để khách tự đặt lịch
              </p>
            </div>

            {/* QR Card */}
            <div className="p-4 bg-gradient-to-b from-rose-50/50 to-amber-50/50 rounded-3xl border border-rose-200/80 inline-block shadow-sm">
              <img
                src={qrImageUrl}
                alt="QR Code Booking Online"
                className="w-52 h-52 mx-auto rounded-2xl shadow-md border-4 border-white object-contain"
              />
              <div className="mt-2.5 text-[11px] font-bold text-rose-800 flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Quét mã để giữ chỗ 30 giây</span>
              </div>
            </div>

            {/* 4-Step Smart Process Flow */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2">
              <span className="font-bold text-slate-800 text-[11px] block uppercase tracking-wider">
                Quy trình tự động hóa thông minh:
              </span>
              <ul className="space-y-1.5 text-[11px] text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">1.</span>
                  <span>Khách chỉ cần nhập <strong>Họ tên & Số điện thoại</strong>, chọn dịch vụ và giờ hẹn.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">2.</span>
                  <span><strong>Tự động đối chiếu lịch & giường</strong> tránh xung đột lịch hẹn.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">3.</span>
                  <span>SĐT có sẵn sẽ <strong>tự động đồng bộ khách quen</strong>, SĐT mới <strong>tự tạo khách</strong>.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-600 font-bold shrink-0">4.</span>
                  <span>Báo email về Gmail chính: <strong className="font-mono text-slate-900">{settings.email}</strong> để Admin duyệt.</span>
                </li>
              </ul>
            </div>

            {/* Copy Link & Test Button */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={bookingUrl}
                  className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-[10px] font-mono text-slate-600 select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              <button
                onClick={() => setShowLiveSimulator(true)}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Mở Giao Diện Đặt Lịch (Khách Hàng)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal */}
      {showLiveSimulator && (
        <PublicOnlineBookingModal
          onClose={() => setShowLiveSimulator(false)}
          onBookingSuccess={() => {
            setShowLiveSimulator(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

