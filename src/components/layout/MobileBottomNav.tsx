import React from 'react';
import { TabKey } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  ShoppingBag,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenDrawer,
}) => {
  const { hasPermission } = useAuth();

  const isMoreTabActive = ['services', 'inventory', 'staff', 'excel', 'settings'].includes(activeTab);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex items-center justify-around safe-area-pb">
      {/* 1. Tổng quan */}
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          activeTab === 'dashboard' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1 rounded-xl transition-transform ${activeTab === 'dashboard' ? 'scale-110 bg-rose-50' : ''}`}>
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">Tổng quan</span>
      </button>

      {/* 2. Bán hàng POS */}
      {hasPermission('use_pos') && (
        <button
          onClick={() => onSelectTab('pos')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'pos' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform relative ${activeTab === 'pos' ? 'scale-110 bg-rose-50' : ''}`}>
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">POS Bán hàng</span>
        </button>
      )}

      {/* 3. Lịch hẹn */}
      {hasPermission('view_calendar') && (
        <button
          onClick={() => onSelectTab('booking')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'booking' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'booking' ? 'scale-110 bg-rose-50' : ''}`}>
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Lịch hẹn</span>
        </button>
      )}

      {/* 4. Khách hàng */}
      {hasPermission('manage_customers') && (
        <button
          onClick={() => onSelectTab('customers')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'customers' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-xl transition-transform ${activeTab === 'customers' ? 'scale-110 bg-rose-50' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Khách hàng</span>
        </button>
      )}

      {/* 5. Menu Thêm (Drawer) */}
      <button
        onClick={onOpenDrawer}
        className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
          isMoreTabActive ? 'text-amber-700 font-bold' : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <div className={`p-1 rounded-xl transition-transform ${isMoreTabActive ? 'scale-110 bg-amber-50' : ''}`}>
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">
          {isMoreTabActive ? 'Mục khác •' : 'Thêm'}
        </span>
      </button>
    </nav>
  );
};

