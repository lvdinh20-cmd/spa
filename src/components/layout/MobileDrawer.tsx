import React from 'react';
import { TabKey } from './Sidebar';
import { useAuth, PermissionKey } from '../../context/AuthContext';
import { useSpaData } from '../../context/SpaDataContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingBag,
  Sparkles,
  Package,
  UserCog,
  FileSpreadsheet,
  Settings,
  Receipt,
  X,
  Crown,
  Flower2,
  Gem,
  Heart,
  Shield,
  UserCheck,
  Stethoscope,
  Phone,
  MapPin,
  LogOut,
} from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onClose: () => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  permission?: PermissionKey;
  badge?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  activeTab,
  onSelectTab,
  onClose,
}) => {
  const { hasPermission, currentUser, logout } = useAuth();
  const { settings } = useSpaData();

  if (!isOpen) return null;

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Tổng quan hệ thống',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      key: 'booking',
      label: 'Lịch hẹn & Giường',
      icon: <Calendar className="w-5 h-5" />,
      permission: 'view_calendar',
    },
    {
      key: 'customers',
      label: 'Khách hàng & Liệu trình',
      icon: <Users className="w-5 h-5" />,
      permission: 'manage_customers',
    },
    {
      key: 'pos',
      label: 'Bán hàng (POS)',
      icon: <ShoppingBag className="w-5 h-5" />,
      permission: 'use_pos',
      badge: 'VietQR',
    },
    {
      key: 'orders',
      label: 'Quản lý Đơn hàng',
      icon: <Receipt className="w-5 h-5" />,
      permission: 'manage_orders',
      badge: 'Admin',
    },
    {
      key: 'services',
      label: 'Dịch vụ & Gói Combo',
      icon: <Sparkles className="w-5 h-5" />,
      permission: 'manage_services',
    },
    {
      key: 'inventory',
      label: 'Quản lý 2 Kho hàng',
      icon: <Package className="w-5 h-5" />,
      permission: 'view_inventory',
    },
    {
      key: 'staff',
      label: currentUser.role === 'technician' ? 'Bảng kê Hoa hồng' : 'Nhân sự & Lương',
      icon: <UserCog className="w-5 h-5" />,
      permission: 'view_own_commissions',
    },
    {
      key: 'excel',
      label: 'Xuất / Nhập Excel',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      permission: 'use_excel_studio',
      badge: 'PRO',
    },
    {
      key: 'settings',
      label: 'Cài đặt & Thương hiệu',
      icon: <Settings className="w-5 h-5" />,
      permission: 'manage_settings',
    },
  ];

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const handleSelect = (key: TabKey) => {
    onSelectTab(key);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Content */}
      <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div>
          <div className="p-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                {settings.iconType === 'crown' && <Crown className="w-5 h-5" />}
                {settings.iconType === 'flower' && <Flower2 className="w-5 h-5" />}
                {settings.iconType === 'gem' && <Gem className="w-5 h-5" />}
                {settings.iconType === 'heart' && <Heart className="w-5 h-5" />}
                {(!settings.iconType || settings.iconType === 'sparkles') && <Sparkles className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm tracking-tight text-white">
                  {settings.spaName || 'LIIN SPA'}
                </h3>
                <p className="text-[10px] text-rose-200 line-clamp-1">
                  {settings.slogan || 'Chuẩn Y khoa'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Authenticated Account Info in Drawer (Read-only) */}
          <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0 select-none">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 truncate">{currentUser.title}</div>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border shrink-0 ${
              currentUser.isPrimaryAdmin
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : currentUser.role === 'admin'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : currentUser.role === 'receptionist'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {currentUser.isPrimaryAdmin ? (
                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
              ) : currentUser.role === 'admin' ? (
                <Shield className="w-3 h-3 text-amber-600" />
              ) : currentUser.role === 'receptionist' ? (
                <UserCheck className="w-3 h-3 text-rose-600" />
              ) : (
                <Stethoscope className="w-3 h-3 text-emerald-600" />
              )}
              <span>
                {currentUser.isPrimaryAdmin
                  ? 'Admin Chính'
                  : currentUser.role === 'admin'
                  ? 'Chủ Spa'
                  : currentUser.role === 'receptionist'
                  ? 'Lễ tân'
                  : 'KTV'}
              </span>
            </div>
          </div>

          {/* Navigation Items List */}
          <div className="p-3 space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phân hệ chức năng
            </div>
            {visibleItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-rose-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        item.badge === 'VietQR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer Info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-2">
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn đăng xuất khỏi tài khoản "${currentUser.name}"?`)) {
                onClose();
                logout();
              }
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold border border-rose-200 text-xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Đăng xuất ({currentUser.name})</span>
          </button>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Phone className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>Hotline: <strong className="font-mono text-slate-900">{settings.hotline}</strong></span>
          </div>
          <div className="flex items-start gap-1.5 text-[10px] text-slate-400">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{settings.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

