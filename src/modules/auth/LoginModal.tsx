import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSpaData } from '../../context/SpaDataContext';
import {
  Lock,
  User,
  KeyRound,
  X,
  Sparkles,
  AlertCircle,
  Flower2,
  Crown,
  Gem,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const { login } = useAuth();
  const { settings } = useSpaData();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = login(username.trim(), password);
    if (!res.success) {
      setErrorMsg(res.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
      return;
    }

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    if (onLoginSuccess) onLoginSuccess();
    onClose();
  };

  const renderBrandIcon = () => {
    if (settings.logoUrl) {
      return (
        <img
          src={settings.logoUrl}
          alt={settings.spaName}
          className="w-12 h-12 rounded-2xl object-cover shadow-luxury"
        />
      );
    }

    const iconType = settings.iconType || 'sparkles';
    return (
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center shadow-luxury text-white shrink-0">
        {iconType === 'crown' && <Crown className="w-6 h-6" />}
        {iconType === 'flower' && <Flower2 className="w-6 h-6" />}
        {iconType === 'gem' && <Gem className="w-6 h-6" />}
        {iconType === 'heart' && <Heart className="w-6 h-6" />}
        {iconType === 'sparkles' && <Sparkles className="w-6 h-6 animate-pulse" />}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {renderBrandIcon()}
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  {settings.spaName || 'LIIN SPA'}
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-rose-500/40 text-amber-200 border border-amber-300/30">
                  PORTAL
                </span>
              </div>
              <p className="text-xs text-rose-200 mt-0.5">
                Đăng nhập hệ thống quản trị nội bộ
              </p>
            </div>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tên đăng nhập / Số điện thoại</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tên đăng nhập hoặc số điện thoại..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-700 hover:from-rose-700 hover:to-amber-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all flex items-center justify-center gap-2 cursor-pointer pt-2.5"
            >
              <Lock className="w-4 h-4" />
              <span>Đăng Nhập Quản Trị</span>
            </button>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Chỉ dành cho cán bộ nhân viên được ủy quyền của {settings.spaName}.
        </div>
      </div>
    </div>
  );
};

