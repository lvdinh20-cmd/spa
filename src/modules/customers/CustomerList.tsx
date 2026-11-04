import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Customer, TreatmentCard } from '../../types';
import { formatVND } from '../../domain/financial';
import {
  UserPlus,
  Search,
  Phone,
  Sparkles,
  CreditCard,
  History,
  CheckCircle2,
  Calendar,
  Edit3,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { TreatmentCheckinModal } from './TreatmentCheckinModal';
import { EditTreatmentCardModal } from './EditTreatmentCardModal';
import { EditCustomerModal } from './EditCustomerModal';
import { excelService } from '../../services/excel';
import confetti from 'canvas-confetti';

export const CustomerList: React.FC = () => {
  const { customers, cards, checkins, addCustomer, importCustomersBatch } = useSpaData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [checkinModalCard, setCheckinModalCard] = useState<TreatmentCard | null>(null);
  const [editingCard, setEditingCard] = useState<TreatmentCard | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState<'female' | 'male' | 'other'>('female');
  const [newBirthday, setNewBirthday] = useState('1998-05-20');
  const [newSkinType, setNewSkinType] = useState('Da dầu mụn');
  const [newAllergies, setNewAllergies] = useState('Không');
  const [newNotes, setNewNotes] = useState('');

  // Excel Handlers
  const handleExportExcel = () => {
    const dataToExport = filteredCustomers.map((c) => ({
      'Mã Khách Hàng': c.id,
      'Họ và Tên': c.fullName,
      'Số Điện Thoại': c.phone,
      'Giới Tính': c.gender === 'female' ? 'Nữ' : 'Nam',
      'Ngày Sinh': c.birthday,
      'Nguồn Khách': c.source,
      'Tình Trạng Da': c.skinType,
      'Tiền Sử Dị Ứng': c.allergies,
      'Tổng Chi Tiêu (VND)': c.totalSpend,
      'Công Nợ (VND)': c.debtBalance,
      'Điểm Tích Lũy': c.loyaltyPoints,
      'Ví Trả Trước (VND)': c.walletBalance,
      'Ghi Chú': c.notes,
      'Ngày Tạo': c.createdAt,
    }));
    excelService.exportToExcel(dataToExport, 'DanhSach_KhachHang_LiinSpa', 'KhachHang');
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await excelService.parseCustomersExcel(file);
      if (res.validRows.length === 0) {
        alert('File Excel không có dữ liệu khách hàng hợp lệ hoặc sai định dạng mẫu!');
        return;
      }

      const importedCount = importCustomersBatch(res.validRows);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(
        `Nhập dữ liệu Excel thành công!\n- Tổng số dòng đọc được: ${res.totalRows}\n- Thêm mới thành công: ${importedCount} khách hàng\n- Số dòng trùng SĐT / lỗi bỏ qua: ${res.totalRows - importedCount}`
      );
    } catch (err: any) {
      alert(`Lỗi khi đọc file Excel: ${err.message || err}`);
    } finally {
      e.target.value = '';
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const customerCards = cards.filter((c) => c.customerId === selectedCustomer?.id);
  const customerCheckins = checkins.filter((c) => c.customerId === selectedCustomer?.id);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newPhone) {
      alert('Vui lòng nhập Họ tên và Số điện thoại!');
      return;
    }

    const created = addCustomer({
      fullName: newFullName,
      phone: newPhone,
      gender: newGender,
      birthday: newBirthday,
      source: 'walk_in',
      skinType: newSkinType,
      allergies: newAllergies,
      notes: newNotes,
    });

    setSelectedCustomerId(created.id);
    setShowAddModal(false);
    setNewFullName('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Hồ sơ Khách hàng & Thẻ Liệu trình
          </h1>
          <p className="text-xs text-slate-500">
            Quản lý hồ sơ da, tiền sử điều trị, ảnh Before/After và theo dõi tiến độ số buổi
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 shadow-xs transition-all cursor-pointer"
            title="Xuất toàn bộ danh sách khách hàng ra file Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs border border-blue-200 shadow-xs transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          <button
            onClick={() => excelService.downloadTemplate('customers')}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
            title="Tải file mẫu Excel chuẩn để nhập liệu"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Khách mới</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer Directory (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col h-[750px]">
          {/* Search box */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên hoặc số điện thoại..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50"
            />
          </div>

          {/* Customer list scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">Không tìm thấy khách hàng nào</div>
            ) : (
              filteredCustomers.map((cus) => {
                const isSelected = selectedCustomer?.id === cus.id;
                const activeCardCount = cards.filter((c) => c.customerId === cus.id && c.status === 'active').length;

                return (
                  <div
                    key={cus.id}
                    onClick={() => setSelectedCustomerId(cus.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50/80 border-rose-300 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">{cus.fullName}</span>
                      {activeCardCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {activeCardCount} gói đang dùng
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="w-3 h-3 text-rose-500" />
                      <span className="font-mono text-[11px]">{cus.phone}</span>
                    </div>
                    {cus.debtBalance > 0 && (
                      <div className="text-[10px] font-semibold text-rose-600 mt-1">
                        Nợ: {formatVND(cus.debtBalance)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer 360 & Treatment Cards (8 cols) */}
        {selectedCustomer && (
          <div className="lg:col-span-8 space-y-6">
            {/* Customer Info Card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-slate-900">{selectedCustomer.fullName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                      {selectedCustomer.gender === 'female' ? 'Nữ' : 'Nam'}
                    </span>
                    <button
                      onClick={() => setEditingCustomer(selectedCustomer)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold border border-slate-200/60"
                      title="Sửa thông tin hồ sơ khách hàng"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sửa hồ sơ</span>
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>SĐT: <strong className="text-slate-800">{selectedCustomer.phone}</strong></span>
                    <span>•</span>
                    <span>Sinh nhật: {selectedCustomer.birthday}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Tổng chi tiêu</div>
                    <div className="font-bold text-slate-900">{formatVND(selectedCustomer.totalSpend)}</div>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-200">
                    <div className="text-[10px] text-slate-400">Ví trả trước</div>
                    <div className="font-bold text-emerald-600">{formatVND(selectedCustomer.walletBalance)}</div>
                  </div>
                  <div className="text-right pl-3 border-l border-slate-200">
                    <div className="text-[10px] text-slate-400">Điểm thưởng</div>
                    <div className="font-bold text-amber-600">{selectedCustomer.loyaltyPoints} pts</div>
                  </div>
                </div>
              </div>

              {/* Skin & Allergy Medical Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-semibold text-slate-500 block mb-0.5">Tình trạng da:</span>
                  <span className="font-medium text-slate-800">{selectedCustomer.skinType}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
                  <span className="font-semibold text-rose-600 block mb-0.5">Tiền sử dị ứng & Cảnh báo:</span>
                  <span className="font-medium text-rose-900">{selectedCustomer.allergies}</span>
                </div>
              </div>
            </div>

            {/* Treatment Cards / Packages Owned */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-600" />
                    <span>Thẻ Liệu trình & Gói Dịch vụ Đang Sở hữu</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Khách có thể check-in trừ buổi trực tiếp tại đây</p>
                </div>
                <span className="text-xs font-bold text-slate-600">{customerCards.length} gói</span>
              </div>

              {customerCards.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                  Khách hàng chưa mua gói liệu trình nào. Đến mục <strong>Bán hàng (POS)</strong> để kích hoạt gói mới!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customerCards.map((card) => {
                    const progressPercent = Math.round((card.usedSessions / card.totalSessions) * 100);

                    return (
                      <div
                        key={card.id}
                        className="p-4 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-rose-50/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-1">
                              {card.status === 'active' ? 'Đang sử dụng' : card.status}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900">{card.packageName}</h4>
                          </div>
                          <span className="text-xs font-mono font-bold text-rose-700 bg-white px-2 py-1 rounded-lg border border-rose-100 shadow-inner">
                            {card.usedSessions}/{card.totalSessions}
                          </span>
                        </div>

                        {/* Visual Session Dots Progress */}
                        <div className="space-y-1.5 my-3">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>Tiến độ thực hiện</span>
                            <span className="font-semibold text-rose-600">Còn {card.remainingSessions} buổi</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-rose-100/60">
                          <span>Hạn dùng: {card.expiryDate.slice(0, 10)}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setEditingCard(card)}
                              className="px-2 py-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg font-bold text-xs transition-colors flex items-center gap-1 border border-slate-200"
                              title="Sửa thông tin thẻ liệu trình"
                            >
                              <Edit3 className="w-3 h-3 text-amber-600" />
                              <span>Sửa thẻ</span>
                            </button>
                            {card.status === 'active' && card.remainingSessions > 0 ? (
                              <button
                                onClick={() => setCheckinModalCard(card)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm transition-all flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Check-in</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 font-semibold px-2 py-1">Đã hoàn thành</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Check-in Treatment History & Before/After gallery */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" />
                <span>Nhật ký Các Buổi Điều trị Đã Làm (Treatment Logs)</span>
              </h3>

              {customerCheckins.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">Chưa có nhật ký buổi làm nào</div>
              ) : (
                <div className="space-y-3">
                  {customerCheckins.map((chk) => (
                    <div
                      key={chk.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          Buổi #{chk.sessionNumber}: {chk.serviceName}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(chk.timestamp).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        <strong>KTV thực hiện:</strong> {chk.primaryTechName}
                        {chk.secondaryTechName && ` (Phụ: ${chk.secondaryTechName})`}
                      </div>
                      <div className="text-slate-600">
                        <strong>Quy trình:</strong> {chk.stepsPerformed}
                      </div>
                      <div className="text-rose-800 bg-rose-50 p-2 rounded-lg">
                        <strong>Phản ứng da:</strong> {chk.clientReaction}
                      </div>

                      {/* Before / After Photo Thumbnails */}
                      {(chk.beforePhotoUrl || chk.afterPhotoUrl) && (
                        <div className="flex items-center gap-3 pt-2">
                          {chk.beforePhotoUrl && (
                            <div>
                              <span className="block text-[10px] text-slate-400">Trước điều trị</span>
                              <img
                                src={chk.beforePhotoUrl}
                                alt="Before"
                                className="w-20 h-16 object-cover rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                          {chk.afterPhotoUrl && (
                            <div>
                              <span className="block text-[10px] text-slate-400">Sau điều trị</span>
                              <img
                                src={chk.afterPhotoUrl}
                                alt="After"
                                className="w-20 h-16 object-cover rounded-lg border border-slate-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {checkinModalCard && (
        <TreatmentCheckinModal card={checkinModalCard} onClose={() => setCheckinModalCard(null)} />
      )}

      {/* Edit Treatment Card Modal */}
      {editingCard && (
        <EditTreatmentCardModal card={editingCard} onClose={() => setEditingCard(null)} />
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <EditCustomerModal customer={editingCustomer} onClose={() => setEditingCustomer(null)} />
      )}

      {/* Create Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">Thêm Hồ sơ Khách hàng Mới</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  placeholder="Ví dụ: Nguyễn Phương Mai"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*)</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    placeholder="0912345678"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={newBirthday}
                    onChange={(e) => setNewBirthday(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tình trạng da</label>
                  <input
                    type="text"
                    value={newSkinType}
                    onChange={(e) => setNewSkinType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    placeholder="Da dầu, mụn ẩn, nám..."
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiền sử dị ứng mỹ phẩm / Lưu ý</label>
                <input
                  type="text"
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  placeholder="Dị ứng cồn, paraben, hương liệu..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Lưu Khách Hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

