import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  Shield,
  UserCheck,
  Stethoscope,
  RotateCcw,
  Menu,
  Crown,
  Flower2,
  Gem,
  Heart,
  LogOut,
} from 'lucide-react';
import { useSpaData } from '../../context/SpaDataContext';

interface NavbarProps {
  onOpenMobileDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileDrawer }) => {
  const { currentUser, logout } = useAuth();
  const { resetDemoData, settings } = useSpaData();

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    admin: {
      label: 'Admin (Chủ Spa)',
      icon: <Shield className="w-4 h-4 text-amber-600" />,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Toàn quyền quản trị, xem P&L, cài đặt hệ thống',
    },
    receptionist: {
      label: 'Lễ tân / Thu ngân',
      icon: <UserCheck className="w-4 h-4 text-rose-600" />,
      color: 'bg-rose-50 text-rose-800 border-rose-200',
      desc: 'Đặt lịch, check-in, POS bán hàng & VietQR',
    },
    technician: {
      label: 'Kỹ thuật viên / Bác sĩ',
      icon: <Stethoscope className="w-4 h-4 text-emerald-600" />,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Xem lịch cá nhân, check-in buổi làm, xem hoa hồng',
    },
  };

  const renderBrandIcon = () => {
    if (settings.logoUrl) {
      return (
        <img
          src={settings.logoUrl}
          alt={settings.spaName}
          className="w-10 h-10 rounded-2xl object-cover shadow-luxury"
        />
      );
    }

    const iconType = settings.iconType || 'sparkles';
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center shadow-luxury text-white shrink-0">
        {iconType === 'crown' && <Crown className="w-5 h-5" />}
        {iconType === 'flower' && <Flower2 className="w-5 h-5" />}
        {iconType === 'gem' && <Gem className="w-5 h-5" />}
        {iconType === 'heart' && <Heart className="w-5 h-5" />}
        {iconType === 'sparkles' && <Sparkles className="w-5 h-5 animate-pulse" />}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Mobile Hamburger + Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {renderBrandIcon()}

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-serif text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-rose-900 via-rose-700 to-amber-700 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
                {settings.spaName || 'LIIN SPA'}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 shrink-0">
                PROMAX
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block truncate max-w-md">
              {settings.slogan || 'Hệ thống Quản trị Thẩm mỹ viện & Spa Cao cấp'}
            </p>
          </div>
        </div>

        {/* Current User Role & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Read-only Current Role Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${
              currentUser.isPrimaryAdmin
                ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
                : roleLabels[currentUser.role]?.color || 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={`Đang đăng nhập với vai trò: ${currentUser.title}`}
          >
            {currentUser.isPrimaryAdmin ? <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> : roleLabels[currentUser.role]?.icon}
            <span>{currentUser.isPrimaryAdmin ? 'Admin Chính (Chủ Spa)' : roleLabels[currentUser.role]?.label || currentUser.title}</span>
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-slate-200">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
              <div className="text-[10px] font-medium text-rose-600">{currentUser.title}</div>
            </div>
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-rose-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-md select-none"
              title={`${currentUser.name} (${currentUser.title})`}
            >
              {currentUser.name.charAt(0)}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc chắn muốn đăng xuất khỏi tài khoản "${currentUser.name}"?`)) {
                logout();
              }
            }}
            title="Đăng xuất khỏi hệ thống"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border border-slate-200 hover:border-rose-200 cursor-pointer text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Khôi phục dữ liệu demo ban đầu của Liin Spa?')) {
                resetDemoData();
              }
            }}
            title="Khôi phục dữ liệu ban đầu"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

