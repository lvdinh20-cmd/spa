import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { detectBookingCollision } from '../../domain/booking';
import { formatVND } from '../../domain/financial';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Mail,
  ShieldCheck,
  Send,
  BedSingle,
  LogIn,
  Crown,
  Flower2,
  Gem,
  Heart,
  MapPin,
  FileText,
  CreditCard,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';
import { LoginModal } from '../auth/LoginModal';

export const PublicLandingPage: React.FC = () => {
  const { services, staffList, appointments, customers, cards, settings, addCustomer, createAppointment } = useSpaData();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bookingMode, setBookingMode] = useState<'service' | 'card'>('service');
  const [selectedCardId, setSelectedCardId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Auto-detect existing customer & active treatment cards
  const cleanPhone = phone.trim().replace(/\D/g, '');
  const matchedCustomer = cleanPhone.length >= 9
    ? customers.find((c) => c.phone.replace(/\D/g, '') === cleanPhone)
    : null;

  const matchedCards = matchedCustomer
    ? cards.filter((c) => c.customerId === matchedCustomer.id && c.remainingSessions > 0 && c.status === 'active')
    : [];

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    const cleaned = val.trim().replace(/\D/g, '');
    if (cleaned.length >= 9) {
      const found = customers.find((c) => c.phone.replace(/\D/g, '') === cleaned);
      if (found) {
        if (!fullName) setFullName(found.fullName);
        const userCards = cards.filter((c) => c.customerId === found.id && c.remainingSessions > 0 && c.status === 'active');
        if (userCards.length > 0) {
          setBookingMode('card');
          setSelectedCardId(userCards[0].id);
        }
      }
    }
  };

  const [bookingSuccessData, setBookingSuccessData] = useState<{
    customerName: string;
    phone: string;
    serviceName: string;
    date: string;
    time: string;
    bedName: string;
    staffName: string;
    emailNotified: string;
    isExistingCustomer: boolean;
    isCardBooking?: boolean;
    cardName?: string;
    remainingSessions?: number;
    totalSessions?: number;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const chosenCard = matchedCards.find((c) => c.id === selectedCardId) || matchedCards[0];

  const availableBeds = [
    'Giường 01 (Phòng Facial)',
    'Giường 02 (Phòng Laser)',
    'Giường 03 (Phòng Body VIP)',
    'Giường 04 (Phòng Chăm Sóc Da)',
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
    '16:30', '17:00', '17:30', '18:00', '18:30', '19:00',
  ];

  // Calculate start & end datetime
  const startDateTime = `${selectedDate}T${selectedTime}`;
  const startDateObj = new Date(startDateTime);
  const duration = bookingMode === 'card' && chosenCard ? 75 : (selectedService?.durationMinutes || 60);
  const endDateObj = new Date(startDateObj.getTime() + duration * 60 * 1000);
  const endTimeStr = !isNaN(endDateObj.getTime())
    ? `${String(endDateObj.getHours()).padStart(2, '0')}:${String(endDateObj.getMinutes()).padStart(2, '0')}`
    : '11:00';
  const endDateTime = `${selectedDate}T${endTimeStr}`;

  // Find a free technician & bed for this time
  const findAvailableBedAndStaff = () => {
    const activeTechs = staffList.filter((s) => s.role === 'technician');
    const techniciansToTry = activeTechs.length > 0 ? activeTechs : staffList;

    for (const bed of availableBeds) {
      for (const tech of techniciansToTry) {
        const check = detectBookingCollision(
          {
            staffId: tech.id,
            bedId: bed,
            startTime: startDateTime,
            endTime: endDateTime,
          },
          appointments
        );

        if (!check.hasCollision) {
          return { bedId: bed, staffId: tech.id, staffName: tech.name };
        }
      }
    }
    return null;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim().replace(/\s+/g, '');

    if (!trimmedName) {
      setErrorMsg('Vui lòng nhập Họ và Tên của bạn!');
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 9) {
      setErrorMsg('Vui lòng nhập Số điện thoại hợp lệ để Spa liên hệ xác nhận!');
      return;
    }

    if (!consentAgreed) {
      setErrorMsg(
        'Quý khách vui lòng đọc và đánh dấu đồng ý với Chính sách bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP) để hoàn tất yêu cầu đặt chỗ!'
      );
      return;
    }

    // 1. Conflict-Free Collision Check
    const availableSlot = findAvailableBedAndStaff();
    if (!availableSlot) {
      setErrorMsg(
        `Rất tiếc! Khung giờ ${selectedTime} ngày ${selectedDate} tất cả các giường trị liệu tại Spa đã kín lịch. Quý khách vui lòng chọn khung giờ hoặc ngày khác.`
      );
      return;
    }

    // 2. Customer Sync & Creation logic
    const existingCustomer = customers.find(
      (c) => c.phone.replace(/\D/g, '') === trimmedPhone.replace(/\D/g, '')
    );

    let customerId = '';
    let isExisting = false;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      isExisting = true;
    } else {
      const newCustomer = addCustomer({
        fullName: trimmedName,
        phone: trimmedPhone,
        gender: 'female',
        birthday: '2000-01-01',
        source: 'walk_in',
        skinType: 'Khách đặt online',
        allergies: 'Không',
        notes: notes || 'Đặt trực tuyến qua Cổng Online QR',
      });
      customerId = newCustomer.id;
    }

    // 3. Determine if booking with Treatment Card or New Single Service
    const isUsingCard = bookingMode === 'card' && chosenCard && chosenCard.remainingSessions > 0;
    const bookedServiceName = isUsingCard ? chosenCard.packageName : selectedService.name;
    const bookedServiceId = isUsingCard ? chosenCard.packageId : selectedService.id;

    // 4. Create appointment with pending_online status (SESSION IS NOT DEDUCTED YET)
    createAppointment({
      customerId,
      customerName: trimmedName,
      customerPhone: trimmedPhone,
      serviceId: bookedServiceId,
      serviceName: bookedServiceName,
      staffId: availableSlot.staffId,
      staffName: availableSlot.staffName,
      bedId: availableSlot.bedId,
      startTime: startDateTime,
      endTime: endDateTime,
      status: 'pending_online',
      notes: notes || (isUsingCard ? `Khách đặt theo thẻ liệu trình: ${chosenCard.packageName}` : 'Khách đặt chỗ trực tuyến qua Cổng Online QR'),
      isOnlineBooking: true,
      bookedAt: new Date().toISOString(),
      emailNotifiedTo: settings.email,
      cardId: isUsingCard ? chosenCard.id : undefined,
      isCardBooking: isUsingCard,
      sessionDeducted: false,
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setBookingSuccessData({
      customerName: trimmedName,
      phone: trimmedPhone,
      serviceName: bookedServiceName,
      date: selectedDate,
      time: `${selectedTime} - ${endTimeStr}`,
      bedName: availableSlot.bedId,
      staffName: availableSlot.staffName,
      emailNotified: settings.email,
      isExistingCustomer: isExisting,
      isCardBooking: isUsingCard,
      cardName: isUsingCard ? chosenCard.packageName : undefined,
      remainingSessions: isUsingCard ? chosenCard.remainingSessions : undefined,
      totalSessions: isUsingCard ? chosenCard.totalSessions : undefined,
    });
  };

  const renderBrandIcon = () => {
    if (settings.logoUrl) {
      return (
        <img
          src={settings.logoUrl}
          alt={settings.spaName}
          className="w-10 h-10 rounded-2xl object-cover shadow-luxury"
        />
      );
    }

    const iconType = settings.iconType || 'sparkles';
    return (
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-400 to-amber-300 flex items-center justify-center shadow-luxury text-white shrink-0">
        {iconType === 'crown' && <Crown className="w-5 h-5" />}
        {iconType === 'flower' && <Flower2 className="w-5 h-5" />}
        {iconType === 'gem' && <Gem className="w-5 h-5" />}
        {iconType === 'heart' && <Heart className="w-5 h-5" />}
        {iconType === 'sparkles' && <Sparkles className="w-5 h-5 animate-pulse" />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col font-sans selection:bg-rose-200">
      {/* Top Public Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {renderBrandIcon()}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-rose-900 via-rose-700 to-amber-700 bg-clip-text text-transparent">
                  {settings.spaName || 'LIIN SPA'}
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 hidden sm:inline">
                  Đặt Chỗ Trực Tuyến
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                {settings.slogan || 'Đánh thức vẻ đẹp tự nhiên & Tái tạo năng lượng'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              title="Chính sách bảo vệ dữ liệu cá nhân"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Chính sách bảo mật</span>
            </button>

            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng Nhập Quản Trị</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-2 py-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
            ✨ Trải Nghiệm Thư Giãn & Làm Đẹp Đẳng Cấp
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Đặt Lịch Hẹn Trực Tuyến Nhanh Chóng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Vui lòng điền thông tin để giữ chỗ giường trị liệu và chuyên viên KTV ưa thích. Hệ thống tự động xác nhận và đối chiếu lịch trống theo thời gian thực.
          </p>
        </div>

        {/* Booking Card or Success Card */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-xl overflow-hidden">
          {bookingSuccessData ? (
            <div className="p-6 sm:p-10 space-y-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                  Gửi Yêu Cầu Đặt Chỗ Thành Công!
                </h2>
                <p className="text-xs text-slate-500">
                  Lịch hẹn của Quý khách đã được tiếp nhận và thông báo tức thì đến quản trị viên Spa.
                </p>
              </div>

              {/* Booking Summary Ticket */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-amber-50/70 border border-rose-200/80 text-left text-xs space-y-3 shadow-inner">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200/60 font-bold">
                  <span className="text-slate-800">{bookingSuccessData.customerName}</span>
                  <span className="font-mono text-rose-700">{bookingSuccessData.phone}</span>
                </div>

                <div className="space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Dịch vụ đăng ký:</span>
                    <strong className="text-slate-900">{bookingSuccessData.serviceName}</strong>
                  </div>
                  {bookingSuccessData.isCardBooking && (
                    <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-[11px] space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        <span>Đặt theo Thẻ Liệu Trình của bạn</span>
                      </div>
                      <div>
                        Số buổi còn lại: <strong>{bookingSuccessData.remainingSessions} / {bookingSuccessData.totalSessions} buổi</strong>
                      </div>
                      <div className="text-[10px] text-amber-700 italic">
                        * Buổi làm này CHƯA bị trừ. Chỉ khi KTV xác nhận làm xong mới trừ lùi 1 buổi.
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Thời gian hẹn:</span>
                    <strong className="text-rose-800 font-mono">
                      {bookingSuccessData.date} ({bookingSuccessData.time})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Giường điều trị:</span>
                    <span className="font-medium text-slate-800">{bookingSuccessData.bedName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>KTV dự kiến:</span>
                    <span className="font-medium text-slate-800">{bookingSuccessData.staffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                      Chờ duyệt (Pending Online)
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-rose-200/60 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Email nhắc nhở đã được gửi tự động tới hòm thư quản lý: <strong>{bookingSuccessData.emailNotified}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setBookingSuccessData(null);
                    setFullName('');
                    setPhone('');
                    setNotes('');
                    setConsentAgreed(false);
                    setBookingMode('service');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-luxury transition-all cursor-pointer"
                >
                  Đặt Thêm Lịch Mới
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="p-6 sm:p-8 space-y-6">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Step 1: Customer Details */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-rose-600" />
                  <span>1. Thông Tin Khách Hàng</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Số Điện Thoại (*)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0988123456"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-800 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Họ và Tên (*)
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ví dụ: Hoàng Thu Uyên"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
                      required
                    />
                  </div>
                </div>

                {/* If Customer is matched and has active cards */}
                {matchedCustomer && matchedCards.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-300 shadow-sm space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                          <Sparkles className="w-4 h-4 text-amber-700" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-amber-950">
                            Chào mừng khách quen {matchedCustomer.fullName}!
                          </div>
                          <p className="text-[11px] text-amber-800">
                            Hệ thống nhận diện bạn đang có <strong>{matchedCards.length} Thẻ Liệu Trình</strong> còn số buổi sử dụng:
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Mode Switcher */}
                    <div className="flex items-center gap-2 bg-white/90 p-1 rounded-xl border border-amber-200 w-fit">
                      <button
                        type="button"
                        onClick={() => {
                          setBookingMode('card');
                          if (!selectedCardId && matchedCards[0]) {
                            setSelectedCardId(matchedCards[0].id);
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingMode === 'card'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Dùng Thẻ Liệu Trình ({matchedCards.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingMode('service')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bookingMode === 'service'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Đặt Dịch Vụ Mới Ngoài Menu</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Service Selection or Card Selection */}
              {bookingMode === 'card' && matchedCards.length > 0 ? (
                <div className="space-y-3">
                  <label className="block font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2 text-amber-900">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      <span>2. Chọn Thẻ Liệu Trình Của Bạn (*)</span>
                    </span>
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Đã mua trọn gói (0 VND)
                    </span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedCards.map((card) => {
                      const isSelected = (selectedCardId || matchedCards[0]?.id) === card.id;
                      return (
                        <div
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900">{card.packageName}</span>
                            <span className="w-4 h-4 rounded-full border flex items-center justify-center border-amber-600">
                              {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-600">
                            <div className="flex items-center justify-between">
                              <span>Số buổi còn lại:</span>
                              <strong className="text-amber-800 font-mono text-xs">
                                {card.remainingSessions} / {card.totalSessions} buổi
                              </strong>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{
                                  width: `${Math.round((card.usedSessions / card.totalSessions) * 100)}%`,
                                }}
                              />
                            </div>
                            <div className="text-[10px] text-slate-400 flex justify-between pt-0.5">
                              <span>Đã làm: {card.usedSessions} buổi</span>
                              <span>Hết hạn: {card.expiryDate.slice(0, 10)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Clarification policy */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Quy định trừ buổi:</strong> Đặt hẹn chỉ nhằm mục đích giữ chỗ giường & KTV. Buổi làm trong thẻ <strong>chưa bị trừ</strong> ngay lúc này mà chỉ được trừ lùi khi Quý khách hoàn thành xong buổi làm đẹp tại Spa.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-rose-600" />
                      <span>2. Chọn Dịch Vụ Làm Đẹp (*)</span>
                    </span>
                    <span className="text-xs text-rose-600 font-mono font-bold">
                      {formatVND(selectedService.price)} • {selectedService.durationMinutes} phút
                    </span>
                  </label>

                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.durationMinutes} phút - {formatVND(s.price)})
                      </option>
                    ))}
                  </select>
                  {selectedService?.description && (
                    <p className="text-[11px] text-slate-500 italic pl-1">
                      {selectedService.description}
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Date & Timeslot Picker */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-600" />
                  <span>3. Chọn Ngày & Khung Giờ Mong Muốn (*)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                      Ngày đến làm
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 font-medium bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1 font-semibold">
                      Giờ bắt đầu
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 font-mono font-bold text-rose-700 bg-white"
                    >
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>Thời gian phục vụ dự kiến:</span>
                  </span>
                  <strong className="font-mono text-slate-800">
                    {selectedTime} - {endTimeStr} ({duration} phút)
                  </strong>
                </div>
              </div>

              {/* Step 4: Optional Notes */}
              <div>
                <label className="block font-bold text-slate-700 text-xs mb-1">
                  Yêu cầu đặc biệt hoặc tình trạng da (Ghi chú tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Da mụn dị ứng mỹ phẩm cồn, ưu tiên phòng yên tĩnh..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              {/* Decree 13/2023/ND-CP Personal Data Consent Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/90 space-y-2.5">
                <div className="flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900">Bảo vệ dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP:</strong>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      {settings.spaName || 'Liin Spa'} cam kết bảo mật tuyệt đối. Thông tin Họ tên và Số điện thoại của Quý khách chỉ được sử dụng cho mục đích xác nhận lịch hẹn, xếp giường điều trị và liên hệ chăm sóc.
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-slate-800 cursor-pointer select-none pt-2.5 border-t border-amber-200/70 font-medium">
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer shrink-0"
                  />
                  <span>
                    Tôi đã đọc, hiểu rõ và đồng ý cho phép Spa thu thập, xử lý dữ liệu cá nhân theo{' '}
                    <button
                      type="button"
                      onClick={() => setShowPrivacyModal(true)}
                      className="text-rose-700 font-bold underline hover:text-rose-800 cursor-pointer"
                    >
                      Chính sách bảo vệ dữ liệu cá nhân
                    </button>{' '}
                    của {settings.spaName || 'Liin Spa'}.
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-xs font-bold text-slate-500 hover:text-rose-700 underline cursor-pointer"
                  >
                    📜 Xem chi tiết Chính sách bảo mật & Điều khoản
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!consentAgreed}
                  className={`px-8 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-luxury transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    consentAgreed
                      ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Xác Nhận & Gửi Lịch Hẹn</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-6 px-4 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-white text-sm">
              {settings.spaName || 'LIIN SPA & BEAUTY CLINIC'}
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{settings.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hover:text-amber-300 underline cursor-pointer"
            >
              Chính sách bảo mật dữ liệu
            </button>
            <span>•</span>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
            >
              Đăng nhập nhân viên
            </button>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};
