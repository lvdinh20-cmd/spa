import React, { useState, useEffect } from 'react';
import { generateVietQrUrl } from '../../services/vietqr';
import { formatVND } from '../../domain/financial';
import { useSpaData } from '../../context/SpaDataContext';
import { X, CheckCircle, Copy, Check, QrCode } from 'lucide-react';

interface VietQrModalProps {
  amount: number;
  orderCode: string;
  customerName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  amount,
  orderCode,
  customerName,
  onSuccess,
  onClose,
}) => {
  const { settings } = useSpaData();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes countdown

  const qrUrl = generateVietQrUrl(amount, orderCode, {
    bankId: settings.bankId,
    accountNo: settings.accountNo,
    accountName: settings.accountName,
    qrPrefix: settings.qrPrefix,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(settings.accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-sm">Thanh toán VietQR Napas247</h3>
              <p className="text-[11px] text-emerald-200 font-mono">Đơn: {orderCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="text-xs text-slate-500">
            Quét mã qua ứng dụng ngân hàng bất kỳ để thanh toán cho khách{' '}
            <strong className="text-slate-900">{customerName}</strong>
          </div>

          {/* Amount Badge */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Số tiền cần thanh toán</div>
            <div className="text-2xl font-bold text-emerald-800 font-mono mt-0.5">{formatVND(amount)}</div>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white rounded-2xl border-2 border-dashed border-emerald-200 inline-block shadow-sm">
            <img
              src={qrUrl}
              alt="VietQR Payment"
              className="w-56 h-auto mx-auto rounded-lg"
            />
          </div>

          {/* Account Details Box */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Ngân hàng:</span>
              <span className="font-bold text-slate-800">{settings.bankName || settings.bankId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Số tài khoản:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                <span>{settings.accountNo}</span>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Chủ tài khoản:</span>
              <span className="font-bold text-slate-800">{settings.accountName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Nội dung chuyển:</span>
              <span className="font-mono font-bold text-rose-600">{settings.qrPrefix || 'LIINSPA'} {orderCode}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Mã QR tự động hết hạn sau: <span className="font-mono font-bold text-amber-600">{formatCountdown(countdown)}</span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Đổi phương thức khác
            </button>
            <button
              type="button"
              onClick={onSuccess}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xác nhận Đã nhận tiền</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

