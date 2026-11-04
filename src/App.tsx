import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SpaDataProvider } from './context/SpaDataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, TabKey } from './components/layout/Sidebar';

import { AdminDashboard } from './modules/dashboard/AdminDashboard';
import { StaffDashboard } from './modules/dashboard/StaffDashboard';
import { CustomerList } from './modules/customers/CustomerList';
import { PosTerminal } from './modules/pos/PosTerminal';
import { OrderManagement } from './modules/orders/OrderManagement';
import { BookingCalendar } from './modules/booking/BookingCalendar';
import { ServiceList } from './modules/services/ServiceList';
import { InventoryManager } from './modules/inventory/InventoryManager';
import { StaffList } from './modules/staff/StaffList';
import { ExcelStudio } from './modules/excel/ExcelStudio';
import { SpaSettingsManager } from './modules/settings/SpaSettingsManager';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileDrawer } from './components/layout/MobileDrawer';
import { PublicOnlineBookingModal } from './modules/booking/PublicOnlineBookingModal';
import { PublicLandingPage } from './modules/booking/PublicLandingPage';
import { ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentUser, hasPermission, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [isOnlineBookingMode, setIsOnlineBookingMode] = useState(() => {
    return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'online_booking';
  });

  const handleExitOnlineBooking = () => {
    setIsOnlineBookingMode(false);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('mode');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  // If user is not logged in, show Public Landing Page (Public Online Booking Form + Login Button + Privacy Policy)
  if (!isAuthenticated) {
    return <PublicLandingPage />;
  }

  if (isOnlineBookingMode) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-4">
        <PublicOnlineBookingModal onClose={handleExitOnlineBooking} />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return currentUser.role === 'admin' ? (
          <AdminDashboard onNavigate={setActiveTab} />
        ) : (
          <StaffDashboard onNavigate={setActiveTab} />
        );

      case 'booking':
        if (!hasPermission('view_calendar')) return <RestrictedAccess role={currentUser.role} />;
        return <BookingCalendar />;

      case 'customers':
        if (!hasPermission('manage_customers')) return <RestrictedAccess role={currentUser.role} />;
        return <CustomerList />;

      case 'pos':
        if (!hasPermission('use_pos')) return <RestrictedAccess role={currentUser.role} />;
        return <PosTerminal />;

      case 'orders':
        if (!hasPermission('manage_orders') && currentUser.role !== 'admin') {
          return <RestrictedAccess role={currentUser.role} />;
        }
        return <OrderManagement />;

      case 'services':
        if (!hasPermission('manage_services')) return <RestrictedAccess role={currentUser.role} />;
        return <ServiceList />;

      case 'inventory':
        if (!hasPermission('view_inventory')) return <RestrictedAccess role={currentUser.role} />;
        return <InventoryManager />;

      case 'staff':
        return <StaffList />;

      case 'excel':
        if (!hasPermission('use_excel_studio')) return <RestrictedAccess role={currentUser.role} />;
        return <ExcelStudio />;

      case 'settings':
        if (!hasPermission('manage_settings')) return <RestrictedAccess role={currentUser.role} />;
        return <SpaSettingsManager />;

      default:
        return <AdminDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-rose-200">
      <Navbar onOpenMobileDrawer={() => setShowMobileDrawer(true)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Drawer (Slide-over navigation) */}
      <MobileDrawer
        isOpen={showMobileDrawer}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onClose={() => setShowMobileDrawer(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenDrawer={() => setShowMobileDrawer(true)}
      />
    </div>
  );
};

const RestrictedAccess: React.FC<{ role: string }> = ({ role }) => (
  <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm max-w-md mx-auto my-12 space-y-3">
    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
      <ShieldAlert className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-slate-900 text-base">Truy Cập Bị Giới Hạn</h3>
    <p className="text-xs text-slate-500">
      Tài khoản hiện tại với vai trò <strong className="text-rose-700 capitalize">{role}</strong> không có quyền truy cập vào phân hệ này. Vui lòng đăng nhập với tài khoản có quyền phù hợp hoặc liên hệ Admin.
    </p>
  </div>
);

export function App() {
  return (
    <AuthProvider>
      <SpaDataProvider>
        <MainLayout />
      </SpaDataProvider>
    </AuthProvider>
  );
}

export default App;

