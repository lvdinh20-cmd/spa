import {
  Staff,
  Customer,
  Service,
  PackageCombo,
  TreatmentCard,
  CheckinRecord,
  Order,
  InventoryItem,
  Appointment,
  CommissionEntry,
  SpaSettings,
} from '../types';

const STORAGE_KEYS = {
  STAFF: 'liin_spa_staff',
  CUSTOMERS: 'liin_spa_customers',
  SERVICES: 'liin_spa_services',
  PACKAGES: 'liin_spa_packages',
  CARDS: 'liin_spa_cards',
  CHECKINS: 'liin_spa_checkins',
  ORDERS: 'liin_spa_orders',
  INVENTORY: 'liin_spa_inventory',
  APPOINTMENTS: 'liin_spa_appointments',
  COMMISSIONS: 'liin_spa_commissions',
  SETTINGS: 'liin_spa_settings',
  CURRENT_USER_ROLE: 'liin_spa_active_role',
};

export const INITIAL_SPA_SETTINGS: SpaSettings = {
  spaName: 'Liin Spa & Clinic',
  slogan: 'Đẳng cấp làm đẹp chuẩn Y khoa & Trẻ hóa công nghệ cao',
  logoUrl: '',
  iconType: 'sparkles',
  themePreset: 'rose_gold',
  hotline: '1900 8899',
  phone: '0988 123 456',
  address: '168 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
  email: 'contact@liinspa.vn',
  website: 'https://liinspa.vn',
  workingHours: '08:30 - 20:30 (Thứ 2 - Chủ Nhật)',
  taxCode: '0318992233',
  bankId: 'MB',
  bankName: 'MBBank (Ngân hàng Quân Đội)',
  accountNo: '090123456789',
  accountName: 'LIIN SPA VIETNAM',
  qrPrefix: 'LIINSPA',
  receiptFooter: 'Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Liin Spa & Clinic. Hẹn gặp lại Quý khách ở buổi trị liệu tiếp theo!',
  pointsRate: 20000,
};

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-admin-01',
    name: 'Liin Spa',
    phone: '0901234567',
    username: 'liin',
    password: '123456',
    startDate: '2026-11-04',
    role: 'admin',
    title: 'Chủ Spa & Quản trị viên chính',
    skills: ['srv-01', 'srv-02', 'srv-03', 'srv-04'],
    baseSalary: 20000000,
    salesCommissionRate: 5,
    status: 'active',
    isPrimaryAdmin: true,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  // Hàng tiêu hao nội bộ (Consumable)
  {
    id: 'inv-mat-01',
    sku: 'NVL-TT-01',
    barcode: '893001001',
    name: 'Tinh chất Tràm trà Kháng viêm (Chai 500ml)',
    type: 'consumable',
    unit: 'ml',
    quantity: 420,
    minThreshold: 100,
    costPrice: 500, // 500đ / ml
    retailPrice: 0,
    expiryDate: '2027-10-15',
    batchNumber: 'LOT-2026-A1',
  },
  {
    id: 'inv-mat-02',
    sku: 'NVL-MN-02',
    barcode: '893001002',
    name: 'Mặt nạ Bạc hà Dịu da Giảm đỏ',
    type: 'consumable',
    unit: 'miếng',
    quantity: 85,
    minThreshold: 20,
    costPrice: 15000,
    retailPrice: 0,
    expiryDate: '2028-01-20',
    batchNumber: 'LOT-2026-B4',
  },
  {
    id: 'inv-mat-03',
    sku: 'NVL-EGF-03',
    barcode: '893001003',
    name: 'Tế bào gốc Phục hồi EGF Thụy Sĩ (Ống 10ml)',
    type: 'consumable',
    unit: 'ml',
    quantity: 12,
    minThreshold: 15, // Cảnh báo sắp hết
    costPrice: 80000, // 80.000đ/ml
    retailPrice: 0,
    expiryDate: '2027-06-30',
    batchNumber: 'LOT-2025-EGF',
  },
  {
    id: 'inv-mat-04',
    sku: 'NVL-OIL-04',
    barcode: '893001004',
    name: 'Tinh dầu Massage Hoa hồng Pháp (Chai 1000ml)',
    type: 'consumable',
    unit: 'ml',
    quantity: 750,
    minThreshold: 200,
    costPrice: 300,
    retailPrice: 0,
    expiryDate: '2027-12-01',
    batchNumber: 'LOT-2026-OIL',
  },
  {
    id: 'inv-mat-05',
    sku: 'NVL-GEL-05',
    barcode: '893001005',
    name: 'Gel lạnh Triệt lông Chuyên dụng (Can 5000ml)',
    type: 'consumable',
    unit: 'ml',
    quantity: 3800,
    minThreshold: 500,
    costPrice: 50,
    retailPrice: 0,
    expiryDate: '2028-05-10',
    batchNumber: 'LOT-2026-GEL',
  },

  // Hàng thương mại bán lẻ (Commercial)
  {
    id: 'inv-com-01',
    sku: 'SP-B5-01',
    barcode: '893600101',
    name: 'Serum Phục hồi da B5 La Roche-Posay 30ml',
    type: 'commercial',
    unit: 'lọ',
    quantity: 18,
    minThreshold: 5,
    costPrice: 380000,
    retailPrice: 520000,
    expiryDate: '2028-03-12',
    batchNumber: 'LRP-2026-B5',
  },
  {
    id: 'inv-com-02',
    sku: 'SP-KCN-02',
    barcode: '893600102',
    name: 'Kem chống nắng Dịu nhẹ Cell Fusion C 50ml',
    type: 'commercial',
    unit: 'tuýp',
    quantity: 4, // Cảnh báo sắp hết
    minThreshold: 6,
    costPrice: 280000,
    retailPrice: 420000,
    expiryDate: '2027-08-15',
    batchNumber: 'CFC-2026-KCN',
  },
  {
    id: 'inv-com-03',
    sku: 'SP-BHA-03',
    barcode: '893600103',
    name: 'Tẩy Tế Bào Chết Paula\'s Choice 2% BHA 118ml',
    type: 'commercial',
    unit: 'chai',
    quantity: 12,
    minThreshold: 4,
    costPrice: 650000,
    retailPrice: 890000,
    expiryDate: '2028-09-01',
    batchNumber: 'PC-2026-BHA',
  },
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-01',
    code: 'DV-MUN-01',
    name: 'Trị Mụn Chuẩn Y Khoa 12 Bước Kháng Khuẩn Tầng Sâu',
    category: 'Trị liệu da mặt',
    description: 'Quy trình lấy nhân mụn chuẩn y khoa 12 bước với dụng cụ tiệt trùng 100%, kết hợp chiếu ánh sáng sinh học Bio-Light và tinh chất tràm trà kháng viêm giúp gom cồi mụn, giảm sưng đỏ tức thì mà không để lại sẹo thâm. Phù hợp cho da mụn viêm, mụn ẩn và mụn đầu đen.',
    durationMinutes: 75,
    price: 450000,
    happyHourPrice: 380000,
    tourFeePrimary: 60000,
    tourFeeSecondary: 30000,
    bom: [
      { materialId: 'inv-mat-01', materialName: 'Tinh chất Tràm trà', quantity: 15, unit: 'ml' },
      { materialId: 'inv-mat-02', materialName: 'Mặt nạ Bạc hà Dịu da', quantity: 1, unit: 'miếng' },
    ],
    steps: [
      'Tẩy trang & Rửa mặt sạch sâu',
      'Xông hơi thông thoáng lỗ chân lông & Tẩy da chết',
      'Hút bã nhờn & dầu thừa chân không',
      'Khử trùng bề mặt bằng dung dịch Povidine pha loãng',
      'Lấy nhân mụn chuẩn y khoa bằng tăm bông chuyên dụng',
      'Chiếu tia điện tím tiệt trùng vết thương hở',
      'Thoa tinh chất Tràm trà kháng viêm',
      'Đắp mặt nạ Bạc hà làm dịu và giảm sưng đỏ',
      'Chiếu ánh sáng sinh học Bio-Light màu xanh lam',
      'Massage đầu cổ vai gáy thư giãn',
      'Lau sạch mặt & Thoa kem dưỡng khóa ẩm',
      'Thoa kem chống nắng bảo vệ da trước khi ra về',
    ],
  },
  {
    id: 'srv-02',
    code: 'DV-EGF-02',
    name: 'Cấy Tảo Xoắn Nano & Tế Bào Gốc Trẻ Hóa Căng Bóng',
    category: 'Chăm sóc da chuyên sâu',
    description: 'Công nghệ cấy vi điểm tảo xoắn tươi kết hợp tế bào gốc EGF Thụy Sĩ giúp phục hồi hàng rào bảo vệ da, thu nhỏ lỗ chân lông và kích thích sản sinh collagen tự nhiên. Mang lại làn da căng bóng ngậm nước chuẩn Hàn Quốc ngay sau buổi đầu tiên.',
    durationMinutes: 60,
    price: 650000,
    happyHourPrice: 550000,
    tourFeePrimary: 80000,
    tourFeeSecondary: 40000,
    bom: [
      { materialId: 'inv-mat-03', materialName: 'Tế bào gốc Phục hồi EGF', quantity: 3, unit: 'ml' },
      { materialId: 'inv-mat-02', materialName: 'Mặt nạ Bạc hà Dịu da', quantity: 1, unit: 'miếng' },
    ],
    steps: [
      'Làm sạch sâu da mặt 3 bước',
      'Tẩy da chết enzym sinh học',
      'Cấy tinh chất tảo xoắn tươi & tế bào gốc qua đầu Nano không xâm lấn',
      'Đi điện di ion lạnh thẩm thấu sâu dưỡng chất',
      'Đắp mặt nạ khóa ẩm & Chiếu ánh sáng vàng tái tạo collagen',
    ],
  },
  {
    id: 'srv-03',
    code: 'DV-MASS-03',
    name: 'Massage Body Đá Nóng Thụy Điển Đả Thông Kinh Lạc',
    category: 'Massage & Thư giãn',
    description: 'Phương pháp massage thư giãn Thụy Điển kết hợp đá núi lửa bazan hấp nóng ở nhiệt độ 55-60°C và tinh dầu hoa hồng Pháp. Giúp giải tỏa căng cơ, hút hàn khí, đả thông các đường kinh lạc và cải thiện tuần hoàn máu toàn thân.',
    durationMinutes: 90,
    price: 500000,
    happyHourPrice: 420000,
    tourFeePrimary: 70000,
    tourFeeSecondary: 35000,
    bom: [
      { materialId: 'inv-mat-04', materialName: 'Tinh dầu Massage Hoa hồng', quantity: 30, unit: 'ml' },
    ],
    steps: [
      'Ngâm chân thảo dược nước ấm muối gừng',
      'Khai thông huyệt đạo toàn thân',
      'Massage xoa bóp dầu hoa hồng Thụy Điển',
      'Đi đá núi lửa nóng bazan hút hàn khí vùng lưng',
      'Xoa bóp thư giãn cổ vai gáy và da đầu',
    ],
  },
  {
    id: 'srv-04',
    code: 'DV-LASER-04',
    name: 'Triệt Lông Diode Laser Công Nghệ Băng Băng Vùng Nách/Mặt',
    category: 'Triệt lông vĩnh viễn',
    description: 'Công nghệ triệt lông Diode Laser bước sóng 808nm với đầu đá Sapphire làm lạnh âm 5°C không gây đau rát. Triệt tiêu tận gốc mầm nhú nang lông, ngăn ngừa viêm nang lông và làm sáng mịn vùng da thâm sần.',
    durationMinutes: 30,
    price: 250000,
    happyHourPrice: 199000,
    tourFeePrimary: 40000,
    tourFeeSecondary: 20000,
    bom: [
      { materialId: 'inv-mat-05', materialName: 'Gel lạnh Triệt lông', quantity: 25, unit: 'ml' },
    ],
    steps: [
      'Vệ sinh & Cạo sạch lông vùng điều trị',
      'Thoa gel lạnh chuyên dụng bảo vệ biểu bì',
      'Điều chỉnh năng lượng Diode Laser bước sóng 808nm',
      'Bắn xung ánh sáng triệt tiêu nang lông',
      'Lau sạch gel & Thoa kem dưỡng làm dịu',
    ],
  },
];

export const INITIAL_PACKAGES: PackageCombo[] = [
  {
    id: 'pkg-01',
    name: 'Gói Trị Mụn Chuyên Sâu Y Khoa (Liệu trình 10 Buổi)',
    originalPrice: 4500000,
    price: 3600000, // Tiết kiệm 20%
    validityDays: 180,
    services: [
      { serviceId: 'srv-01', serviceName: 'Trị Mụn Chuẩn Y Khoa 12 Bước', sessionCount: 10 },
    ],
    salesCommission: 250000,
  },
  {
    id: 'pkg-02',
    name: 'Combo Nữ Hoàng Thư Giãn (5 Buổi Body Đá Nóng + 5 Buổi Trẻ Hóa Tảo Nano)',
    originalPrice: 5750000,
    price: 4500000,
    validityDays: 180,
    services: [
      { serviceId: 'srv-03', serviceName: 'Massage Body Đá Nóng Thụy Điển', sessionCount: 5 },
      { serviceId: 'srv-02', serviceName: 'Cấy Tảo Xoắn Nano & Tế Bào Gốc', sessionCount: 5 },
    ],
    salesCommission: 300000,
  },
  {
    id: 'pkg-03',
    name: 'Liệu Trình Triệt Lông Trọn Gói Bảo Hành 3 Năm (10 Buổi)',
    originalPrice: 2500000,
    price: 1800000,
    validityDays: 365,
    services: [
      { serviceId: 'srv-04', serviceName: 'Triệt Lông Diode Laser', sessionCount: 10 },
    ],
    salesCommission: 150000,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cus-01',
    fullName: 'Đặng Thu Thảo',
    phone: '0912345678',
    gender: 'female',
    birthday: '1995-10-24',
    source: 'facebook',
    skinType: 'Da dầu mụn, nhạy cảm vùng chữ T',
    allergies: 'Không dị ứng mỹ phẩm',
    notes: 'Thích massage lực nhẹ vùng vai',
    totalSpend: 7800000,
    debtBalance: 0,
    loyaltyPoints: 390,
    walletBalance: 500000,
    createdAt: '2026-08-10T10:00:00Z',
  },
  {
    id: 'cus-02',
    fullName: 'Hoàng Mai Anh',
    phone: '0987654321',
    gender: 'female',
    birthday: '1992-04-15',
    source: 'referral',
    skinType: 'Da khô thiếu ẩm, có nám nhẹ 2 bên gò má',
    allergies: 'Dị ứng cồn và hương liệu nhân tạo đậm mùi',
    notes: 'Khen KTV Hạnh làm rất êm',
    totalSpend: 4500000,
    debtBalance: 1500000, // Khách nợ trả góp
    loyaltyPoints: 220,
    walletBalance: 0,
    createdAt: '2026-09-02T14:30:00Z',
  },
  {
    id: 'cus-03',
    fullName: 'Vũ Hoài Nam',
    phone: '0903112233',
    gender: 'male',
    birthday: '1988-12-05',
    source: 'walk_in',
    skinType: 'Da thường, mỏi cơ lưng do ngồi văn phòng',
    allergies: 'Không',
    notes: 'Yêu cầu phòng yên tĩnh',
    totalSpend: 1500000,
    debtBalance: 0,
    loyaltyPoints: 75,
    walletBalance: 1200000,
    createdAt: '2026-10-15T09:15:00Z',
  },
];

export const INITIAL_CARDS: TreatmentCard[] = [
  {
    id: 'card-01',
    customerId: 'cus-01',
    customerName: 'Đặng Thu Thảo',
    customerPhone: '0912345678',
    packageId: 'pkg-01',
    packageName: 'Gói Trị Mụn Chuyên Sâu Y Khoa (10 Buổi)',
    totalSessions: 10,
    usedSessions: 3,
    remainingSessions: 7,
    status: 'active',
    activatedDate: '2026-09-01T09:00:00Z',
    expiryDate: '2027-03-01T23:59:59Z',
  },
  {
    id: 'card-02',
    customerId: 'cus-02',
    customerName: 'Hoàng Mai Anh',
    customerPhone: '0987654321',
    packageId: 'pkg-02',
    packageName: 'Combo Nữ Hoàng Thư Giãn (10 Buổi)',
    totalSessions: 10,
    usedSessions: 2,
    remainingSessions: 8,
    status: 'active',
    activatedDate: '2026-10-05T15:00:00Z',
    expiryDate: '2027-04-05T23:59:59Z',
  },
];

export const INITIAL_CHECKINS: CheckinRecord[] = [
  {
    id: 'chk-01',
    cardId: 'card-01',
    customerId: 'cus-01',
    customerName: 'Đặng Thu Thảo',
    serviceId: 'srv-01',
    serviceName: 'Trị Mụn Chuẩn Y Khoa 12 Bước',
    sessionNumber: 3,
    timestamp: '2026-10-28T14:30:00Z',
    primaryTechId: 'staff-admin-01',
    primaryTechName: 'Liin Spa',
    stepsPerformed: 'Lấy sạch cồi mụn vùng trán & má, điện tím, đắp mặt nạ bạc hà dịu da',
    clientReaction: 'Da giảm sưng đỏ nhanh, khách hài lòng không đau rát',
    beforePhotoUrl: 'https://images.unsplash.com/photo-1512290900672-1f551a37c385?auto=format&fit=crop&w=400&q=80',
    afterPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-01',
    code: 'HD-20261103-001',
    customerId: 'cus-01',
    customerName: 'Đặng Thu Thảo',
    customerPhone: '0912345678',
    cashierId: 'staff-admin-01',
    cashierName: 'Liin Spa',
    sellerId: 'staff-admin-01',
    sellerName: 'Liin Spa',
    items: [
      {
        type: 'package',
        itemId: 'pkg-01',
        name: 'Gói Trị Mụn Chuyên Sâu Y Khoa (10 Buổi)',
        quantity: 1,
        price: 3600000,
      },
      {
        type: 'product',
        itemId: 'inv-com-01',
        name: 'Serum Phục hồi da B5 La Roche-Posay',
        quantity: 1,
        price: 520000,
      },
    ],
    subtotal: 4120000,
    discountAmount: 120000,
    totalAmount: 4000000,
    paidAmount: 4000000,
    debtAmount: 0,
    paymentMethod: 'vietqr',
    grossProfit: 2850000,
    createdAt: '2026-11-03T10:15:00Z',
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-01',
    customerId: 'cus-01',
    customerName: 'Đặng Thu Thảo',
    customerPhone: '0912345678',
    serviceId: 'srv-01',
    serviceName: 'Trị Mụn Chuẩn Y Khoa 12 Bước',
    staffId: 'staff-admin-01',
    staffName: 'Liin Spa',
    bedId: 'Giường 01 (Phòng Facial)',
    startTime: '2026-11-04T09:30',
    endTime: '2026-11-04T10:45',
    status: 'in_progress',
    notes: 'Buổi 4 trong gói trị mụn',
  },
  {
    id: 'apt-02',
    customerId: 'cus-02',
    customerName: 'Hoàng Mai Anh',
    customerPhone: '0987654321',
    serviceId: 'srv-03',
    serviceName: 'Massage Body Đá Nóng Thụy Điển',
    staffId: 'staff-admin-01',
    staffName: 'Liin Spa',
    bedId: 'Giường 03 (Phòng Body VIP)',
    startTime: '2026-11-04T11:00',
    endTime: '2026-11-04T12:30',
    status: 'booked',
    notes: 'Yêu cầu phòng ấm, tinh dầu hoa hồng',
  },
  {
    id: 'apt-03',
    customerId: 'cus-03',
    customerName: 'Vũ Hoài Nam',
    customerPhone: '0903112233',
    serviceId: 'srv-04',
    serviceName: 'Triệt Lông Diode Laser',
    staffId: 'staff-admin-01',
    staffName: 'Liin Spa',
    bedId: 'Giường 02 (Phòng Laser)',
    startTime: '2026-11-04T14:00',
    endTime: '2026-11-04T14:30',
    status: 'booked',
    notes: 'Khách mới',
  },
  {
    id: 'apt-online-01',
    customerId: 'cus-01',
    customerName: 'Lê Bảo Ngọc',
    customerPhone: '0933889900',
    serviceId: 'srv-02',
    serviceName: 'Cấy Tảo Xoắn Nano & Tế Bào Gốc',
    staffId: 'staff-admin-01',
    staffName: 'Liin Spa',
    bedId: 'Giường 01 (Phòng Facial)',
    startTime: '2026-11-04T15:30',
    endTime: '2026-11-04T16:30',
    status: 'pending_online',
    isOnlineBooking: true,
    bookedAt: '2026-11-04T10:00:00Z',
    emailNotifiedTo: 'contact@liinspa.vn',
    notes: 'Khách quét QR đặt lịch online qua điện thoại',
  },
];

export const INITIAL_COMMISSIONS: CommissionEntry[] = [];

// LocalStorage helpers
export const storageService = {
  get<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },
  init() {
    // 1. Purge all sample / demo accounts and ensure ONLY Admin (liin) and user-created custom staff remain
    const DEMO_AND_SAMPLE_USERNAMES = new Set(['thungan', 'thao', 'letan', 'letan01', 'ktv_hanh', 'ktv_quynhanh']);
    const DEMO_AND_SAMPLE_IDS = new Set(['staff-recep-01', 'staff-tech-01', 'staff-tech-02']);
    const DEMO_AND_SAMPLE_NAMES = new Set(['Lê Thu Trang', 'Trần Hồng Hạnh', 'Phạm Quỳnh Anh', 'Thu Ngân - Lễ Tân', 'Nguyễn Thu Thảo']);

    const existingStaffStr = localStorage.getItem(STORAGE_KEYS.STAFF);
    if (!existingStaffStr) {
      this.set(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    } else {
      try {
        const storedStaff = JSON.parse(existingStaffStr) as Staff[];
        if (Array.isArray(storedStaff)) {
          // Filter out sample and legacy demo accounts
          const nonDemoStaff = storedStaff.filter(
            (s) =>
              !DEMO_AND_SAMPLE_USERNAMES.has(s.username?.toLowerCase()) &&
              !DEMO_AND_SAMPLE_IDS.has(s.id) &&
              !DEMO_AND_SAMPLE_NAMES.has(s.name)
          );

          // Ensure Admin (liin) exists and is primary admin
          const liinIdx = nonDemoStaff.findIndex((s) => s.username === 'liin');
          if (liinIdx !== -1) {
            const liin = nonDemoStaff[liinIdx];
            liin.role = 'admin';
            liin.isPrimaryAdmin = true;
            if (!liin.title || liin.title === 'admin') {
              liin.title = 'Chủ Spa & Quản trị viên chính';
            }
            nonDemoStaff.forEach((s) => {
              if (s.id !== liin.id) s.isPrimaryAdmin = false;
            });
            nonDemoStaff.splice(liinIdx, 1);
            nonDemoStaff.unshift(liin);
          } else {
            nonDemoStaff.unshift(INITIAL_STAFF[0]);
          }

          this.set(STORAGE_KEYS.STAFF, nonDemoStaff);
        }
      } catch (err) {
        console.error('Error migrating staff primary admin:', err);
        this.set(STORAGE_KEYS.STAFF, INITIAL_STAFF);
      }
    }

    // 2. Purge commissions related to demo / sample staff
    const existingCommissionsStr = localStorage.getItem(STORAGE_KEYS.COMMISSIONS);
    if (existingCommissionsStr) {
      try {
        const storedCommissions = JSON.parse(existingCommissionsStr) as CommissionEntry[];
        if (Array.isArray(storedCommissions)) {
          const cleanedCommissions = storedCommissions.filter(
            (c) => !DEMO_AND_SAMPLE_NAMES.has(c.staffName) && !DEMO_AND_SAMPLE_IDS.has(c.staffId)
          );
          this.set(STORAGE_KEYS.COMMISSIONS, cleanedCommissions);
        }
      } catch {
        this.set(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
      }
    } else {
      this.set(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
    }

    // 3. Reassign demo / sample staff in appointments to Admin (Liin Spa)
    const existingAptsStr = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    if (existingAptsStr) {
      try {
        const storedApts = JSON.parse(existingAptsStr) as Appointment[];
        if (Array.isArray(storedApts)) {
          const cleanedApts = storedApts.map((a) => {
            if (DEMO_AND_SAMPLE_NAMES.has(a.staffName) || DEMO_AND_SAMPLE_IDS.has(a.staffId)) {
              return { ...a, staffId: 'staff-admin-01', staffName: 'Liin Spa' };
            }
            return a;
          });
          this.set(STORAGE_KEYS.APPOINTMENTS, cleanedApts);
        }
      } catch {
        this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
      }
    } else {
      this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }

    // 4. Clean demo / sample staff in orders
    const existingOrdersStr = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (existingOrdersStr) {
      try {
        const storedOrders = JSON.parse(existingOrdersStr) as Order[];
        if (Array.isArray(storedOrders)) {
          const cleanedOrders = storedOrders.map((ord) => ({
            ...ord,
            cashierId: DEMO_AND_SAMPLE_NAMES.has(ord.cashierName) || DEMO_AND_SAMPLE_IDS.has(ord.cashierId) ? 'staff-admin-01' : ord.cashierId,
            cashierName: DEMO_AND_SAMPLE_NAMES.has(ord.cashierName) || DEMO_AND_SAMPLE_IDS.has(ord.cashierId) ? 'Liin Spa' : ord.cashierName,
            sellerId: DEMO_AND_SAMPLE_NAMES.has(ord.sellerName) || DEMO_AND_SAMPLE_IDS.has(ord.sellerId) ? 'staff-admin-01' : ord.sellerId,
            sellerName: DEMO_AND_SAMPLE_NAMES.has(ord.sellerName) || DEMO_AND_SAMPLE_IDS.has(ord.sellerId) ? 'Liin Spa' : ord.sellerName,
          }));
          this.set(STORAGE_KEYS.ORDERS, cleanedOrders);
        }
      } catch {
        this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
      }
    } else {
      this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }

    // 5. Clean demo / sample staff in checkins
    const existingCheckinsStr = localStorage.getItem(STORAGE_KEYS.CHECKINS);
    if (existingCheckinsStr) {
      try {
        const storedCheckins = JSON.parse(existingCheckinsStr) as CheckinRecord[];
        if (Array.isArray(storedCheckins)) {
          const cleanedCheckins = storedCheckins.map((chk) => ({
            ...chk,
            primaryTechId: DEMO_AND_SAMPLE_NAMES.has(chk.primaryTechName) || DEMO_AND_SAMPLE_IDS.has(chk.primaryTechId) ? 'staff-admin-01' : chk.primaryTechId,
            primaryTechName: DEMO_AND_SAMPLE_NAMES.has(chk.primaryTechName) || DEMO_AND_SAMPLE_IDS.has(chk.primaryTechId) ? 'Liin Spa' : chk.primaryTechName,
          }));
          this.set(STORAGE_KEYS.CHECKINS, cleanedCheckins);
        }
      } catch {
        this.set(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
      }
    } else {
      this.set(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    }

    // 6. Reset active role if it pointed to sample or demo staff
    const currentActiveRole = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ROLE);
    if (
      currentActiveRole &&
      (DEMO_AND_SAMPLE_NAMES.has(currentActiveRole) ||
        DEMO_AND_SAMPLE_IDS.has(currentActiveRole) ||
        DEMO_AND_SAMPLE_USERNAMES.has(currentActiveRole) ||
        currentActiveRole === 'admin')
    ) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ROLE, 'staff-admin-01');
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      this.set(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      this.set(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PACKAGES)) {
      this.set(STORAGE_KEYS.PACKAGES, INITIAL_PACKAGES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CARDS)) {
      this.set(STORAGE_KEYS.CARDS, INITIAL_CARDS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKINS)) {
      this.set(STORAGE_KEYS.CHECKINS, INITIAL_CHECKINS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      this.set(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      this.set(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
      this.set(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMISSIONS)) {
      this.set(STORAGE_KEYS.COMMISSIONS, INITIAL_COMMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, INITIAL_SPA_SETTINGS);
    }
  },
  KEYS: STORAGE_KEYS,
};

