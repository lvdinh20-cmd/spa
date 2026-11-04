import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Staff, UserRole } from '../types';
import { INITIAL_STAFF, storageService } from '../services/storage';

interface AuthContextType {
  currentUser: Staff;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  switchUser: (staffId: string) => void;
  login: (username: string, password: string) => { success: boolean; message?: string };
  quickDemoLogin: (role: UserRole) => void;
  logout: () => void;
  hasPermission: (permission: PermissionKey) => boolean;
  allStaff: Staff[];
  refreshStaff: () => void;
  setPrimaryAdmin: (staffId: string) => void;
}

export type PermissionKey =
  | 'view_dashboard_admin'
  | 'view_dashboard_staff'
  | 'manage_customers'
  | 'checkin_treatment'
  | 'use_pos'
  | 'view_calendar'
  | 'manage_bookings'
  | 'view_inventory'
  | 'manage_inventory'
  | 'manage_services'
  | 'manage_staff'
  | 'view_financial_pl'
  | 'view_own_commissions'
  | 'use_excel_studio'
  | 'manage_settings'
  | 'manage_orders';

const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'view_dashboard_admin',
    'view_dashboard_staff',
    'manage_customers',
    'checkin_treatment',
    'use_pos',
    'view_calendar',
    'manage_bookings',
    'view_inventory',
    'manage_inventory',
    'manage_services',
    'manage_staff',
    'view_financial_pl',
    'view_own_commissions',
    'use_excel_studio',
    'manage_settings',
    'manage_orders',
  ],
  receptionist: [
    'view_dashboard_staff',
    'manage_customers',
    'checkin_treatment',
    'use_pos',
    'view_calendar',
    'manage_bookings',
    'view_inventory',
    'view_own_commissions',
  ],
  technician: [
    'view_dashboard_staff',
    'view_calendar',
    'manage_customers',
    'checkin_treatment',
    'use_pos',
    'view_own_commissions',
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  storageService.init();

  const [allStaff, setAllStaff] = useState<Staff[]>(() => {
    return storageService.get<Staff[]>(storageService.KEYS.STAFF, INITIAL_STAFF);
  });

  const refreshStaff = useCallback(() => {
    const latest = storageService.get<Staff[]>(storageService.KEYS.STAFF, INITIAL_STAFF);
    setAllStaff(latest);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('liin_auth_status') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<Staff>(() => {
    const savedRoleId = localStorage.getItem(storageService.KEYS.CURRENT_USER_ROLE);
    const primaryAdmin = allStaff.find((s) => s.isPrimaryAdmin || s.username === 'liin')
      || allStaff.find((s) => s.role === 'admin')
      || allStaff[0];

    if (!savedRoleId || savedRoleId === 'staff-admin-01' || savedRoleId === 'admin') {
      return primaryAdmin;
    }
    const match = allStaff.find((s) => s.id === savedRoleId || s.username === savedRoleId || s.role === savedRoleId);
    return match || primaryAdmin;
  });

  useEffect(() => {
    localStorage.setItem(storageService.KEYS.CURRENT_USER_ROLE, currentUser.id);
  }, [currentUser]);

  const setPrimaryAdmin = (staffId: string) => {
    const updated = allStaff.map((s) => ({
      ...s,
      isPrimaryAdmin: s.id === staffId,
      ...(s.id === staffId ? { role: 'admin' as UserRole } : {}),
    }));
    const primaryIdx = updated.findIndex((s) => s.id === staffId);
    if (primaryIdx !== -1) {
      const primary = updated.splice(primaryIdx, 1)[0];
      updated.unshift(primary);
    }
    setAllStaff(updated);
    storageService.set(storageService.KEYS.STAFF, updated);

    // If current user is admin, switch to this primary admin
    const target = updated.find((s) => s.id === staffId);
    if (target && (currentUser.role === 'admin' || currentUser.isPrimaryAdmin)) {
      setCurrentUser(target);
    }
  };

  const switchRole = (role: UserRole) => {
    let match: Staff | undefined;
    if (role === 'admin') {
      match = allStaff.find((s) => s.isPrimaryAdmin || s.username === 'liin') || allStaff.find((s) => s.role === 'admin');
    } else {
      match = allStaff.find((s) => s.role === role);
    }
    if (match) {
      setCurrentUser(match);
    }
  };

  const switchUser = (staffId: string) => {
    const match = allStaff.find((s) => s.id === staffId);
    if (match) {
      setCurrentUser(match);
    }
  };

  const login = (username: string, password: string) => {
    // 1. Get the most up-to-date staff list from localStorage
    const latestStaff = storageService.get<Staff[]>(storageService.KEYS.STAFF, allStaff);
    const cleanUser = username.trim().toLowerCase();
    const cleanDigits = username.trim().replace(/\D/g, '');

    // 2. Find matching staff by username (case-insensitive) OR phone number
    let staff = latestStaff.find(
      (s) =>
        s.username.toLowerCase() === cleanUser ||
        (cleanDigits.length >= 8 && s.phone.replace(/\D/g, '') === cleanDigits)
    );

    // 3. Fallback support: 'admin' alias maps to primary admin
    if (!staff && (cleanUser === 'admin' || cleanUser === 'liin')) {
      staff = latestStaff.find((s) => s.isPrimaryAdmin || s.role === 'admin');
    }

    if (!staff) {
      return {
        success: false,
        message: 'Tên đăng nhập hoặc số điện thoại không tồn tại trên hệ thống.',
      };
    }

    // 4. Verify password (matches staff password or default '123456')
    const cleanPass = password.trim();
    if (staff.password && staff.password !== cleanPass && cleanPass !== '123456') {
      return { success: false, message: 'Mật khẩu không chính xác.' };
    }

    setAllStaff(latestStaff);
    setCurrentUser(staff);
    setIsAuthenticated(true);
    localStorage.setItem('liin_auth_status', 'true');
    localStorage.setItem(storageService.KEYS.CURRENT_USER_ROLE, staff.id);
    return { success: true };
  };

  const quickDemoLogin = (role: UserRole) => {
    let match: Staff | undefined;
    if (role === 'admin') {
      match = allStaff.find((s) => s.isPrimaryAdmin || s.username === 'liin') || allStaff.find((s) => s.role === 'admin');
    } else {
      match = allStaff.find((s) => s.role === role);
    }
    const finalUser = match || allStaff[0];
    setCurrentUser(finalUser);
    setIsAuthenticated(true);
    localStorage.setItem('liin_auth_status', 'true');
    localStorage.setItem(storageService.KEYS.CURRENT_USER_ROLE, finalUser.id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('liin_auth_status');
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    return ROLE_PERMISSIONS[currentUser.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        switchRole,
        switchUser,
        login,
        quickDemoLogin,
        logout,
        hasPermission,
        allStaff,
        refreshStaff,
        setPrimaryAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
