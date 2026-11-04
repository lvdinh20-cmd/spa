import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  SpaSettings,
} from '../types';

const SUPABASE_CONFIG_KEY = 'liin_spa_supabase_config';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseConfig(): SupabaseConfig {
  // 1. Check localStorage first
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  // 2. Check import.meta.env
  const env = (import.meta as any).env || {};
  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  localStorage.setItem(
    SUPABASE_CONFIG_KEY,
    JSON.stringify({ url: cleanUrl, anonKey: cleanKey })
  );
  cachedClient = null;
  cachedConfigKey = '';
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  cachedClient = null;
  cachedConfigKey = '';
}

export function isSupabaseConfigured(): boolean {
  const cfg = getSupabaseConfig();
  return Boolean(cfg.url && cfg.anonKey);
}

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) {
    return null;
  }

  const key = `${cfg.url}:${cfg.anonKey}`;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cfg.url, cfg.anonKey, {
      auth: {
        persistSession: false,
      },
    });
    cachedConfigKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(
  testUrl?: string,
  testKey?: string
): Promise<{ success: boolean; message: string }> {
  let client: SupabaseClient | null = null;

  if (testUrl && testKey) {
    try {
      client = createClient(testUrl.trim(), testKey.trim(), {
        auth: { persistSession: false },
      });
    } catch (e: any) {
      return { success: false, message: `Lỗi khởi tạo client: ${e.message}` };
    }
  } else {
    client = getSupabaseClient();
  }

  if (!client) {
    return {
      success: false,
      message: 'Chưa cấu hình Supabase URL và Anon Key!',
    };
  }

  try {
    // Try pinging spa_settings or public table
    const { data, error } = await client
      .from('spa_settings')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message:
            'Kết nối Supabase thành công nhưng bảng dữ liệu chưa được tạo! Hãy bấm nút "Sao chép SQL" và chạy trong mục SQL Editor của Supabase.',
        };
      }
      return {
        success: false,
        message: `Lỗi truy vấn Supabase (${error.code}): ${error.message}`,
      };
    }

    return {
      success: true,
      message: 'Kết nối Supabase thành công tuyệt đối! Bảng dữ liệu đã sẵn sàng.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể kết nối đến máy chủ Supabase: ${err?.message || err}`,
    };
  }
}

// ============================================================================
// CONVERTER HELPERS (CamelCase <-> SnakeCase)
// ============================================================================

export function staffToRow(s: Staff) {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    username: s.username,
    password: s.password || '123456',
    start_date: s.startDate,
    role: s.role,
    title: s.title,
    skills: s.skills || [],
    base_salary: s.baseSalary,
    sales_commission_rate: s.salesCommissionRate,
    status: s.status,
    avatar: s.avatar || null,
    is_primary_admin: Boolean(s.isPrimaryAdmin),
  };
}

export function rowToStaff(r: any): Staff {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone || '',
    username: r.username,
    password: r.password,
    startDate: r.start_date || '2026-11-04',
    role: r.role,
    title: r.title || '',
    skills: Array.isArray(r.skills) ? r.skills : [],
    baseSalary: Number(r.base_salary) || 0,
    salesCommissionRate: Number(r.sales_commission_rate) || 0,
    status: r.status || 'active',
    avatar: r.avatar,
    isPrimaryAdmin: Boolean(r.is_primary_admin),
  };
}

export function customerToRow(c: Customer) {
  return {
    id: c.id,
    full_name: c.fullName,
    phone: c.phone,
    gender: c.gender,
    birthday: c.birthday || null,
    source: c.source,
    skin_type: c.skinType || '',
    allergies: c.allergies || '',
    notes: c.notes || '',
    total_spend: c.totalSpend || 0,
    debt_balance: c.debtBalance || 0,
    loyalty_points: c.loyaltyPoints || 0,
    wallet_balance: c.walletBalance || 0,
    created_at: c.createdAt || new Date().toISOString(),
  };
}

export function rowToCustomer(r: any): Customer {
  return {
    id: r.id,
    fullName: r.full_name,
    phone: r.phone,
    gender: r.gender,
    birthday: r.birthday || '',
    source: r.source || 'walk_in',
    skinType: r.skin_type || '',
    allergies: r.allergies || '',
    notes: r.notes || '',
    totalSpend: Number(r.total_spend) || 0,
    debtBalance: Number(r.debt_balance) || 0,
    loyaltyPoints: Number(r.loyalty_points) || 0,
    walletBalance: Number(r.wallet_balance) || 0,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

export function serviceToRow(s: Service) {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    category: s.category,
    description: s.description || '',
    duration_minutes: s.durationMinutes,
    price: s.price,
    happy_hour_price: s.happyHourPrice || null,
    tour_fee_primary: s.tourFeePrimary || 0,
    tour_fee_secondary: s.tourFeeSecondary || 0,
    bom: s.bom || [],
    steps: s.steps || [],
  };
}

export function rowToService(r: any): Service {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    description: r.description || '',
    durationMinutes: Number(r.duration_minutes) || 60,
    price: Number(r.price) || 0,
    happyHourPrice: r.happy_hour_price ? Number(r.happy_hour_price) : undefined,
    tourFeePrimary: Number(r.tour_fee_primary) || 0,
    tourFeeSecondary: Number(r.tour_fee_secondary) || 0,
    bom: Array.isArray(r.bom) ? r.bom : [],
    steps: Array.isArray(r.steps) ? r.steps : [],
  };
}

export function packageToRow(p: PackageCombo) {
  return {
    id: p.id,
    name: p.name,
    original_price: p.originalPrice,
    price: p.price,
    validity_days: p.validityDays,
    services: p.services || [],
    sales_commission: p.salesCommission || 0,
  };
}

export function rowToPackage(r: any): PackageCombo {
  return {
    id: r.id,
    name: r.name,
    originalPrice: Number(r.original_price) || 0,
    price: Number(r.price) || 0,
    validityDays: Number(r.validity_days) || 180,
    services: Array.isArray(r.services) ? r.services : [],
    salesCommission: Number(r.sales_commission) || 0,
  };
}

export function cardToRow(c: TreatmentCard) {
  return {
    id: c.id,
    customer_id: c.customerId,
    customer_name: c.customerName,
    customer_phone: c.customerPhone,
    package_id: c.packageId,
    package_name: c.packageName,
    total_sessions: c.totalSessions,
    used_sessions: c.usedSessions,
    remaining_sessions: c.remainingSessions,
    status: c.status,
    activated_date: c.activatedDate,
    expiry_date: c.expiryDate,
  };
}

export function rowToCard(r: any): TreatmentCard {
  return {
    id: r.id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone || '',
    packageId: r.package_id,
    packageName: r.package_name,
    totalSessions: Number(r.total_sessions),
    usedSessions: Number(r.used_sessions),
    remainingSessions: Number(r.remaining_sessions),
    status: r.status,
    activatedDate: r.activated_date,
    expiryDate: r.expiry_date,
  };
}

export function checkinToRow(c: CheckinRecord) {
  return {
    id: c.id,
    card_id: c.cardId,
    customer_id: c.customerId,
    customer_name: c.customerName,
    service_id: c.serviceId,
    service_name: c.serviceName,
    session_number: c.sessionNumber,
    timestamp: c.timestamp,
    primary_tech_id: c.primaryTechId,
    primary_tech_name: c.primaryTechName,
    secondary_tech_id: c.secondaryTechId || null,
    secondary_tech_name: c.secondaryTechName || null,
    steps_performed: c.stepsPerformed || '',
    client_reaction: c.clientReaction || '',
    before_photo_url: c.beforePhotoUrl || null,
    after_photo_url: c.afterPhotoUrl || null,
  };
}

export function rowToCheckin(r: any): CheckinRecord {
  return {
    id: r.id,
    cardId: r.card_id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    serviceId: r.service_id,
    serviceName: r.service_name,
    sessionNumber: Number(r.session_number),
    timestamp: r.timestamp,
    primaryTechId: r.primary_tech_id,
    primaryTechName: r.primary_tech_name,
    secondaryTechId: r.secondary_tech_id,
    secondaryTechName: r.secondary_tech_name,
    stepsPerformed: r.steps_performed || '',
    clientReaction: r.client_reaction || '',
    beforePhotoUrl: r.before_photo_url,
    afterPhotoUrl: r.after_photo_url,
  };
}

export function orderToRow(o: Order) {
  return {
    id: o.id,
    code: o.code,
    customer_id: o.customerId,
    customer_name: o.customerName,
    customer_phone: o.customerPhone,
    cashier_id: o.cashierId,
    cashier_name: o.cashierName,
    seller_id: o.sellerId,
    seller_name: o.sellerName,
    items: o.items || [],
    subtotal: o.subtotal,
    discount_amount: o.discountAmount,
    total_amount: o.totalAmount,
    paid_amount: o.paidAmount,
    debt_amount: o.debtAmount,
    payment_method: o.paymentMethod,
    gross_profit: o.grossProfit,
    created_at: o.createdAt,
  };
}

export function rowToOrder(r: any): Order {
  return {
    id: r.id,
    code: r.code,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone || '',
    cashierId: r.cashier_id,
    cashierName: r.cashier_name,
    sellerId: r.seller_id,
    sellerName: r.seller_name,
    items: Array.isArray(r.items) ? r.items : [],
    subtotal: Number(r.subtotal),
    discountAmount: Number(r.discount_amount) || 0,
    totalAmount: Number(r.total_amount),
    paidAmount: Number(r.paid_amount),
    debtAmount: Number(r.debt_amount) || 0,
    paymentMethod: r.payment_method,
    grossProfit: Number(r.gross_profit) || 0,
    createdAt: r.created_at,
  };
}

export function inventoryToRow(i: InventoryItem) {
  return {
    id: i.id,
    sku: i.sku,
    barcode: i.barcode || '',
    name: i.name,
    type: i.type,
    unit: i.unit,
    quantity: i.quantity,
    min_threshold: i.minThreshold,
    cost_price: i.costPrice,
    retail_price: i.retailPrice,
    expiry_date: i.expiryDate || null,
    batch_number: i.batchNumber || null,
  };
}

export function rowToInventory(r: any): InventoryItem {
  return {
    id: r.id,
    sku: r.sku,
    barcode: r.barcode || '',
    name: r.name,
    type: r.type,
    unit: r.unit,
    quantity: Number(r.quantity),
    minThreshold: Number(r.min_threshold) || 5,
    costPrice: Number(r.cost_price) || 0,
    retailPrice: Number(r.retail_price) || 0,
    expiryDate: r.expiry_date || '',
    batchNumber: r.batch_number || '',
  };
}

export function appointmentToRow(a: Appointment) {
  return {
    id: a.id,
    customer_id: a.customerId,
    customer_name: a.customerName,
    customer_phone: a.customerPhone,
    service_id: a.serviceId,
    service_name: a.serviceName,
    staff_id: a.staffId || null,
    staff_name: a.staffName || '',
    bed_id: a.bedId || '',
    start_time: a.startTime,
    end_time: a.endTime,
    status: a.status,
    notes: a.notes || '',
    is_online_booking: Boolean(a.isOnlineBooking),
    booked_at: a.bookedAt || null,
    email_notified_to: a.emailNotifiedTo || null,
    card_id: a.cardId || null,
    is_card_booking: Boolean(a.isCardBooking),
    session_deducted: Boolean(a.sessionDeducted),
  };
}

export function rowToAppointment(r: any): Appointment {
  return {
    id: r.id,
    customerId: r.customer_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone || '',
    serviceId: r.service_id,
    serviceName: r.service_name,
    staffId: r.staff_id || '',
    staffName: r.staff_name || '',
    bedId: r.bed_id || '',
    startTime: r.start_time,
    endTime: r.end_time,
    status: r.status,
    notes: r.notes || '',
    isOnlineBooking: Boolean(r.is_online_booking),
    bookedAt: r.booked_at,
    emailNotifiedTo: r.email_notified_to,
    cardId: r.card_id,
    isCardBooking: Boolean(r.is_card_booking),
    sessionDeducted: Boolean(r.session_deducted),
  };
}

export function commissionToRow(c: CommissionEntry) {
  return {
    id: c.id,
    staff_id: c.staffId,
    staff_name: c.staffName,
    type: c.type,
    amount: c.amount,
    reference_code: c.referenceCode || '',
    description: c.description || '',
    timestamp: c.timestamp,
  };
}

export function rowToCommission(r: any): CommissionEntry {
  return {
    id: r.id,
    staffId: r.staff_id,
    staffName: r.staff_name,
    type: r.type,
    amount: Number(r.amount),
    referenceCode: r.reference_code || '',
    description: r.description || '',
    timestamp: r.timestamp,
  };
}

export function settingsToRow(s: SpaSettings) {
  return {
    id: 'default',
    spa_name: s.spaName,
    slogan: s.slogan,
    logo_url: s.logoUrl || null,
    icon_type: s.iconType,
    theme_preset: s.themePreset,
    hotline: s.hotline,
    phone: s.phone,
    address: s.address,
    email: s.email,
    website: s.website,
    working_hours: s.workingHours,
    tax_code: s.taxCode,
    bank_id: s.bankId,
    bank_name: s.bankName,
    account_no: s.accountNo,
    account_name: s.accountName,
    qr_prefix: s.qrPrefix,
    receipt_footer: s.receiptFooter,
    points_rate: s.pointsRate,
    updated_at: new Date().toISOString(),
  };
}

export function rowToSettings(r: any): SpaSettings {
  return {
    spaName: r.spa_name || 'Liin Spa & Clinic',
    slogan: r.slogan || '',
    logoUrl: r.logo_url,
    iconType: r.icon_type || 'sparkles',
    themePreset: r.theme_preset || 'rose_gold',
    hotline: r.hotline || '',
    phone: r.phone || '',
    address: r.address || '',
    email: r.email || '',
    website: r.website || '',
    workingHours: r.working_hours || '',
    taxCode: r.tax_code || '',
    bankId: r.bank_id || 'MB',
    bankName: r.bank_name || 'MBBank',
    accountNo: r.account_no || '',
    accountName: r.account_name || '',
    qrPrefix: r.qr_prefix || 'LIINSPA',
    receiptFooter: r.receipt_footer || '',
    pointsRate: Number(r.points_rate) || 20000,
  };
}

// ============================================================================
// SYNC ALL TO SUPABASE
// ============================================================================
export async function syncAllToSupabase(data: {
  settings: SpaSettings;
  staffList: Staff[];
  customers: Customer[];
  services: Service[];
  packages: PackageCombo[];
  cards: TreatmentCard[];
  checkins: CheckinRecord[];
  orders: Order[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  commissions: CommissionEntry[];
}): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Chưa cấu hình Supabase Client!' };
  }

  try {
    // 1. Settings
    const { error: errSettings } = await client
      .from('spa_settings')
      .upsert(settingsToRow(data.settings));
    if (errSettings) throw new Error(`Lỗi cập nhật Cài đặt: ${errSettings.message}`);

    // 2. Staff
    if (data.staffList.length > 0) {
      const rows = data.staffList.map(staffToRow);
      const { error } = await client.from('staff').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Nhân viên: ${error.message}`);
    }

    // 3. Customers
    if (data.customers.length > 0) {
      const rows = data.customers.map(customerToRow);
      const { error } = await client.from('customers').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Khách hàng: ${error.message}`);
    }

    // 4. Services
    if (data.services.length > 0) {
      const rows = data.services.map(serviceToRow);
      const { error } = await client.from('services').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Dịch vụ: ${error.message}`);
    }

    // 5. Packages
    if (data.packages.length > 0) {
      const rows = data.packages.map(packageToRow);
      const { error } = await client.from('packages').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Combo: ${error.message}`);
    }

    // 6. Cards
    if (data.cards.length > 0) {
      const rows = data.cards.map(cardToRow);
      const { error } = await client.from('treatment_cards').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Thẻ liệu trình: ${error.message}`);
    }

    // 7. Checkins
    if (data.checkins.length > 0) {
      const rows = data.checkins.map(checkinToRow);
      const { error } = await client.from('checkins').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Check-in: ${error.message}`);
    }

    // 8. Orders
    if (data.orders.length > 0) {
      const rows = data.orders.map(orderToRow);
      const { error } = await client.from('orders').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Đơn hàng: ${error.message}`);
    }

    // 9. Inventory
    if (data.inventory.length > 0) {
      const rows = data.inventory.map(inventoryToRow);
      const { error } = await client.from('inventory').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Kho hàng: ${error.message}`);
    }

    // 10. Appointments
    if (data.appointments.length > 0) {
      const rows = data.appointments.map(appointmentToRow);
      const { error } = await client.from('appointments').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Lịch hẹn: ${error.message}`);
    }

    // 11. Commissions
    if (data.commissions.length > 0) {
      const rows = data.commissions.map(commissionToRow);
      const { error } = await client.from('commissions').upsert(rows);
      if (error) throw new Error(`Lỗi cập nhật Hoa hồng: ${error.message}`);
    }

    return {
      success: true,
      message: 'Đã đẩy toàn bộ dữ liệu lên cơ sở dữ liệu Supabase thành công 100%!',
      details: {
        staffCount: data.staffList.length,
        customerCount: data.customers.length,
        serviceCount: data.services.length,
        orderCount: data.orders.length,
        inventoryCount: data.inventory.length,
        appointmentCount: data.appointments.length,
      },
    };
  } catch (err: any) {
    console.error('syncAllToSupabase error:', err);
    return {
      success: false,
      message: err?.message || 'Có lỗi xảy ra khi đẩy dữ liệu lên Supabase',
    };
  }
}

// ============================================================================
// FETCH ALL FROM SUPABASE
// ============================================================================
export async function fetchAllFromSupabase(): Promise<{
  success: boolean;
  message: string;
  data?: {
    settings?: SpaSettings;
    staffList?: Staff[];
    customers?: Customer[];
    services?: Service[];
    packages?: PackageCombo[];
    cards?: TreatmentCard[];
    checkins?: CheckinRecord[];
    orders?: Order[];
    inventory?: InventoryItem[];
    appointments?: Appointment[];
    commissions?: CommissionEntry[];
  };
}> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Chưa cấu hình Supabase Client!' };
  }

  try {
    const [
      resSettings,
      resStaff,
      resCustomers,
      resServices,
      resPackages,
      resCards,
      resCheckins,
      resOrders,
      resInventory,
      resAppointments,
      resCommissions,
    ] = await Promise.all([
      client.from('spa_settings').select('*').limit(1).maybeSingle(),
      client.from('staff').select('*'),
      client.from('customers').select('*'),
      client.from('services').select('*'),
      client.from('packages').select('*'),
      client.from('treatment_cards').select('*'),
      client.from('checkins').select('*'),
      client.from('orders').select('*'),
      client.from('inventory').select('*'),
      client.from('appointments').select('*'),
      client.from('commissions').select('*'),
    ]);

    if (resSettings.error) throw resSettings.error;

    return {
      success: true,
      message: 'Đã đồng bộ toàn bộ dữ liệu từ Supabase về ứng dụng thành công!',
      data: {
        settings: resSettings.data ? rowToSettings(resSettings.data) : undefined,
        staffList: resStaff.data ? resStaff.data.map(rowToStaff) : [],
        customers: resCustomers.data ? resCustomers.data.map(rowToCustomer) : [],
        services: resServices.data ? resServices.data.map(rowToService) : [],
        packages: resPackages.data ? resPackages.data.map(rowToPackage) : [],
        cards: resCards.data ? resCards.data.map(rowToCard) : [],
        checkins: resCheckins.data ? resCheckins.data.map(rowToCheckin) : [],
        orders: resOrders.data ? resOrders.data.map(rowToOrder) : [],
        inventory: resInventory.data ? resInventory.data.map(rowToInventory) : [],
        appointments: resAppointments.data ? resAppointments.data.map(rowToAppointment) : [],
        commissions: resCommissions.data ? resCommissions.data.map(rowToCommission) : [],
      },
    };
  } catch (err: any) {
    console.error('fetchAllFromSupabase error:', err);
    return {
      success: false,
      message: `Lỗi tải dữ liệu từ Supabase: ${err.message || err}`,
    };
  }
}
