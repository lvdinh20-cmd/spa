import React, { useState } from 'react';
import { Customer } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { X, UserPlus, Sparkles, CheckCircle2, User, HeartPulse, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuickAddCustomerModalProps {
  onClose: () => void;
  onCustomerCreated: (customer: Customer) => void;
}

export const QuickAddCustomerModal: React.FC<QuickAddCustomerModalProps> = ({
  onClose,
  onCustomerCreated,
}) => {
  const { customers, addCustomer } = useSpaData();

  // Active Tab: 'basic' or 'medical'
  const [activeTab, setActiveTab] = useState<'basic' | 'medical'>('basic');

  // Basic Info
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Customer['gender']>('female');
  const [birthday, setBirthday] = useState('1998-05-20');
  const [source, setSource] = useState<Customer['source']>('walk_in');

  // Medical & Skin Profile
  const [skinType, setSkinType] = useState('Da dầu mụn, nhạy cảm');
  const [allergies, setAllergies] = useState('Không kích ứng');
  const [notes, setNotes] = useState('');

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName || !trimmedPhone) {
      alert('Vui lòng nhập đầy đủ Họ tên và Số điện thoại!');
      return;
    }

    // Check duplicate phone
    const existing = customers.find((c) => c.phone.replace(/\D/g, '') === trimmedPhone.replace(/\D/g, ''));
    if (existing) {
      if (
        confirm(
          `Số điện thoại ${trimmedPhone} đã thuộc về khách hàng "${existing.fullName}". Bạn có muốn chọn luôn khách hàng này không?`
        )
      ) {
        onCustomerCreated(existing);
        onClose();
        return;
      }
    }

    const created = addCustomer({
      fullName: trimmedName,
      phone: trimmedPhone,
      gender,
      birthday,
      source,
      skinType: skinType || 'Bình thường',
      allergies: allergies || 'Không',
      notes,
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onCustomerCreated(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Thêm Nhanh Khách Hàng Mới</h3>
              <p className="text-[11px] text-rose-200">
                Tạo hồ sơ tức thì và tự động áp dụng vào lịch hẹn / hóa đơn
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

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'basic'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Thông tin cơ bản (*)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'medical'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>2. Hồ sơ da & Thói quen</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {activeTab === 'basic' && (
            <div className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  autoFocus
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Thu Uyên"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-slate-50/50"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988123456"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-800 bg-slate-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Customer['gender'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
                  >
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh (tặng voucher)</label>
                  <input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn khách hàng</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as Customer['source'])}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium bg-white"
                  >
                    <option value="walk_in">Khách vãng lai đến quầy</option>
                    <option value="facebook">Facebook / Fanpage</option>
                    <option value="referral">Bạn bè giới thiệu</option>
                    <option value="other">Khác / TikTok</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng da</label>
                  <input
                    type="text"
                    value={skinType}
                    onChange={(e) => setSkinType(e.target.value)}
                    placeholder="Da dầu mụn, nhạy cảm, da hỗn hợp..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tiền sử dị ứng mỹ phẩm</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Cồn, hương liệu, Retinol, AHA..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-rose-700 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú nhu cầu & Thói quen chăm sóc da</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Khách mong muốn nâng cơ, cải thiện sắc tố da, giảm thâm mụn..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {activeTab === 'basic' ? (
              <button
                type="button"
                onClick={() => setActiveTab('medical')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <span>Nhập thêm hồ sơ da & dị ứng &rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <span>&larr; Quay lại thông tin cơ bản</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold shadow-luxury flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu & Chọn Ngay</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

