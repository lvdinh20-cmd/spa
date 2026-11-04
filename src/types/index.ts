export type UserRole = 'admin' | 'receptionist' | 'technician';

export interface Staff {
  id: string;
  name: string;
  phone: string;
  username: string;
  password?: string;
  startDate: string; // Ngày bắt đầu làm việc (YYYY-MM-DD)
  role: UserRole;
  title: string; // e.g. "Chủ Spa", "Lễ tân trưởng", "KTV Chăm sóc da"
  skills: string[]; // Service IDs
  baseSalary: number; // VND
  salesCommissionRate: number; // e.g. 5%
  status: 'active' | 'on_leave' | 'inactive';
  avatar?: string;
  isPrimaryAdmin?: boolean; // Quản trị viên (Admin) chính của Spa
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  gender: 'female' | 'male' | 'other';
  birthday: string;
  source: 'facebook' | 'referral' | 'walk_in' | 'tiktok' | 'other';
  skinType: string;
  allergies: string;
  notes: string;
  totalSpend: number;
  debtBalance: number;
  loyaltyPoints: number;
  walletBalance: number;
  createdAt: string;
}

export interface BOMItem {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
}

export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string; // Mô tả chi tiết dịch vụ, công dụng & đối tượng
  durationMinutes: number;
  price: number;
  happyHourPrice?: number;
  tourFeePrimary: number; // Hoa hồng KTV chính
  tourFeeSecondary: number; // Hoa hồng KTV phụ
  bom: BOMItem[];
  steps: string[];
}

export interface PackageServiceItem {
  serviceId: string;
  serviceName: string;
  sessionCount: number;
}

export interface PackageCombo {
  id: string;
  name: string;
  originalPrice: number;
  price: number;
  validityDays: number;
  services: PackageServiceItem[];
  salesCommission: number; // Hoa hồng người chốt sale
}

export type CardStatus = 'active' | 'paused' | 'depleted' | 'expired';

export interface TreatmentCard {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageId: string;
  packageName: string;
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;
  status: CardStatus;
  activatedDate: string;
  expiryDate: string;
}

export interface CheckinRecord {
  id: string;
  cardId: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  sessionNumber: number;
  timestamp: string;
  primaryTechId: string;
  primaryTechName: string;
  secondaryTechId?: string;
  secondaryTechName?: string;
  stepsPerformed: string;
  clientReaction: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface OrderItem {
  type: 'service' | 'package' | 'product';
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  primaryTechId?: string;
  secondaryTechId?: string;
}

export type PaymentMethod = 'cash' | 'vietqr' | 'card' | 'wallet' | 'mixed';

export interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  cashierId: string;
  cashierName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  debtAmount: number;
  paymentMethod: PaymentMethod;
  grossProfit: number;
  createdAt: string;
}

export type InventoryType = 'commercial' | 'consumable';

export interface InventoryItem {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  type: InventoryType; // 'commercial' = bán lẻ mang về, 'consumable' = tiêu hao nội bộ
  unit: string; // chai, lọ, miếng, ml, gram, hộp
  quantity: number;
  minThreshold: number;
  costPrice: number;
  retailPrice: number;
  expiryDate: string;
  batchNumber: string;
}

export type BookingStatus = 'pending_online' | 'booked' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  bedId: string; // Giường / Phòng
  startTime: string; // YYYY-MM-DDTHH:mm
  endTime: string;
  status: BookingStatus;
  notes: string;
  isOnlineBooking?: boolean;
  bookedAt?: string;
  emailNotifiedTo?: string;
  cardId?: string; // ID của thẻ liệu trình nếu khách đặt theo thẻ
  isCardBooking?: boolean; // Khách chọn làm buổi theo thẻ đã mua
  sessionDeducted?: boolean; // Đã trừ buổi khi hoàn thành ca làm hay chưa
}

export interface CommissionEntry {
  id: string;
  staffId: string;
  staffName: string;
  type: 'tour_primary' | 'tour_secondary' | 'sales_package' | 'sales_product' | 'tip';
  amount: number;
  referenceCode: string; // Order code or Checkin ID
  description: string;
  timestamp: string;
}

export interface SpaSettings {
  // Nhận diện thương hiệu & Logo/Icon
  spaName: string;
  slogan: string;
  logoUrl?: string;
  iconType: 'sparkles' | 'crown' | 'flower' | 'heart' | 'gem';
  themePreset: 'rose_gold' | 'emerald_luxury' | 'champagne_gold' | 'royal_ruby';

  // Thông tin liên hệ & Vận hành
  hotline: string;
  phone: string;
  address: string;
  email: string;
  website: string;
  workingHours: string;
  taxCode: string;

  // Tài khoản ngân hàng nhận tiền & VietQR Napas247
  bankId: string; // MB, VCB, TCB, VPB, ACB, BIDV, ICB, TPB, STB, HDB, VIB...
  bankName: string;
  accountNo: string;
  accountName: string;
  qrPrefix: string; // Default: 'LIINSPA'

  // Hóa đơn & Chính sách điểm thưởng
  receiptFooter: string;
  pointsRate: number; // e.g. 20000 VND = 1 point
}

