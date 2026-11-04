import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { useAuth } from '../../context/AuthContext';
import { Staff, UserRole } from '../../types';
import { formatVND } from '../../domain/financial';
import {
  Users,
  Award,
  Shield,
  UserCheck,
  Stethoscope,
  CheckCircle,
  UserPlus,
  Trash2,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Briefcase,
  Edit3,
  Crown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EditStaffModal } from './EditStaffModal';

export const StaffList: React.FC = () => {
  const { staffList, commissions, services, addStaff, deleteStaff, setPrimaryAdmin: setPrimaryAdminData } = useSpaData();
  const { currentUser, refreshStaff, setPrimaryAdmin: setPrimaryAdminAuth } = useAuth();

  // If technician, default to self
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    currentUser.role === 'technician' ? currentUser.id : staffList[0]?.id || ''
  );

  const [showPassword, setShowPassword] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Add Staff Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [title, setTitle] = useState('Kỹ thuật viên Da liễu');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [baseSalary, setBaseSalary] = useState(8000000);
  const [commissionRate, setCommissionRate] = useState(2);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['srv-01']);

  const selectedStaff = staffList.find((s) => s.id === selectedStaffId) || staffList[0];
  const staffCommissions = commissions.filter((c) => c.staffId === selectedStaff?.id);
  const totalCommission = staffCommissions.reduce((sum, c) => sum + c.amount, 0);

  const roleBadges: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    admin: { label: 'Chủ Spa / Admin', icon: <Shield className="w-3.5 h-3.5" />, color: 'bg-amber-100 text-amber-800' },
    receptionist: { label: 'Lễ tân / Thu ngân', icon: <UserCheck className="w-3.5 h-3.5" />, color: 'bg-rose-100 text-rose-800' },
    technician: { label: 'Kỹ thuật viên', icon: <Stethoscope className="w-3.5 h-3.5" />, color: 'bg-emerald-100 text-emerald-800' },
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !username || !password) {
      alert('Vui lòng điền đầy đủ Họ tên, SĐT, Tên đăng nhập và Mật khẩu!');
      return;
    }

    // Check duplicate username
    if (staffList.some((s) => s.username === username)) {
      alert('Tên đăng nhập này đã tồn tại! Vui lòng chọn tên đăng nhập khác.');
      return;
    }

    const created = addStaff({
      name,
      phone,
      username,
      password,
      role,
      title,
      startDate,
      skills: selectedSkills,
      baseSalary: Number(baseSalary),
      salesCommissionRate: Number(commissionRate),
      status: 'active',
    });

    refreshStaff();
    confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    setSelectedStaffId(created.id);
    setShowAddModal(false);

    // Reset form
    setName('');
    setPhone('');
    setUsername('');
    setPassword('');
  };

  const handleSetPrimaryAdmin = (targetStaff: Staff) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn thiết lập "${targetStaff.name}" (@${targetStaff.username}) làm Quản trị viên (Admin) chính của Liin Spa?`
      )
    ) {
      setPrimaryAdminData(targetStaff.id);
      setPrimaryAdminAuth(targetStaff.id);
      refreshStaff();
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleDeleteStaff = (staffToDelete: Staff) => {
    if (staffToDelete.id === currentUser.id) {
      alert('Bạn không thể tự xóa tài khoản đang đăng nhập hiện tại!');
      return;
    }
    if (staffToDelete.isPrimaryAdmin) {
      alert('Không thể xóa tài khoản Quản trị viên (Admin) chính của hệ thống!');
      return;
    }

    if (confirm(`Bạn có chắc chắn muốn cho thôi việc và xóa nhân sự "${staffToDelete.name}" (${staffToDelete.username})?`)) {
      deleteStaff(staffToDelete.id);
      refreshStaff();
      if (selectedStaffId === staffToDelete.id) {
        setSelectedStaffId(staffList.find((s) => s.id !== staffToDelete.id)?.id || '');
      }
    }
  };

  const toggleSkill = (srvId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Quản Lý Nhân Sự & Bảng Kê Hoa Hồng
          </h1>
          <p className="text-xs text-slate-500">
            Hồ sơ nhân viên, tài khoản đăng nhập (user/password), ngày bắt đầu làm việc, kỹ năng & hoa hồng (Nguyên tắc V Hiến pháp)
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Nhân Viên Mới</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Staff Directory (4 cols - hidden if technician looking at self) */}
        {currentUser.role !== 'technician' && (
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
              <span>Đội ngũ nhân sự ({staffList.length})</span>
            </div>

            <div className="space-y-2">
              {[...staffList]
                .sort((a, b) => (a.isPrimaryAdmin ? -1 : b.isPrimaryAdmin ? 1 : 0))
                .map((staff) => {
                const isSelected = selectedStaff?.id === staff.id;
                const staffComm = commissions.filter((c) => c.staffId === staff.id);
                const sumComm = staffComm.reduce((sum, c) => sum + c.amount, 0);

                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="font-bold text-xs text-slate-900 truncate">{staff.name}</span>
                        {staff.isPrimaryAdmin && (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black tracking-wide border border-amber-300 shrink-0">
                            ⭐ ADMIN CHÍNH
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                          roleBadges[staff.role]?.color || ''
                        }`}
                      >
                        {roleBadges[staff.role]?.icon}
                        <span>{staff.role}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500">{staff.title}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                      <span>User: <strong className="font-mono text-slate-700">{staff.username}</strong></span>
                      <span>Vào làm: {staff.startDate || '2024-01-01'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100">
                      <span>Lương cứng: {formatVND(staff.baseSalary)}</span>
                      <span className="font-bold text-amber-700">+{formatVND(sumComm)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Right: Selected Staff Detail & Commission Ledger (8 cols or 12 cols if technician) */}
        <div
          className={`${
            currentUser.role !== 'technician' ? 'lg:col-span-8' : 'lg:col-span-12'
          } space-y-6`}
        >
          {selectedStaff && (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-amber-500 text-white font-bold text-base flex items-center justify-center shadow-md">
                      {selectedStaff.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-base">{selectedStaff.name}</h2>
                        {selectedStaff.isPrimaryAdmin && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black flex items-center gap-1 shadow-2xs">
                            <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Admin Chính (Chủ Spa)</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            roleBadges[selectedStaff.role]?.color || ''
                          }`}
                        >
                          {roleBadges[selectedStaff.role]?.icon}
                          <span>{selectedStaff.role}</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{selectedStaff.title}</span>
                        <span>•</span>
                        <span>SĐT: {selectedStaff.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {currentUser.role === 'admin' && (
                      <div className="text-right text-xs pr-3 border-r border-slate-200">
                        <div className="text-slate-400">Lương cơ bản</div>
                        <div className="text-base font-bold text-slate-900 font-mono">
                          {formatVND(selectedStaff.baseSalary)}
                        </div>
                      </div>
                    )}

                    {/* Set as Primary Admin Button */}
                    {currentUser.role === 'admin' && selectedStaff.role === 'admin' && !selectedStaff.isPrimaryAdmin && (
                      <button
                        onClick={() => handleSetPrimaryAdmin(selectedStaff)}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Thiết lập tài khoản này làm Quản trị viên (Admin) chính của Spa"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Đặt làm Admin chính</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => setEditingStaff(selectedStaff)}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Sửa thông tin hồ sơ nhân sự"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Sửa thông tin</span>
                      </button>
                    )}

                    {currentUser.role === 'admin' && selectedStaff.id !== currentUser.id && !selectedStaff.isPrimaryAdmin && (
                      <button
                        onClick={() => handleDeleteStaff(selectedStaff)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Xóa / Thôi việc nhân viên này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Account Credentials & Employment Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {/* Ngày vào làm */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>Ngày bắt đầu làm việc:</span>
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {selectedStaff.startDate || '2024-01-15'}
                    </span>
                  </div>

                  {/* Tên đăng nhập */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-500 flex items-center gap-1.5 mb-1">
                      <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                      <span>Tên đăng nhập (Username):</span>
                    </span>
                    <span className="font-mono font-bold text-rose-700 text-sm">
                      {selectedStaff.username}
                    </span>
                  </div>

                  {/* Mật khẩu */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-500">Mật khẩu (Password):</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-slate-400 hover:text-slate-700"
                        title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {showPassword ? selectedStaff.password || '******' : '••••••••'}
                    </span>
                  </div>
                </div>

                {/* Skill Matrix */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Bảng kỹ năng chuyên môn (Skill Matrix):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedStaff.skills.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">Nghiệp vụ lễ tân, thu ngân và tư vấn bán hàng</span>
                    ) : (
                      selectedStaff.skills.map((srvId) => {
                        const srv = services.find((s) => s.id === srvId);
                        return (
                          <span
                            key={srvId}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{srv?.name || srvId}</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Commission Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Hoa hồng Tour KTV</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                    {formatVND(
                      staffCommissions
                        .filter((c) => c.type.startsWith('tour'))
                        .reduce((sum, c) => sum + c.amount, 0)
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase">Hoa hồng Bán gói/Mỹ phẩm</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                    {formatVND(
                      staffCommissions
                        .filter((c) => c.type.startsWith('sales'))
                        .reduce((sum, c) => sum + c.amount, 0)
                    )}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm">
                  <div className="text-[11px] font-bold text-amber-800 uppercase">Tổng Thu Nhập Hoa Hồng</div>
                  <div className="text-2xl font-bold text-amber-900 font-mono mt-1">
                    {formatVND(totalCommission)}
                  </div>
                </div>
              </div>

              {/* Itemized Commission Ledger */}
              <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>Nhật ký Đối soát Bảng kê Hoa hồng Chi tiết</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ghi nhận tự động từ từng buổi làm dịch vụ và từng hóa đơn bán hàng
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {staffCommissions.length} lượt
                  </span>
                </div>

                {staffCommissions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                    Chưa có lượt ghi nhận hoa hồng nào trong tháng này
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                        <tr>
                          <th className="p-2.5 rounded-l-lg">Thời gian</th>
                          <th className="p-2.5">Phân loại</th>
                          <th className="p-2.5">Chi tiết dịch vụ / Đơn hàng</th>
                          <th className="p-2.5 text-right rounded-r-lg">Số tiền nhận</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffCommissions.map((com) => (
                          <tr key={com.id} className="hover:bg-slate-50/70">
                            <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                              {new Date(com.timestamp).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                                {com.type}
                              </span>
                            </td>
                            <td className="p-2.5 font-medium text-slate-800">{com.description}</td>
                            <td className="p-2.5 text-right font-bold text-emerald-600 font-mono">
                              +{formatVND(com.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center gap-2 text-rose-800">
              <UserPlus className="w-6 h-6 text-rose-600" />
              <h3 className="font-bold text-lg text-slate-900">Thêm Hồ Sơ Nhân Sự Mới</h3>
            </div>
            <p className="text-xs text-slate-500">
              Cung cấp thông tin tài khoản đăng nhập (user/password) và ngày bắt đầu làm việc
            </p>

            <form onSubmit={handleCreateStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Phương Thảo"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Username & Password */}
              <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2">
                <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                  <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                  <span>Tài khoản đăng nhập hệ thống:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Tên đăng nhập (Username) (*)</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="thao_ktv"
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Mật khẩu (Password) (*)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Role, Title & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vai trò quyền hạn</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="technician">Kỹ thuật viên</option>
                    <option value="receptionist">Lễ tân / Thu ngân</option>
                    <option value="admin">Quản trị viên / Chủ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chức danh / Vị trí</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="KTV Da liễu, Bác sĩ..."
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày vào làm (*)</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Salary & Sales Commission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lương cơ bản (VND/tháng)</label>
                  <input
                    type="number"
                    step="500000"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hoa hồng chốt gói/sale (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Skills selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Phân công kỹ năng dịch vụ (KTV được phép làm):
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                  {services.map((srv) => (
                    <label key={srv.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(srv.id)}
                        onChange={() => toggleSkill(srv.id)}
                        className="rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="line-clamp-1">{srv.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Lưu & Cấp Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Staff Modal */}
      {editingStaff && (
        <EditStaffModal staff={editingStaff} onClose={() => setEditingStaff(null)} />
      )}
    </div>
  );
};
