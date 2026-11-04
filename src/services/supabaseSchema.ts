export const SUPABASE_SCHEMA_SQL = `-- ====================================================================
-- LIIN SPA & CLINIC - SUPABASE DATABASE SCHEMA & SEED DATA
-- Chạy toàn bộ file này trong Supabase Dashboard -> SQL Editor -> Run
-- ====================================================================

-- 1. BẢNG CÀI ĐẶT THƯƠNG HIỆU & HỆ THỐNG (spa_settings)
CREATE TABLE IF NOT EXISTS public.spa_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    spa_name TEXT NOT NULL,
    slogan TEXT,
    logo_url TEXT,
    icon_type TEXT DEFAULT 'sparkles',
    theme_preset TEXT DEFAULT 'rose_gold',
    hotline TEXT,
    phone TEXT,
    address TEXT,
    email TEXT,
    website TEXT,
    working_hours TEXT,
    tax_code TEXT,
    bank_id TEXT DEFAULT 'MB',
    bank_name TEXT DEFAULT 'MBBank (Ngân hàng Quân Đội)',
    account_no TEXT,
    account_name TEXT,
    qr_prefix TEXT DEFAULT 'LIINSPA',
    receipt_footer TEXT,
    points_rate NUMERIC DEFAULT 20000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG NHÂN VIÊN & TÀI KHOẢN (staff)
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    start_date DATE DEFAULT CURRENT_DATE,
    role TEXT NOT NULL DEFAULT 'technician',
    title TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    base_salary NUMERIC DEFAULT 0,
    sales_commission_rate NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active',
    avatar TEXT,
    is_primary_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẢNG KHÁCH HÀNG (customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    gender TEXT DEFAULT 'female',
    birthday DATE,
    source TEXT DEFAULT 'walk_in',
    skin_type TEXT,
    allergies TEXT,
    notes TEXT,
    total_spend NUMERIC DEFAULT 0,
    debt_balance NUMERIC DEFAULT 0,
    loyalty_points NUMERIC DEFAULT 0,
    wallet_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BẢNG DỊCH VỤ SPA (services)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60,
    price NUMERIC NOT NULL DEFAULT 0,
    happy_hour_price NUMERIC,
    tour_fee_primary NUMERIC DEFAULT 0,
    tour_fee_secondary NUMERIC DEFAULT 0,
    bom JSONB DEFAULT '[]'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BẢNG GÓI COMBO / LIỆU TRÌNH (packages)
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    original_price NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    validity_days INTEGER DEFAULT 180,
    services JSONB DEFAULT '[]'::jsonb,
    sales_commission NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BẢNG THẺ DỊCH VỤ / THẺ LIỆU TRÌNH KHÁCH MUA (treatment_cards)
CREATE TABLE IF NOT EXISTS public.treatment_cards (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    total_sessions INTEGER NOT NULL,
    used_sessions INTEGER NOT NULL DEFAULT 0,
    remaining_sessions INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    activated_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. BẢNG CHECK-IN LÀM BUỔI & HỒ SƠ ĐIỀU TRỊ (checkins)
CREATE TABLE IF NOT EXISTS public.checkins (
    id TEXT PRIMARY KEY,
    card_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    session_number INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    primary_tech_id TEXT,
    primary_tech_name TEXT,
    secondary_tech_id TEXT,
    secondary_tech_name TEXT,
    steps_performed TEXT,
    client_reaction TEXT,
    before_photo_url TEXT,
    after_photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BẢNG ĐƠN HÀNG & HÓA ĐƠN POS (orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    cashier_id TEXT,
    cashier_name TEXT,
    seller_id TEXT,
    seller_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    paid_amount NUMERIC NOT NULL DEFAULT 0,
    debt_amount NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'cash',
    gross_profit NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. BẢNG QUẢN LÝ 2 KHO HÀNG HÓA (inventory)
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'consumable',
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL DEFAULT 0,
    min_threshold NUMERIC DEFAULT 5,
    cost_price NUMERIC DEFAULT 0,
    retail_price NUMERIC DEFAULT 0,
    expiry_date DATE,
    batch_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. BẢNG LỊCH HẸN & ĐẶT LỊCH (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    staff_id TEXT,
    staff_name TEXT,
    bed_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'booked',
    notes TEXT,
    is_online_booking BOOLEAN DEFAULT FALSE,
    booked_at TIMESTAMPTZ DEFAULT NOW(),
    email_notified_to TEXT,
    card_id TEXT,
    is_card_booking BOOLEAN DEFAULT FALSE,
    session_deducted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. BẢNG HOA HỒNG & TOUR FEE NHÂN VIÊN (commissions)
CREATE TABLE IF NOT EXISTS public.commissions (
    id TEXT PRIMARY KEY,
    staff_id TEXT NOT NULL,
    staff_name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    reference_code TEXT,
    description TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- TẠO CÁC CHỈ MỤC (INDEXES) TỐI ƯU HIỆU NĂNG TÌM KIẾM
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers (full_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_treatment_cards_customer ON public.treatment_cards (customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_time ON public.appointments (start_time);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON public.inventory (sku);
CREATE INDEX IF NOT EXISTS idx_staff_username ON public.staff (username);

-- ====================================================================
-- PHÂN QUYỀN TRUY CẬP (ROW LEVEL SECURITY - RLS)
-- Cho phép truy cập dữ liệu qua Supabase Anon Key
-- ====================================================================
ALTER TABLE public.spa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho phép đọc & ghi (SELECT, INSERT, UPDATE, DELETE)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public full access policy" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Public full access policy" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;

-- ====================================================================
-- SEED DỮ LIỆU BAN ĐẦU (INITIAL DATA)
-- ====================================================================

-- 1. Cài đặt Spa
INSERT INTO public.spa_settings (id, spa_name, slogan, icon_type, theme_preset, hotline, phone, address, email, website, working_hours, tax_code, bank_id, bank_name, account_no, account_name, qr_prefix, receipt_footer, points_rate)
VALUES (
    'default',
    'Liin Spa & Clinic',
    'Viện Thẩm Mỹ Trị Liệu & Chăm Sóc Da Y Khoa Chuẩn Hàn',
    'sparkles',
    'rose_gold',
    '1900 8686',
    '0901 234 567',
    'Tầng 3, Tòa Nhà Hoàng Gia Luxury, 128 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh',
    'contact@liinspa.vn',
    'https://liinspa.vn',
    '08:30 - 20:30 (Thứ 2 - Chủ Nhật)',
    '0318992233',
    'MB',
    'MBBank (Ngân hàng Quân Đội)',
    '090123456789',
    'LIIN SPA VIETNAM',
    'LIINSPA',
    'Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Liin Spa & Clinic. Hẹn gặp lại Quý khách ở buổi trị liệu tiếp theo!',
    20000
) ON CONFLICT (id) DO UPDATE SET
    spa_name = EXCLUDED.spa_name,
    slogan = EXCLUDED.slogan,
    phone = EXCLUDED.phone,
    account_no = EXCLUDED.account_no,
    account_name = EXCLUDED.account_name,
    updated_at = NOW();

-- 2. Tài khoản Admin chính (Liin Spa - user: liin / pass: 123456)
INSERT INTO public.staff (id, name, phone, username, password, start_date, role, title, skills, base_salary, sales_commission_rate, status, is_primary_admin)
VALUES (
    'staff-admin-01',
    'Liin Spa',
    '0901234567',
    'liin',
    '123456',
    '2026-11-04',
    'admin',
    'Chủ Spa & Quản trị viên chính',
    '["srv-01", "srv-02", "srv-03", "srv-04"]'::jsonb,
    20000000,
    5,
    'active',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    title = EXCLUDED.title,
    is_primary_admin = true,
    updated_at = NOW();

-- 3. Kho hàng hóa (Tiêu hao nội bộ & Bán lẻ)
INSERT INTO public.inventory (id, sku, barcode, name, type, unit, quantity, min_threshold, cost_price, retail_price, expiry_date, batch_number)
VALUES
    ('inv-mat-01', 'NVL-TT-01', '893001001', 'Tinh chất Tràm trà Kháng viêm (Chai 500ml)', 'consumable', 'ml', 420, 100, 500, 0, '2027-10-15', 'LOT-2026-A1'),
    ('inv-mat-02', 'NVL-MN-02', '893001002', 'Mặt nạ Bạc hà Dịu da Giảm đỏ', 'consumable', 'miếng', 85, 20, 15000, 0, '2028-01-20', 'LOT-2026-B4'),
    ('inv-mat-03', 'NVL-EGF-03', '893001003', 'Tế bào gốc Phục hồi EGF Thụy Sĩ (Ống 10ml)', 'consumable', 'ml', 12, 15, 80000, 0, '2027-06-30', 'LOT-2025-EGF'),
    ('inv-mat-04', 'NVL-OIL-04', '893001004', 'Tinh dầu Massage Hoa hồng Pháp (Chai 1000ml)', 'consumable', 'ml', 750, 200, 300, 0, '2027-12-01', 'LOT-2026-OIL'),
    ('inv-mat-05', 'NVL-GEL-05', '893001005', 'Gel lạnh Triệt lông Chuyên dụng (Can 5000ml)', 'consumable', 'ml', 3800, 500, 50, 0, '2028-05-10', 'LOT-2026-GEL'),
    ('inv-com-01', 'SP-B5-01', '893600101', 'Serum Phục hồi da B5 La Roche-Posay 30ml', 'commercial', 'lọ', 18, 5, 380000, 520000, '2028-03-12', 'LRP-2026-B5'),
    ('inv-com-02', 'SP-KCN-02', '893600102', 'Kem chống nắng Dịu nhẹ Cell Fusion C 50ml', 'commercial', 'tuýp', 4, 6, 280000, 420000, '2027-08-15', 'CFC-2026-KCN'),
    ('inv-com-03', 'SP-BHA-03', '893600103', 'Tẩy Tế Bào Chết Paula''s Choice 2% BHA 118ml', 'commercial', 'chai', 12, 4, 650000, 890000, '2028-09-01', 'PC-2026-BHA')
ON CONFLICT (id) DO NOTHING;

-- 4. Bảng dịch vụ Spa
INSERT INTO public.services (id, code, name, category, description, duration_minutes, price, happy_hour_price, tour_fee_primary, tour_fee_secondary, bom, steps)
VALUES
    (
        'srv-01',
        'DV-MUN-01',
        'Trị Mụn Chuẩn Y Khoa 12 Bước Kháng Khuẩn Tầng Sâu',
        'Trị liệu da mặt',
        'Quy trình lấy nhân mụn chuẩn y khoa 12 bước với dụng cụ tiệt trùng 100%, kết hợp chiếu ánh sáng sinh học Bio-Light và tinh chất tràm trà kháng viêm giúp gom cồi mụn, giảm sưng đỏ tức thì mà không để lại sẹo thâm. Phù hợp cho da mụn viêm, mụn ẩn và mụn đầu đen.',
        75,
        450000,
        380000,
        60000,
        30000,
        '[{"materialId":"inv-mat-01","materialName":"Tinh chất Tràm trà","quantity":15,"unit":"ml"},{"materialId":"inv-mat-02","materialName":"Mặt nạ Bạc hà Dịu da","quantity":1,"unit":"miếng"}]'::jsonb,
        '["Tẩy trang & Rửa mặt sạch sâu","Xông hơi thông thoáng lỗ chân lông & Tẩy da chết","Hút bã nhờn & dầu thừa chân không","Khử trùng bề mặt bằng dung dịch Povidine pha loãng","Lấy nhân mụn chuẩn y khoa bằng tăm bông chuyên dụng","Chiếu tia điện tím tiệt trùng vết thương hở","Thoa tinh chất Tràm trà kháng viêm","Đắp mặt nạ Bạc hà làm dịu và giảm sưng đỏ","Chiếu ánh sáng sinh học Bio-Light màu xanh lam","Massage đầu cổ vai gáy thư giãn","Lau sạch mặt & Thoa kem dưỡng khóa ẩm","Thoa kem chống nắng bảo vệ da trước khi ra về"]'::jsonb
    ),
    (
        'srv-02',
        'DV-EGF-02',
        'Cấy Tảo Xoắn Nano & Tế Bào Gốc Trẻ Hóa Căng Bóng',
        'Chăm sóc da chuyên sâu',
        'Công nghệ cấy vi điểm tảo xoắn tươi kết hợp tế bào gốc EGF Thụy Sĩ giúp phục hồi hàng rào bảo vệ da, thu nhỏ lỗ chân lông và kích thích sản sinh collagen tự nhiên. Mang lại làn da căng bóng ngậm nước chuẩn Hàn Quốc ngay sau buổi đầu tiên.',
        60,
        650000,
        550000,
        80000,
        40000,
        '[{"materialId":"inv-mat-03","materialName":"Tế bào gốc Phục hồi EGF","quantity":3,"unit":"ml"},{"materialId":"inv-mat-02","materialName":"Mặt nạ Bạc hà Dịu da","quantity":1,"unit":"miếng"}]'::jsonb,
        '["Làm sạch sâu da mặt 3 bước","Tẩy da chết enzym sinh học","Cấy tinh chất tảo xoắn tươi & tế bào gốc qua đầu Nano không xâm lấn","Đi điện di ion lạnh thẩm thấu sâu dưỡng chất","Đắp mặt nạ khóa ẩm & Chiếu ánh sáng vàng tái tạo collagen"]'::jsonb
    ),
    (
        'srv-03',
        'DV-MASS-03',
        'Massage Body Đá Nóng Thụy Điển Đả Thông Kinh Lạc',
        'Massage & Thư giãn',
        'Phương pháp massage thư giãn Thụy Điển kết hợp đá núi lửa bazan hấp nóng ở nhiệt độ 55-60°C và tinh dầu hoa hồng Pháp. Giúp giải tỏa căng cơ, hút hàn khí, đả thông các đường kinh lạc và cải thiện tuần hoàn máu toàn thân.',
        90,
        500000,
        420000,
        70000,
        35000,
        '[{"materialId":"inv-mat-04","materialName":"Tinh dầu Massage Hoa hồng","quantity":30,"unit":"ml"}]'::jsonb,
        '["Ngâm chân thảo dược nước ấm muối gừng","Khai thông huyệt đạo toàn thân","Massage xoa bóp dầu hoa hồng Thụy Điển","Đi đá núi lửa nóng bazan hút hàn khí vùng lưng","Xoa bóp thư giãn cổ vai gáy và da đầu"]'::jsonb
    ),
    (
        'srv-04',
        'DV-LASER-04',
        'Triệt Lông Diode Laser Công Nghệ Băng Băng Vùng Nách/Mặt',
        'Triệt lông vĩnh viễn',
        'Công nghệ triệt lông Diode Laser bước sóng 808nm với đầu đá Sapphire làm lạnh âm 5°C không gây đau rát. Triệt tiêu tận gốc mầm nhú nang lông, ngăn ngừa viêm nang lông và làm sáng mịn vùng da thâm sần.',
        30,
        250000,
        199000,
        40000,
        20000,
        '[{"materialId":"inv-mat-05","materialName":"Gel lạnh Triệt lông","quantity":25,"unit":"ml"}]'::jsonb,
        '["Vệ sinh & Cạo sạch lông vùng điều trị","Thoa gel lạnh chuyên dụng bảo vệ biểu bì","Điều chỉnh năng lượng Diode Laser bước sóng 808nm","Bắn xung ánh sáng triệt tiêu nang lông","Lau sạch gel & Thoa kem dưỡng làm dịu"]'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- 5. Gói Combo / Liệu trình
INSERT INTO public.packages (id, name, original_price, price, validity_days, services, sales_commission)
VALUES
    (
        'pkg-01',
        'Gói Trị Mụn Chuyên Sâu Y Khoa (Liệu trình 10 Buổi)',
        4500000,
        3600000,
        180,
        '[{"serviceId":"srv-01","serviceName":"Trị Mụn Chuẩn Y Khoa 12 Bước","sessionCount":10}]'::jsonb,
        250000
    ),
    (
        'pkg-02',
        'Combo Nữ Hoàng Thư Giãn (5 Buổi Body Đá Nóng + 5 Buổi Trẻ Hóa Tảo Nano)',
        5750000,
        4500000,
        180,
        '[{"serviceId":"srv-03","serviceName":"Massage Body Đá Nóng Thụy Điển","sessionCount":5},{"serviceId":"srv-02","serviceName":"Cấy Tảo Xoắn Nano & Tế Bào Gốc","sessionCount":5}]'::jsonb,
        300000
    ),
    (
        'pkg-03',
        'Liệu Trình Triệt Lông Trọn Gói Bảo Hành 3 Năm (10 Buổi)',
        2500000,
        1800000,
        365,
        '[{"serviceId":"srv-04","serviceName":"Triệt Lông Diode Laser","sessionCount":10}]'::jsonb,
        150000
    )
ON CONFLICT (id) DO NOTHING;

-- 6. Khách hàng
INSERT INTO public.customers (id, full_name, phone, gender, birthday, source, skin_type, allergies, notes, total_spend, debt_balance, loyalty_points, wallet_balance, created_at)
VALUES
    ('cus-01', 'Đặng Thu Thảo', '0912345678', 'female', '1995-10-24', 'facebook', 'Da dầu mụn, nhạy cảm vùng chữ T', 'Không dị ứng mỹ phẩm', 'Thích massage lực nhẹ vùng vai', 7800000, 0, 390, 500000, '2026-08-10 10:00:00+00'),
    ('cus-02', 'Hoàng Mai Anh', '0987654321', 'female', '1992-04-15', 'referral', 'Da khô thiếu ẩm, có nám nhẹ 2 bên gò má', 'Dị ứng cồn và hương liệu nhân tạo đậm mùi', 'Khách thân thiết', 4500000, 1500000, 220, 0, '2026-09-02 14:30:00+00'),
    ('cus-03', 'Vũ Hoài Nam', '0903112233', 'male', '1988-12-05', 'walk_in', 'Da thường, mỏi cơ lưng do ngồi văn phòng', 'Không', 'Yêu cầu phòng yên tĩnh', 1500000, 0, 75, 1200000, '2026-10-15 09:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- 7. Thẻ liệu trình của khách
INSERT INTO public.treatment_cards (id, customer_id, customer_name, customer_phone, package_id, package_name, total_sessions, used_sessions, remaining_sessions, status, activated_date, expiry_date)
VALUES
    ('card-01', 'cus-01', 'Đặng Thu Thảo', '0912345678', 'pkg-01', 'Gói Trị Mụn Chuyên Sâu Y Khoa (10 Buổi)', 10, 3, 7, 'active', '2026-09-01 09:00:00+00', '2027-03-01 23:59:59+00'),
    ('card-02', 'cus-02', 'Hoàng Mai Anh', '0987654321', 'pkg-02', 'Combo Nữ Hoàng Thư Giãn (10 Buổi)', 10, 2, 8, 'active', '2026-10-05 15:00:00+00', '2027-04-05 23:59:59+00')
ON CONFLICT (id) DO NOTHING;

-- 8. Lịch hẹn (Appointments)
INSERT INTO public.appointments (id, customer_id, customer_name, customer_phone, service_id, service_name, staff_id, staff_name, bed_id, start_time, end_time, status, notes, is_online_booking, booked_at, email_notified_to)
VALUES
    ('apt-01', 'cus-01', 'Đặng Thu Thảo', '0912345678', 'srv-01', 'Trị Mụn Chuẩn Y Khoa 12 Bước', 'staff-admin-01', 'Liin Spa', 'Giường 01 (Phòng Facial)', '2026-11-04T09:30', '2026-11-04T10:45', 'in_progress', 'Buổi 4 trong gói trị mụn', false, '2026-11-04 08:00:00+00', NULL),
    ('apt-02', 'cus-02', 'Hoàng Mai Anh', '0987654321', 'srv-03', 'Massage Body Đá Nóng Thụy Điển', 'staff-admin-01', 'Liin Spa', 'Giường 03 (Phòng Body VIP)', '2026-11-04T11:00', '2026-11-04T12:30', 'booked', 'Yêu cầu phòng ấm, tinh dầu hoa hồng', false, '2026-11-04 08:30:00+00', NULL),
    ('apt-03', 'cus-03', 'Vũ Hoài Nam', '0903112233', 'srv-04', 'Triệt Lông Diode Laser', 'staff-admin-01', 'Liin Spa', 'Giường 02 (Phòng Laser)', '2026-11-04T14:00', '2026-11-04T14:30', 'booked', 'Khách mới', false, '2026-11-04 09:00:00+00', NULL),
    ('apt-online-01', 'cus-01', 'Lê Bảo Ngọc', '0933889900', 'srv-02', 'Cấy Tảo Xoắn Nano & Tế Bào Gốc', 'staff-admin-01', 'Liin Spa', 'Giường 01 (Phòng Facial)', '2026-11-04T15:30', '2026-11-04T16:30', 'pending_online', 'Khách quét QR đặt lịch online qua điện thoại', true, '2026-11-04 10:00:00+00', 'contact@liinspa.vn')
ON CONFLICT (id) DO NOTHING;

-- 9. Đơn hàng (Orders)
INSERT INTO public.orders (id, code, customer_id, customer_name, customer_phone, cashier_id, cashier_name, seller_id, seller_name, items, subtotal, discount_amount, total_amount, paid_amount, debt_amount, payment_method, gross_profit, created_at)
VALUES (
    'ord-01',
    'HD-20261103-001',
    'cus-01',
    'Đặng Thu Thảo',
    '0912345678',
    'staff-admin-01',
    'Liin Spa',
    'staff-admin-01',
    'Liin Spa',
    '[{"type":"package","itemId":"pkg-01","name":"Gói Trị Mụn Chuyên Sâu Y Khoa (10 Buổi)","quantity":1,"price":3600000},{"type":"product","itemId":"inv-com-01","name":"Serum Phục hồi da B5 La Roche-Posay","quantity":1,"price":520000}]'::jsonb,
    4120000,
    120000,
    4000000,
    4000000,
    0,
    'vietqr',
    2850000,
    '2026-11-03 10:15:00+00'
) ON CONFLICT (id) DO NOTHING;
`;
