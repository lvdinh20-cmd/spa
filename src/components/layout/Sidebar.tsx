import React from 'react';
import { useAuth, PermissionKey } from '../../context/AuthContext';
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
} from 'lucide-react';
import { useSpaData } from '../../context/SpaDataContext';

export type TabKey =
  | 'dashboard'
  | 'booking'
  | 'customers'
  | 'pos'
  | 'orders'
  | 'services'
  | 'inventory'
  | 'staff'
  | 'excel'
  | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  permission?: PermissionKey;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const { hasPermission, currentUser } = useAuth();
  const { settings } = useSpaData();

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Tổng quan',
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

  // Filter items based on user role permissions
  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 justify-between shrink-0 shadow-sm min-h-[calc(100vh-65px)]">
      <div className="p-4 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          Danh mục quản lý
        </div>

        {visibleItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-rose-50 to-amber-50/50 text-rose-700 border border-rose-200/80 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-rose-600' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
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

      {/* Spa Brand Badge at Bottom */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50 to-pink-50 border border-rose-100/80 shadow-sm text-center">
        <div className="text-xs font-bold text-rose-900 mb-0.5 truncate">{settings.spaName || 'Liin Spa & Clinic'}</div>
        <div className="text-[11px] text-slate-600 mb-2 line-clamp-1">{settings.slogan || 'Đẳng cấp làm đẹp chuẩn Y khoa'}</div>
        <div className="inline-block text-[10px] font-semibold text-rose-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-rose-200 font-mono">
          Hotline: {settings.hotline}
        </div>
      </div>
    </aside>
  );
};

