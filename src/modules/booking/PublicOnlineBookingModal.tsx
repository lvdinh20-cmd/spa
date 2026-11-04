import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { detectBookingCollision } from '../../domain/booking';
import { formatVND } from '../../domain/financial';
import {
  X,
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
  CreditCard,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PrivacyPolicyModal } from '../legal/PrivacyPolicyModal';

interface PublicOnlineBookingModalProps {
  onClose: () => void;
  onBookingSuccess?: () => void;
}

export const PublicOnlineBookingModal: React.FC<PublicOnlineBookingModalProps> = ({
  onClose,
  onBookingSuccess,
}) => {
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

  // Auto detect customer and cards
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

    // 1. Conflict-Free Collision Check against existing beds & schedule
    const availableSlot = findAvailableBedAndStaff();
    if (!availableSlot) {
      setErrorMsg(
        `Rất tiếc! Khung giờ ${selectedTime} ngày ${selectedDate} tất cả các giường trị liệu tại Spa đã kín lịch. Quý khách vui lòng chọn khung giờ hoặc ngày khác.`
      );
      return;
    }

    // 2. Customer Sync & Creation logic:
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
        notes: 'Hồ sơ tự động tạo từ lượt quét mã QR Đặt chỗ Online',
      });
      customerId = newCustomer.id;
    }

    // 3. Determine if using Treatment Card or Service
    const isUsingCard = bookingMode === 'card' && chosenCard && chosenCard.remainingSessions > 0;
    const bookedServiceName = isUsingCard ? chosenCard.packageName : selectedService.name;
    const bookedServiceId = isUsingCard ? chosenCard.packageId : selectedService.id;

    const targetEmail = settings.email || 'contact@liinspa.vn';

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
      isOnlineBooking: true,
      bookedAt: new Date().toISOString(),
      emailNotifiedTo: targetEmail,
      notes: notes || (isUsingCard ? `Khách đặt theo thẻ liệu trình: ${chosenCard.packageName}` : 'Khách tự đặt lịch online qua mã QR'),
      cardId: isUsingCard ? chosenCard.id : undefined,
      isCardBooking: isUsingCard,
      sessionDeducted: false,
    });

    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });

    setBookingSuccessData({
      customerName: trimmedName,
      phone: trimmedPhone,
      serviceName: bookedServiceName,
      date: selectedDate,
      time: `${selectedTime} - ${endTimeStr}`,
      emailNotified: targetEmail,
      isExistingCustomer: isExisting,
      isCardBooking: isUsingCard,
      cardName: isUsingCard ? chosenCard.packageName : undefined,
      remainingSessions: isUsingCard ? chosenCard.remainingSessions : undefined,
      totalSessions: isUsingCard ? chosenCard.totalSessions : undefined,
    });

    if (onBookingSuccess) onBookingSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 my-6">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base font-serif tracking-tight">
                Đặt Chỗ Trực Tuyến • {settings.spaName || 'Liin Spa'}
              </h3>
              <p className="text-[11px] text-rose-200">
                Chỉ cần nhập Tên & SĐT để giữ chỗ làm đẹp trong 30 giây
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {bookingSuccessData ? (
          /* SUCCESS SCREEN */
          <div className="p-6 text-center space-y-4 text-xs animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider mb-1.5">
                Đã tiếp nhận lịch • Chờ Admin duyệt
              </span>
              <h4 className="text-lg font-bold text-slate-900 font-serif">
                Đặt Lịch Thành Công, {bookingSuccessData.customerName}!
              </h4>
              <p className="text-slate-500 text-xs mt-1">
                Lễ tân của Liin Spa đã nhận được yêu cầu và sẽ liên hệ xác nhận với bạn qua SĐT{' '}
                <strong className="text-rose-700 font-mono">{bookingSuccessData.phone}</strong>
              </p>
            </div>

            {/* Notification to Spa Gmail Badge */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 text-left space-y-1.5">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                <Mail className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Đã gửi thông báo xác nhận đến Gmail chính của Spa:</span>
              </div>
              <p className="font-mono text-slate-700 text-[11px] pl-6 bg-white/70 p-1.5 rounded-lg border border-rose-100">
                {bookingSuccessData.emailNotified}
              </p>
              <div className="text-[10px] text-slate-500 pl-6">
                {bookingSuccessData.isExistingCustomer
                  ? '✨ Hệ thống đã nhận diện bạn là khách hàng thân thiết và tự động đồng bộ lịch sử tích điểm.'
                  : '✨ Hồ sơ khách hàng mới của bạn đã được khởi tạo tự động trên hệ thống.'}
              </div>
            </div>

            {/* Booking Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Dịch vụ đã chọn:</span>
                <strong className="text-slate-900">{bookingSuccessData.serviceName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày hẹn:</span>
                <strong className="font-mono text-slate-900">{bookingSuccessData.date}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Khung giờ:</span>
                <strong className="font-mono text-rose-700">{bookingSuccessData.time}</strong>
              </div>
              <div className="flex justify-between pt-1 border-t text-[11px]">
                <span className="text-slate-500">Địa chỉ Spa:</span>
                <span className="text-slate-800 text-right truncate max-w-[240px]">{settings.address}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        ) : (
          /* BOOKING FORM */
          <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-xs">Thông báo:</strong>
                  <p className="text-[11px] mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Step 1: Customer Contact Info */}
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <span className="block font-bold text-rose-950 text-xs flex items-center gap-1.5">
                <User className="w-4 h-4 text-rose-600" />
                <span>1. Thông Tin Khách Hàng (Đơn giản 30 giây)</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Điện Thoại (*)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0988123456"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-800 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Thu Uyên"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
                    required
                  />
                </div>
              </div>

              {/* Matched Customer & Cards */}
              {matchedCustomer && matchedCards.length > 0 && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-300 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-950">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Khách quen: Bạn có {matchedCards.length} thẻ liệu trình còn buổi:</span>
                  </div>

                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-amber-200 w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setBookingMode('card');
                        if (!selectedCardId && matchedCards[0]) {
                          setSelectedCardId(matchedCards[0].id);
                        }
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        bookingMode === 'card'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Dùng Thẻ Liệu Trình ({matchedCards.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBookingMode('service')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        bookingMode === 'service'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Đặt Dịch Vụ Mới</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Service Selection OR Card Selection */}
            {bookingMode === 'card' && matchedCards.length > 0 ? (
              <div className="space-y-2.5">
                <label className="block font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-900">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>2. Chọn Thẻ Liệu Trình Của Bạn (*)</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Trọn gói (0 VND)
                  </span>
                </label>

                <div className="space-y-2">
                  {matchedCards.map((card) => {
                    const isSelected = (selectedCardId || matchedCards[0]?.id) === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setSelectedCardId(card.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400'
                            : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{card.packageName}</span>
                          <span className="w-3.5 h-3.5 rounded-full border border-amber-600 flex items-center justify-center">
                            {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex justify-between">
                          <span>Số buổi còn: <strong className="text-amber-800">{card.remainingSessions} / {card.totalSessions} buổi</strong></span>
                          <span>Hạn dùng: {card.expiryDate.slice(0, 10)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  * Lưu ý: Buổi làm CHƯA bị trừ khi đặt lịch. Chỉ trừ lùi khi hoàn thành xong ca làm đẹp tại Spa.
                </p>
              </div>
            ) : (
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>2. Chọn Dịch Vụ Làm Đẹp (*)</span>
                  <span className="text-[10px] text-rose-600 font-mono font-bold">
                    {formatVND(selectedService.price)} • {selectedService.durationMinutes} phút
                  </span>
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.durationMinutes} phút - {formatVND(s.price)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Date & Timeslot Picker */}
            <div className="space-y-2.5">
              <label className="block font-bold text-slate-700">
                3. Chọn Ngày & Khung Giờ Mong Muốn (*)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Ngày đến làm</label>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Giờ bắt đầu</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-rose-700 bg-white"
                  >
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Range & Capacity Checker Preview */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Dự kiến kết thúc:</span>
                </span>
                <strong className="font-mono text-slate-800">
                  {selectedTime} - {endTimeStr} ({duration} phút)
                </strong>
              </div>
            </div>

            {/* Step 4: Optional Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Yêu cầu đặc biệt (Ghi chú)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Da tôi bị mụn viêm đỏ, chuẩn bị KTV tay nghề êm..."
                className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Decree 13/2023/ND-CP Personal Data Consent Box */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-rose-50/80 border border-amber-200/90 space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-amber-950 leading-snug">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP):</span>{' '}
                  {settings.spaName || 'Liin Spa'} chỉ thu thập Họ tên và Số điện thoại của Quý khách nhằm mục đích sắp xếp lịch hẹn, điều phối giường trị liệu và gửi thông báo xác nhận.
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] sm:text-xs text-slate-800 cursor-pointer select-none pt-2 border-t border-amber-200/60 font-medium">
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
                    className="text-rose-700 font-bold underline hover:text-rose-800 cursor-pointer inline-flex items-center gap-0.5"
                  >
                    Chính sách bảo vệ dữ liệu cá nhân
                  </button>{' '}
                  của {settings.spaName || 'Liin Spa'}.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-[11px] font-bold text-slate-500 hover:text-rose-700 underline cursor-pointer"
                >
                  📜 Điều khoản & Chính sách bảo mật
                </button>
              </div>

              <button
                type="submit"
                disabled={!consentAgreed}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-luxury transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  consentAgreed
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Gửi Yêu Cầu Đặt Chỗ</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
};

