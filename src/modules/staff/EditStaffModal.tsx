import React, { useState } from 'react';
import { Staff, UserRole } from '../../types';
import { useSpaData } from '../../context/SpaDataContext';
import { useAuth } from '../../context/AuthContext';
import { X, UserCog, Eye, EyeOff, CheckCircle2, Shield, UserCheck, Stethoscope } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EditStaffModalProps {
  staff: Staff;
  onClose: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, onClose }) => {
  const { staffList, services, updateStaff } = useSpaData();
  const { refreshStaff } = useAuth();

  const [name, setName] = useState(staff.name);
  const [phone, setPhone] = useState(staff.phone);
  const [username, setUsername] = useState(staff.username);
  const [password, setPassword] = useState(staff.password);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(staff.role);
  const [title, setTitle] = useState(staff.title);
  const [startDate, setStartDate] = useState(
    staff.startDate || new Date().toISOString().slice(0, 10)
  );
  const [baseSalary, setBaseSalary] = useState(staff.baseSalary);
  const [commissionRate, setCommissionRate] = useState(staff.salesCommissionRate);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(staff.skills || []);

  const toggleSkill = (srvId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(srvId) ? prev.filter((id) => id !== srvId) : [...prev, srvId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !username || !password) {
      alert('Vui lòng điền đầy đủ Họ tên, SĐT, Tên đăng nhập và Mật khẩu!');
      return;
    }

    // Check duplicate username if username was changed
    if (
      username !== staff.username &&
      staffList.some((s) => s.id !== staff.id && s.username.toLowerCase() === username.toLowerCase())
    ) {
      alert('Tên đăng nhập này đã được sử dụng bởi nhân sự khác!');
      return;
    }

    updateStaff(staff.id, {
      name,
      phone,
      username,
      password,
      role,
      title,
      startDate,
      baseSalary: Number(baseSalary),
      salesCommissionRate: Number(commissionRate),
      skills: selectedSkills,
    });

    refreshStaff();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Cập Nhật Thông Tin Nhân Sự</h3>
              <p className="text-[11px] text-rose-200">Mã NV: {staff.id} • Tài khoản: {staff.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Họ và Tên (*)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Số điện thoại (*)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-medium"
                required
              />
            </div>
          </div>

          {/* Tài khoản đăng nhập & Mật khẩu */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <span>Tài Khoản Đăng Nhập Hệ Thống</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Username (*)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-rose-700 bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Password (*)</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-medium bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vai trò & Chức danh */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Vai trò hệ thống {staff.isPrimaryAdmin && <span className="text-amber-600 font-semibold">(Admin Chính)</span>}
              </label>
              <select
                value={role}
                disabled={staff.isPrimaryAdmin}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium ${
                  staff.isPrimaryAdmin ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                }`}
              >
                <option value="technician">Kỹ thuật viên (Technician)</option>
                <option value="receptionist">Lễ tân / Thu ngân (Receptionist)</option>
                <option value="admin">Quản lý / Chủ Spa (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Chức danh hiển thị</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kỹ thuật viên Da liễu..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>
          </div>

          {/* Ngày vào làm & Lương thưởng */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Ngày vào làm</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lương cứng (VND)</label>
              <input
                type="number"
                step={500000}
                min={0}
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Hoa hồng bán (%)</label>
              <input
                type="number"
                step={0.5}
                min={0}
                max={50}
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono font-bold text-amber-700"
              />
            </div>
          </div>

          {/* Bảng Kỹ năng dịch vụ (Skill Matrix) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Bảng Kỹ năng dịch vụ được phép thực hiện ({selectedSkills.length} dịch vụ)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {services.map((srv) => {
                const isChecked = selectedSkills.includes(srv.id);
                return (
                  <label
                    key={srv.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? 'bg-rose-50 border border-rose-200 text-rose-900' : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSkill(srv.id)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="truncate text-[11px] font-medium">{srv.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 font-bold transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold shadow-luxury flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Thông Tin Nhân Sự</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

