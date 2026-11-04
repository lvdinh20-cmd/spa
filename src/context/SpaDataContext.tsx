import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Service,
  PackageCombo,
  TreatmentCard,
  CheckinRecord,
  Order,
  InventoryItem,
  Appointment,
  CommissionEntry,
  Staff,
  UserRole,
  SpaSettings,
} from '../types';
import {
  storageService,
  INITIAL_CUSTOMERS,
  INITIAL_SERVICES,
  INITIAL_PACKAGES,
  INITIAL_CARDS,
  INITIAL_CHECKINS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_APPOINTMENTS,
  INITIAL_COMMISSIONS,
  INITIAL_STAFF,
  INITIAL_SPA_SETTINGS,
} from '../services/storage';
import { depleteServiceBOM } from '../domain/inventory';
import { calculateOrderGrossProfit } from '../domain/financial';
import {
  syncAllToSupabase,
  fetchAllFromSupabase,
  isSupabaseConfigured,
} from '../services/supabase';

interface SpaDataContextType {
  customers: Customer[];
  services: Service[];
  packages: PackageCombo[];
  cards: TreatmentCard[];
  checkins: CheckinRecord[];
  orders: Order[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  commissions: CommissionEntry[];
  staffList: Staff[];
  settings: SpaSettings;

  // Actions
  updateSettings: (updates: Partial<SpaSettings>) => void;
  addCustomer: (cus: Omit<Customer, 'id' | 'createdAt' | 'totalSpend' | 'debtBalance' | 'loyaltyPoints' | 'walletBalance'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  importCustomersBatch: (batch: Partial<Customer>[]) => number;

  addService: (srv: Omit<Service, 'id'>) => Service;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  importServicesBatch: (batch: Partial<Service>[]) => number;

  addPackage: (pkg: Omit<PackageCombo, 'id'>) => PackageCombo;
  updatePackage: (id: string, updates: Partial<PackageCombo>) => void;
  deletePackage: (id: string) => void;
  importPackagesBatch: (batch: Partial<PackageCombo>[]) => number;

  updateTreatmentCard: (id: string, updates: Partial<TreatmentCard>) => void;

  addStaff: (staffData: Omit<Staff, 'id'>) => Staff;
  deleteStaff: (id: string) => void;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  setPrimaryAdmin: (id: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  updateStock: (id: string, delta: number) => void;
  importInventoryBatch: (batch: Partial<InventoryItem>[]) => number;

  createTreatmentCheckin: (payload: {
    cardId: string;
    primaryTechId: string;
    secondaryTechId?: string;
    stepsPerformed: string;
    clientReaction: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
  }) => { success: boolean; message: string; checkin?: CheckinRecord; warnings?: string[] };

  createOrder: (orderPayload: Omit<Order, 'id' | 'code' | 'grossProfit' | 'createdAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => { success: boolean; message: string };

  createAppointment: (payload: Omit<Appointment, 'id'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  resetDemoData: () => void;

  // Supabase Cloud Sync
  isCloudConnected: boolean;
  syncToSupabase: () => Promise<{ success: boolean; message: string; details?: any }>;
  syncFromSupabase: () => Promise<{ success: boolean; message: string }>;
}

const SpaDataContext = createContext<SpaDataContextType | undefined>(undefined);

export const SpaDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage keys
  storageService.init();

  const [customers, setCustomers] = useState<Customer[]>(() =>
    storageService.get(storageService.KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
  );
  const [services, setServices] = useState<Service[]>(() =>
    storageService.get(storageService.KEYS.SERVICES, INITIAL_SERVICES)
  );
  const [packages, setPackages] = useState<PackageCombo[]>(() =>
    storageService.get(storageService.KEYS.PACKAGES, INITIAL_PACKAGES)
  );
  const [cards, setCards] = useState<TreatmentCard[]>(() =>
    storageService.get(storageService.KEYS.CARDS, INITIAL_CARDS)
  );
  const [checkins, setCheckins] = useState<CheckinRecord[]>(() =>
    storageService.get(storageService.KEYS.CHECKINS, INITIAL_CHECKINS)
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    storageService.get(storageService.KEYS.ORDERS, INITIAL_ORDERS)
  );
  const [inventory, setInventory] = useState<InventoryItem[]>(() =>
    storageService.get(storageService.KEYS.INVENTORY, INITIAL_INVENTORY)
  );
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    storageService.get(storageService.KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS)
  );
  const [commissions, setCommissions] = useState<CommissionEntry[]>(() =>
    storageService.get(storageService.KEYS.COMMISSIONS, INITIAL_COMMISSIONS)
  );
  const [staffList, setStaffList] = useState<Staff[]>(() =>
    storageService.get(storageService.KEYS.STAFF, INITIAL_STAFF)
  );
  const [settings, setSettings] = useState<SpaSettings>(() =>
    storageService.get(storageService.KEYS.SETTINGS, INITIAL_SPA_SETTINGS)
  );

  // Sync state to LocalStorage
  useEffect(() => storageService.set(storageService.KEYS.SETTINGS, settings), [settings]);
  useEffect(() => storageService.set(storageService.KEYS.CUSTOMERS, customers), [customers]);
  useEffect(() => storageService.set(storageService.KEYS.SERVICES, services), [services]);
  useEffect(() => storageService.set(storageService.KEYS.PACKAGES, packages), [packages]);
  useEffect(() => storageService.set(storageService.KEYS.CARDS, cards), [cards]);
  useEffect(() => storageService.set(storageService.KEYS.CHECKINS, checkins), [checkins]);
  useEffect(() => storageService.set(storageService.KEYS.ORDERS, orders), [orders]);
  useEffect(() => storageService.set(storageService.KEYS.INVENTORY, inventory), [inventory]);
  useEffect(() => storageService.set(storageService.KEYS.APPOINTMENTS, appointments), [appointments]);
  useEffect(() => storageService.set(storageService.KEYS.COMMISSIONS, commissions), [commissions]);
  useEffect(() => storageService.set(storageService.KEYS.STAFF, staffList), [staffList]);

  const updateSettings = (updates: Partial<SpaSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Customer Actions
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'totalSpend' | 'debtBalance' | 'loyaltyPoints' | 'walletBalance'>) => {
    const newCus: Customer = {
      ...data,
      id: `cus-${Date.now()}`,
      totalSpend: 0,
      debtBalance: 0,
      loyaltyPoints: 0,
      walletBalance: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCus, ...prev]);
    return newCus;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const importCustomersBatch = (batch: Partial<Customer>[]) => {
    const existingPhones = new Set(customers.map((c) => c.phone));
    const newItems: Customer[] = [];

    batch.forEach((row) => {
      if (row.phone && !existingPhones.has(row.phone)) {
        existingPhones.add(row.phone);
        newItems.push({
          id: `cus-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fullName: row.fullName || 'Khách hàng',
          phone: row.phone,
          gender: row.gender || 'female',
          birthday: row.birthday || '2000-01-01',
          source: row.source || 'walk_in',
          skinType: row.skinType || 'Bình thường',
          allergies: row.allergies || 'Không',
          notes: row.notes || 'Nhập từ Excel',
          totalSpend: 0,
          debtBalance: 0,
          loyaltyPoints: 0,
          walletBalance: 0,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (newItems.length > 0) {
      setCustomers((prev) => [...newItems, ...prev]);
    }
    return newItems.length;
  };

  // Service & Package Actions
  const addService = (srv: Omit<Service, 'id'>) => {
    const newSrv: Service = {
      ...srv,
      id: `srv-${Date.now()}`,
    };
    setServices((prev) => [newSrv, ...prev]);
    return newSrv;
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const importServicesBatch = (batch: Partial<Service>[]) => {
    const existingCodes = new Set(services.map((s) => s.code.toUpperCase()));
    const newItems: Service[] = [];

    batch.forEach((row) => {
      const code = (row.code || `DV-${Date.now().toString().slice(-4)}`).toUpperCase();
      if (!existingCodes.has(code)) {
        existingCodes.add(code);
        newItems.push({
          id: `srv-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          code,
          name: row.name || 'Dịch vụ mới',
          category: row.category || 'Trị liệu da mặt',
          description: row.description || 'Dịch vụ làm đẹp chuyên sâu Liin Spa.',
          durationMinutes: row.durationMinutes || 60,
          price: row.price || 300000,
          tourFeePrimary: row.tourFeePrimary || 50000,
          tourFeeSecondary: row.tourFeeSecondary || 25000,
          bom: row.bom || [],
          steps: row.steps || [
            'Làm sạch sâu da mặt & tẩy da chết',
            'Xông hơi thông thoáng lỗ chân lông',
            'Thực hiện quy trình điều trị chuyên sâu',
            'Đắp mặt nạ làm dịu da & khóa ẩm',
          ],
        });
      }
    });

    if (newItems.length > 0) {
      setServices((prev) => [...newItems, ...prev]);
    }
    return newItems.length;
  };

  const addPackage = (pkg: Omit<PackageCombo, 'id'>) => {
    const newPkg: PackageCombo = {
      ...pkg,
      id: `pkg-${Date.now()}`,
    };
    setPackages((prev) => [newPkg, ...prev]);
    return newPkg;
  };

  const updatePackage = (id: string, updates: Partial<PackageCombo>) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const importPackagesBatch = (batch: Partial<PackageCombo>[]) => {
    const existingNames = new Set(packages.map((p) => p.name.toLowerCase()));
    const newItems: PackageCombo[] = [];

    batch.forEach((row) => {
      const name = row.name || 'Gói combo mới';
      if (!existingNames.has(name.toLowerCase())) {
        existingNames.add(name.toLowerCase());
        newItems.push({
          id: `pkg-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name,
          price: row.price || 4000000,
          originalPrice: row.originalPrice || 5000000,
          validityDays: row.validityDays || 180,
          salesCommission: row.salesCommission || 200000,
          services: row.services || [
            {
              serviceId: services[0]?.id || 'srv-01',
              serviceName: services[0]?.name || 'Liệu trình làm đẹp trọn gói',
              sessionCount: 10,
            },
          ],
        });
      }
    });

    if (newItems.length > 0) {
      setPackages((prev) => [...newItems, ...prev]);
    }
    return newItems.length;
  };

  const updateTreatmentCard = (id: string, updates: Partial<TreatmentCard>) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Staff Actions
  const addStaff = (staffData: Omit<Staff, 'id'>) => {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Date.now()}`,
    };
    setStaffList((prev) => {
      const updated = [...prev, newStaff];
      storageService.set(storageService.KEYS.STAFF, updated);
      return updated;
    });
    return newStaff;
  };

  const deleteStaff = (id: string) => {
    setStaffList((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      storageService.set(storageService.KEYS.STAFF, updated);
      return updated;
    });
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaffList((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      storageService.set(storageService.KEYS.STAFF, updated);
      return updated;
    });
  };

  const setPrimaryAdmin = (id: string) => {
    setStaffList((prev) => {
      const updated = prev.map((s) => ({
        ...s,
        isPrimaryAdmin: s.id === id,
        ...(s.id === id ? { role: 'admin' as UserRole } : {}),
      }));
      const idx = updated.findIndex((s) => s.id === id);
      if (idx !== -1) {
        const primary = updated.splice(idx, 1)[0];
        updated.unshift(primary);
      }
      return updated;
    });
  };

  // Inventory Actions
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
  };

  const updateStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
    );
  };

  const importInventoryBatch = (batch: Partial<InventoryItem>[]) => {
    const existingSKUs = new Set(inventory.map((i) => i.sku));
    const newItems: InventoryItem[] = [];

    batch.forEach((row) => {
      if (row.sku && !existingSKUs.has(row.sku)) {
        existingSKUs.add(row.sku);
        newItems.push({
          id: `inv-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sku: row.sku,
          barcode: row.barcode || '',
          name: row.name || 'Mặt hàng mới',
          type: row.type || 'consumable',
          unit: row.unit || 'chiếc',
          quantity: row.quantity || 0,
          minThreshold: row.minThreshold || 5,
          costPrice: row.costPrice || 0,
          retailPrice: row.retailPrice || 0,
          expiryDate: row.expiryDate || '2028-12-31',
          batchNumber: row.batchNumber || 'LOT-2026',
        });
      }
    });

    if (newItems.length > 0) {
      setInventory((prev) => [...newItems, ...prev]);
    }
    return newItems.length;
  };

  // Treatment Card Check-in Action
  const createTreatmentCheckin = (payload: {
    cardId: string;
    primaryTechId: string;
    secondaryTechId?: string;
    stepsPerformed: string;
    clientReaction: string;
    beforePhotoUrl?: string;
    afterPhotoUrl?: string;
  }) => {
    const targetCard = cards.find((c) => c.id === payload.cardId);
    if (!targetCard) {
      return { success: false, message: 'Thẻ liệu trình không tồn tại.' };
    }

    if (targetCard.status !== 'active') {
      return { success: false, message: `Thẻ liệu trình đang ở trạng thái "${targetCard.status}", không thể check-in.` };
    }

    if (targetCard.remainingSessions <= 0) {
      return { success: false, message: 'Thẻ liệu trình đã hết số buổi sử dụng.' };
    }

    const primaryTech = staffList.find((s) => s.id === payload.primaryTechId);
    const secondaryTech = payload.secondaryTechId ? staffList.find((s) => s.id === payload.secondaryTechId) : undefined;

    // Find linked package and service
    const pkg = packages.find((p) => p.id === targetCard.packageId);
    const firstServiceItem = pkg?.services[0];
    const service = services.find((s) => s.id === firstServiceItem?.serviceId) || services[0];

    // Decrement session count mathematically
    const newUsed = targetCard.usedSessions + 1;
    const newRemaining = targetCard.totalSessions - newUsed;
    const newStatus = newRemaining === 0 ? 'depleted' : 'active';

    const updatedCard: TreatmentCard = {
      ...targetCard,
      usedSessions: newUsed,
      remainingSessions: newRemaining,
      status: newStatus,
    };

    const newCheckin: CheckinRecord = {
      id: `chk-${Date.now()}`,
      cardId: targetCard.id,
      customerId: targetCard.customerId,
      customerName: targetCard.customerName,
      serviceId: service.id,
      serviceName: service.name,
      sessionNumber: newUsed,
      timestamp: new Date().toISOString(),
      primaryTechId: payload.primaryTechId,
      primaryTechName: primaryTech?.name || 'KTV chính',
      secondaryTechId: payload.secondaryTechId,
      secondaryTechName: secondaryTech?.name,
      stepsPerformed: payload.stepsPerformed,
      clientReaction: payload.clientReaction,
      beforePhotoUrl: payload.beforePhotoUrl,
      afterPhotoUrl: payload.afterPhotoUrl,
    };

    // 1. Update Card & Checkins
    setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    setCheckins((prev) => [newCheckin, ...prev]);

    // 2. Automate BOM stock depletion
    const { updatedInventory, warningItems: warnings } = depleteServiceBOM(service, inventory);
    setInventory(updatedInventory);

    // 3. Credit Tour commissions
    const newCommissions: CommissionEntry[] = [];
    if (primaryTech && service.tourFeePrimary > 0) {
      newCommissions.push({
        id: `com-tour-1-${Date.now()}`,
        staffId: primaryTech.id,
        staffName: primaryTech.name,
        type: 'tour_primary',
        amount: service.tourFeePrimary,
        referenceCode: newCheckin.id,
        description: `Tour KTV chính buổi ${newUsed}: ${service.name} (${targetCard.customerName})`,
        timestamp: new Date().toISOString(),
      });
    }

    if (secondaryTech && service.tourFeeSecondary > 0) {
      newCommissions.push({
        id: `com-tour-2-${Date.now()}`,
        staffId: secondaryTech.id,
        staffName: secondaryTech.name,
        type: 'tour_secondary',
        amount: service.tourFeeSecondary,
        referenceCode: newCheckin.id,
        description: `Tour KTV phụ buổi ${newUsed}: ${service.name} (${targetCard.customerName})`,
        timestamp: new Date().toISOString(),
      });
    }

    if (newCommissions.length > 0) {
      setCommissions((prev) => [...newCommissions, ...prev]);
    }

    return {
      success: true,
      message: `Đã check-in thành công buổi ${newUsed}/${targetCard.totalSessions}. Còn lại ${newRemaining} buổi.`,
      checkin: newCheckin,
      warnings,
    };
  };

  // Order & POS Checkout Action
  const createOrder = (orderPayload: Omit<Order, 'id' | 'code' | 'grossProfit' | 'createdAt'>) => {
    const srvMap = new Map(services.map((s) => [s.id, s]));
    const invMap = new Map(inventory.map((i) => [i.id, i]));

    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `HD-${datePrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const grossProfit = calculateOrderGrossProfit(
      {
        ...orderPayload,
        code,
      },
      srvMap,
      invMap
    );

    const newOrder: Order = {
      ...orderPayload,
      id: `ord-${Date.now()}`,
      code,
      grossProfit,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // 1. Update customer total spend, debt balance, loyalty points
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId) {
          const addedPoints = Math.floor(newOrder.paidAmount / 20000); // 1 point per 20k
          return {
            ...c,
            totalSpend: c.totalSpend + newOrder.paidAmount,
            debtBalance: c.debtBalance + newOrder.debtAmount,
            loyaltyPoints: c.loyaltyPoints + addedPoints,
          };
        }
        return c;
      })
    );

    // 2. If selling Packages, generate customer Treatment Cards
    const newCards: TreatmentCard[] = [];
    newOrder.items.forEach((item) => {
      if (item.type === 'package') {
        const pkg = packages.find((p) => p.id === item.itemId);
        if (pkg) {
          const totalSessions = pkg.services.reduce((acc, s) => acc + s.sessionCount, 0);
          const expDate = new Date();
          expDate.setDate(expDate.getDate() + pkg.validityDays);

          newCards.push({
            id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            customerId: newOrder.customerId,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone,
            packageId: pkg.id,
            packageName: pkg.name,
            totalSessions,
            usedSessions: 0,
            remainingSessions: totalSessions,
            status: 'active',
            activatedDate: new Date().toISOString(),
            expiryDate: expDate.toISOString(),
          });
        }
      }
    });

    if (newCards.length > 0) {
      setCards((prev) => [...newCards, ...prev]);
    }

    // 3. If selling Retail Products, decrement commercial stock
    setInventory((prev) =>
      prev.map((inv) => {
        const soldItem = newOrder.items.find((i) => i.type === 'product' && i.itemId === inv.id);
        if (soldItem) {
          return { ...inv, quantity: Math.max(0, inv.quantity - soldItem.quantity) };
        }
        return inv;
      })
    );

    // 4. Record sales commission for the seller
    if (newOrder.sellerId) {
      const seller = staffList.find((s) => s.id === newOrder.sellerId);
      if (seller) {
        const commissionAmount = Math.round(newOrder.totalAmount * (seller.salesCommissionRate / 100));
        if (commissionAmount > 0) {
          setCommissions((prev) => [
            {
              id: `com-sale-${Date.now()}`,
              staffId: seller.id,
              staffName: seller.name,
              type: 'sales_package',
              amount: commissionAmount,
              referenceCode: newOrder.code,
              description: `Hoa hồng bán đơn hàng ${newOrder.code} (${seller.salesCommissionRate}%)`,
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ]);
        }
      }
    }

    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const existing = orders.find((o) => o.id === id);
    if (!existing) return;

    // If paid amount or debt amount is edited, update customer balances
    const paidDiff = updates.paidAmount !== undefined ? updates.paidAmount - existing.paidAmount : 0;
    const debtDiff = updates.debtAmount !== undefined ? updates.debtAmount - existing.debtAmount : 0;

    if (paidDiff !== 0 || debtDiff !== 0) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === existing.customerId) {
            return {
              ...c,
              totalSpend: Math.max(0, c.totalSpend + paidDiff),
              debtBalance: Math.max(0, c.debtBalance + debtDiff),
            };
          }
          return c;
        })
      );
    }

    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteOrder = (id: string) => {
    const target = orders.find((o) => o.id === id);
    if (!target) {
      return { success: false, message: 'Đơn hàng không tồn tại trên hệ thống.' };
    }

    // 1. Rollback customer financial totals
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === target.customerId) {
          const pointsRefund = Math.floor(target.paidAmount / 20000);
          return {
            ...c,
            totalSpend: Math.max(0, c.totalSpend - target.paidAmount),
            debtBalance: Math.max(0, c.debtBalance - target.debtAmount),
            loyaltyPoints: Math.max(0, c.loyaltyPoints - pointsRefund),
          };
        }
        return c;
      })
    );

    // 2. Rollback inventory stock for sold retail products
    setInventory((prev) =>
      prev.map((inv) => {
        const sold = target.items.find((i) => i.type === 'product' && i.itemId === inv.id);
        if (sold) {
          return { ...inv, quantity: inv.quantity + sold.quantity };
        }
        return inv;
      })
    );

    // 3. Rollback any treatment cards created by this order that haven't been used yet
    setCards((prev) =>
      prev.filter((c) => {
        const isFromThisOrder =
          c.customerId === target.customerId &&
          c.usedSessions === 0 &&
          target.items.some((i) => i.type === 'package' && i.itemId === c.packageId);
        return !isFromThisOrder;
      })
    );

    // 4. Rollback sales commissions for this order
    setCommissions((prev) => prev.filter((com) => com.referenceCode !== target.code));

    // 5. Remove order from list
    setOrders((prev) => prev.filter((o) => o.id !== id));

    return {
      success: true,
      message: `Đã xóa đơn hàng ${target.code} thành công và hoàn tác toàn bộ công nợ, tồn kho.`,
    };
  };

  // Appointment Actions
  const createAppointment = (payload: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...payload,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
    return newApt;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const apt = appointments.find((a) => a.id === id);

    // If completing an appointment booked with a treatment card, decrement card session count
    if (status === 'completed' && apt && apt.cardId && !apt.sessionDeducted) {
      const targetCard = cards.find((c) => c.id === apt.cardId);
      if (targetCard && targetCard.remainingSessions > 0) {
        const newUsed = targetCard.usedSessions + 1;
        const newRemaining = Math.max(0, targetCard.remainingSessions - 1);
        const newStatus = newRemaining === 0 ? 'depleted' : 'active';

        // 1. Update Card in storage
        setCards((prev) =>
          prev.map((c) =>
            c.id === targetCard.id
              ? {
                  ...c,
                  usedSessions: newUsed,
                  remainingSessions: newRemaining,
                  status: newStatus,
                }
              : c
          )
        );

        // 2. Automatically generate Checkin record for tracking
        const newCheckin: CheckinRecord = {
          id: `chk-online-${Date.now()}`,
          cardId: targetCard.id,
          customerId: targetCard.customerId,
          customerName: targetCard.customerName,
          serviceId: apt.serviceId || 'srv-01',
          serviceName: apt.serviceName,
          sessionNumber: newUsed,
          timestamp: new Date().toISOString(),
          primaryTechId: apt.staffId,
          primaryTechName: apt.staffName || 'KTV chính',
          stepsPerformed: `Hoàn tất ca làm đẹp buổi ${newUsed}/${targetCard.totalSessions} theo lịch hẹn online`,
          clientReaction: 'Hài lòng sau dịch vụ',
        };
        setCheckins((prev) => [newCheckin, ...prev]);

        // 3. Mark appointment session as deducted
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status, sessionDeducted: true } : a))
        );
        return;
      }
    }

    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const resetDemoData = () => {
    localStorage.clear();
    setCustomers(INITIAL_CUSTOMERS);
    setServices(INITIAL_SERVICES);
    setPackages(INITIAL_PACKAGES);
    setCards(INITIAL_CARDS);
    setCheckins(INITIAL_CHECKINS);
    setOrders(INITIAL_ORDERS);
    setInventory(INITIAL_INVENTORY);
    setAppointments(INITIAL_APPOINTMENTS);
    setCommissions(INITIAL_COMMISSIONS);
    setStaffList(INITIAL_STAFF);
    setSettings(INITIAL_SPA_SETTINGS);
    window.location.reload();
  };

  const isCloudConnected = isSupabaseConfigured();

  const syncToSupabaseHandler = async () => {
    return await syncAllToSupabase({
      settings,
      staffList,
      customers,
      services,
      packages,
      cards,
      checkins,
      orders,
      inventory,
      appointments,
      commissions,
    });
  };

  const syncFromSupabaseHandler = async () => {
    const res = await fetchAllFromSupabase();
    if (res.success && res.data) {
      if (res.data.settings) setSettings(res.data.settings);
      if (res.data.staffList && res.data.staffList.length > 0) setStaffList(res.data.staffList);
      if (res.data.customers && res.data.customers.length > 0) setCustomers(res.data.customers);
      if (res.data.services && res.data.services.length > 0) setServices(res.data.services);
      if (res.data.packages && res.data.packages.length > 0) setPackages(res.data.packages);
      if (res.data.cards && res.data.cards.length > 0) setCards(res.data.cards);
      if (res.data.checkins && res.data.checkins.length > 0) setCheckins(res.data.checkins);
      if (res.data.orders && res.data.orders.length > 0) setOrders(res.data.orders);
      if (res.data.inventory && res.data.inventory.length > 0) setInventory(res.data.inventory);
      if (res.data.appointments && res.data.appointments.length > 0) setAppointments(res.data.appointments);
      if (res.data.commissions) setCommissions(res.data.commissions);
      return { success: true, message: res.message };
    }
    return { success: false, message: res.message || 'Không thể đồng bộ dữ liệu' };
  };

  return (
    <SpaDataContext.Provider
      value={{
        customers,
        services,
        packages,
        cards,
        checkins,
        orders,
        inventory,
        appointments,
        commissions,
        staffList,
        settings,
        updateSettings,
        addCustomer,
        updateCustomer,
        importCustomersBatch,
        addService,
        updateService,
        deleteService,
        importServicesBatch,
        addPackage,
        updatePackage,
        deletePackage,
        importPackagesBatch,
        updateTreatmentCard,
        addStaff,
        deleteStaff,
        updateStaff,
        setPrimaryAdmin,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        updateStock,
        importInventoryBatch,
        createTreatmentCheckin,
        createOrder,
        updateOrder,
        deleteOrder,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        resetDemoData,
        isCloudConnected,
        syncToSupabase: syncToSupabaseHandler,
        syncFromSupabase: syncFromSupabaseHandler,
      }}
    >
      {children}
    </SpaDataContext.Provider>
  );
};

export const useSpaData = () => {
  const context = useContext(SpaDataContext);
  if (!context) {
    throw new Error('useSpaData must be used within a SpaDataProvider');
  }
  return context;
};
