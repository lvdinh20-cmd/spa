import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { VIETNAMESE_BANKS, generateVietQrUrl } from '../../services/vietqr';
import { SpaSettings } from '../../types';
import { formatVND } from '../../domain/financial';
import {
  Settings,
  Sparkles,
  Crown,
  Flower2,
  Gem,
  Heart,
  CreditCard,
  Building2,
  Phone,
  MapPin,
  Clock,
  Mail,
  Globe,
  Receipt,
  CheckCircle2,
  QrCode,
  Copy,
  Check,
  Palette,
  ShieldCheck,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpaSettingsManager: React.FC = () => {
  const { settings, updateSettings } = useSpaData();

  const [activeTab, setActiveTab] = useState<'brand' | 'bank' | 'contact' | 'invoice'>('brand');

  // Form states
  const [spaName, setSpaName] = useState(settings.spaName);
  const [slogan, setSlogan] = useState(settings.slogan);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [iconType, setIconType] = useState<SpaSettings['iconType']>(settings.iconType || 'sparkles');
  const [themePreset, setThemePreset] = useState<SpaSettings['themePreset']>(settings.themePreset || 'rose_gold');

  // Bank states
  const [bankId, setBankId] = useState(settings.bankId || 'MB');
  const [accountNo, setAccountNo] = useState(settings.accountNo || '090123456789');
  const [accountName, setAccountName] = useState(settings.accountName || 'LIIN SPA VIETNAM');
  const [qrPrefix, setQrPrefix] = useState(settings.qrPrefix || 'LIINSPA');

  // Contact states
  const [hotline, setHotline] = useState(settings.hotline);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [email, setEmail] = useState(settings.email);
  const [website, setWebsite] = useState(settings.website);
  const [workingHours, setWorkingHours] = useState(settings.workingHours);
  const [taxCode, setTaxCode] = useState(settings.taxCode);

  // Invoice & Loyalty
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [pointsRate, setPointsRate] = useState(settings.pointsRate || 20000);

  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const selectedBank = VIETNAMESE_BANKS.find((b) => b.id === bankId) || VIETNAMESE_BANKS[0];

  // Dynamic Test QR Code
  const sampleQrUrl = generateVietQrUrl(500000, 'TESTQR', {
    bankId,
    accountNo,
    accountName,
    qrPrefix,
  });

  const iconOptions: { key: SpaSettings['iconType']; label: string; icon: React.ReactNode }[] = [
    { key: 'sparkles', label: 'Tỏa Sáng (Sparkles)', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
    { key: 'crown', label: 'Vương Miện (Crown)', icon: <Crown className="w-5 h-5 text-amber-500" /> },
    { key: 'flower', label: 'Hoa Sen / Hoa Hồng (Flower)', icon: <Flower2 className="w-5 h-5 text-rose-500" /> },
    { key: 'gem', label: 'Kim Cương (Gem)', icon: <Gem className="w-5 h-5 text-cyan-500" /> },
    { key: 'heart', label: 'Trái Tim Tận Tâm (Heart)', icon: <Heart className="w-5 h-5 text-rose-500" /> },
  ];

  const themeOptions: { key: SpaSettings['themePreset']; label: string; previewClass: string }[] = [
    { key: 'rose_gold', label: 'Rose Gold Luxury (Hồng Vàng Hoàng Gia)', previewClass: 'from-rose-500 to-amber-400' },
    { key: 'champagne_gold', label: 'Champagne Gold (Vàng Sâm Panh)', previewClass: 'from-amber-600 to-yellow-300' },
    { key: 'emerald_luxury', label: 'Emerald Jade (Ngọc Lục Bảo Spa)', previewClass: 'from-emerald-600 to-teal-400' },
    { key: 'royal_ruby', label: 'Royal Ruby (Đỏ Ruby Quý Phái)', previewClass: 'from-rose-700 to-pink-600' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!spaName.trim()) {
      alert('Vui lòng nhập tên Spa!');
      return;
    }

    if (!accountNo.trim() || !accountName.trim()) {
      alert('Vui lòng nhập Số tài khoản và Tên chủ tài khoản nhận tiền!');
      return;
    }

    updateSettings({
      spaName: spaName.trim(),
      slogan: slogan.trim(),
      logoUrl: logoUrl.trim(),
      iconType,
      themePreset,
      bankId,
      bankName: selectedBank.name,
      accountNo: accountNo.trim().replace(/\s+/g, ''),
      accountName: accountName.trim().toUpperCase(),
      qrPrefix: qrPrefix.trim().toUpperCase(),
      hotline: hotline.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
      website: website.trim(),
      workingHours: workingHours.trim(),
      taxCode: taxCode.trim(),
      receiptFooter: receiptFooter.trim(),
      pointsRate: Number(pointsRate),
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(accountNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-rose-600" />
            <span>Cài Đặt Hệ Thống & Thương Hiệu</span>
          </h1>
          <p className="text-xs text-slate-500">
            Cấu hình nhận diện thương hiệu, logo icon, thông tin liên hệ và tài khoản ngân hàng nhận tiền VietQR Napas247
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all self-start sm:self-auto cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaved ? 'Đã Lưu Thành Công!' : 'Lưu Tất Cả Cài Đặt'}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'brand'
              ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>1. Nhận Diện & Logo / Icon</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'bank'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>2. Tài Khoản Nhận Tiền & VietQR</span>
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'contact'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>3. Thông Tin Liên Hệ & Chi Nhánh</span>
        </button>

        <button
          onClick={() => setActiveTab('invoice')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'invoice'
              ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 text-purple-600" />
          <span>4. In Hóa Đơn & Tích Điểm</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: Brand & Logo */}
        {activeTab === 'brand' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Nhận Diện Thương Hiệu & Logo</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên Spa / Thẩm Mỹ Viện (*)</label>
                  <input
                    type="text"
                    value={spaName}
                    onChange={(e) => setSpaName(e.target.value)}
                    placeholder="Ví dụ: Liin Spa & Clinic"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold text-sm text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khẩu hiệu / Slogan Thương Hiệu</label>
                  <input
                    type="text"
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Ví dụ: Đẳng cấp làm đẹp chuẩn Y khoa & Trẻ hóa công nghệ cao"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Biểu Tượng Logo Mặc Định (Icon Brand)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {iconOptions.map((opt) => {
                      const isSelected = iconType === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setIconType(opt.key)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-50/80 border-rose-400 shadow-sm'
                              : 'bg-slate-50/50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                            {opt.icon}
                          </div>
                          <span className="font-semibold text-xs text-slate-800">{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Đường Dẫn Hình Ảnh Logo Riêng (Tùy chọn URL)
                  </label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo-spa.png (Để trống để sử dụng Icon ở trên)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nếu bạn có logo riêng dạng ảnh trong suốt (PNG/SVG), hãy dán link vào đây.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Phối Màu Chủ Đạo (Theme Preset)</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {themeOptions.map((thm) => {
                      const isSelected = themePreset === thm.key;
                      return (
                        <div
                          key={thm.key}
                          onClick={() => setThemePreset(thm.key)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'border-rose-400 bg-rose-50/60 shadow-xs'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${thm.previewClass} shadow-xs shrink-0`} />
                          <span className="text-[11px] font-bold text-slate-800 truncate">{thm.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Live Preview Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
                <div className="relative z-10 space-y-4">
                  <div className="text-[10px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Xem trước Nhận diện trên Hệ Thống</span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center shadow-luxury text-white">
                      {iconType === 'crown' && <Crown className="w-6 h-6" />}
                      {iconType === 'flower' && <Flower2 className="w-6 h-6" />}
                      {iconType === 'gem' && <Gem className="w-6 h-6" />}
                      {iconType === 'heart' && <Heart className="w-6 h-6" />}
                      {iconType === 'sparkles' && <Sparkles className="w-6 h-6 animate-pulse" />}
                    </div>
                    <div>
                      <div className="font-serif text-lg font-bold tracking-tight bg-gradient-to-r from-white via-rose-100 to-amber-200 bg-clip-text text-transparent">
                        {spaName || 'LIIN SPA'}
                      </div>
                      <div className="text-[11px] text-rose-200/80 line-clamp-1">{slogan || 'Đẳng cấp làm đẹp chuẩn Y khoa'}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs space-y-1">
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>Hotline:</span>
                      <strong className="text-white font-mono">{hotline}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 text-[11px]">
                      <span>Giờ đón khách:</span>
                      <span className="text-white font-medium">{workingHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <strong className="block flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Đồng bộ tức thì:</span>
                </strong>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Khi lưu, thông tin tên Spa và biểu tượng sẽ tự động cập nhật ngay trên thanh tiêu đề Navbar, Sidebar và toàn bộ hóa đơn bán hàng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Banking & VietQR */}
        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Cấu Hình Tài Khoản Nhận Tiền & Napas247 VietQR</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ngân Hàng Thụ Hưởng Nhận Tiền (*)
                  </label>
                  <select
                    value={bankId}
                    onChange={(e) => setBankId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    required
                  >
                    {VIETNAMESE_BANKS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Tài Khoản Nhận Tiền (*)</label>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) => setAccountNo(e.target.value)}
                    placeholder="Ví dụ: 090123456789"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-sm text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tên Chủ Tài Khoản Thụ Hưởng (*) (Chữ hoa không dấu)
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: NGUYEN PHUONG MAI"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tiền Tố Nội Dung Chuyển Khoản (Prefix)
                  </label>
                  <input
                    type="text"
                    value={qrPrefix}
                    onChange={(e) => setQrPrefix(e.target.value.toUpperCase())}
                    placeholder="LIINSPA"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Nội dung mã QR khi khách quét tại quầy sẽ có dạng: <strong>{qrPrefix} HD-2026-xxx</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Live VietQR Preview */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-emerald-100 p-6 shadow-sm space-y-4 flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-emerald-800">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-xs uppercase tracking-wider">Mã Quét VietQR Mẫu Trực Tiếp</h4>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-inner flex flex-col items-center">
                <img
                  src={sampleQrUrl}
                  alt="VietQR Sample"
                  className="w-56 h-auto object-contain rounded-xl shadow-sm"
                />
              </div>

              <div className="w-full text-xs space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <strong className="text-slate-900">{selectedBank.shortName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="font-mono text-emerald-800">{accountNo}</strong>
                    <button
                      type="button"
                      onClick={handleCopyAccount}
                      className="text-slate-400 hover:text-emerald-700"
                      title="Sao chép số tài khoản"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chủ tài khoản:</span>
                  <strong className="font-mono text-slate-900">{accountName}</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                Chủ Spa có thể mở ứng dụng ngân hàng trên điện thoại quét thử mã QR này ngay bây giờ để xác nhận thông tin nhận tiền chính xác.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: Contact & Operation */}
        {activeTab === 'contact' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 max-w-3xl">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Thông Tin Liên Hệ & Vận Hành Spa</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hotline Đặt Lịch Tổng Đài</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    placeholder="1900 8899"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại Lễ Tân / Zalo</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988 123 456"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Địa Chỉ Cơ Sở / Chi Nhánh (*)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="168 Nguyễn Thị Minh Khai, Phường Võ Thị Sáu, Quận 3, TP.HCM"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giờ Mở Cửa Hoạt Động</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    placeholder="08:30 - 20:30 (Thứ 2 - Chủ Nhật)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã Số Thuế / Giấy Phép ĐKKD</label>
                <input
                  type="text"
                  value={taxCode}
                  onChange={(e) => setTaxCode(e.target.value)}
                  placeholder="0318992233"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Liên Hệ</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@liinspa.vn"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Website / Fanpage</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://liinspa.vn"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Invoice & Loyalty */}
        {activeTab === 'invoice' && (
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 max-w-3xl">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
              <Receipt className="w-4 h-4 text-purple-600" />
              <span>Cấu Hình In Hóa Đơn & Điểm Thưởng Khách Hàng</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lời Cảm Ơn / Dặn Dò Chân Trang Hóa Đơn (Footer Note)
                </label>
                <textarea
                  rows={3}
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  placeholder="Cảm ơn Quý khách đã tin tưởng và đồng hành cùng Liin Spa & Clinic..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3">
                <label className="block font-bold text-purple-950">
                  Tỷ Lệ Tích Điểm Thưởng Khách Hàng Thân Thiết (Loyalty Points)
                </label>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-600">Mỗi:</span>
                  <input
                    type="number"
                    step={1000}
                    min={1000}
                    value={pointsRate}
                    onChange={(e) => setPointsRate(Number(e.target.value))}
                    className="w-36 p-2 rounded-xl border border-slate-200 font-mono font-bold text-purple-700 text-center bg-white"
                  />
                  <span className="font-medium text-slate-600">VND chi tiêu = <strong>1 Điểm thưởng</strong></span>
                </div>
                <p className="text-[11px] text-purple-800">
                  Ví dụ: Với tỷ lệ {formatVND(pointsRate)} = 1 điểm, đơn hàng trị giá 2,000,000đ sẽ tự động tích lũy{' '}
                  <strong>{Math.floor(2000000 / (pointsRate || 20000))} điểm</strong> cho khách hàng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Action Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaved ? 'Đã Lưu Thay Đổi!' : 'Lưu Tất Cả Cài Đặt Hệ Thống'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

