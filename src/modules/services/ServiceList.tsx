import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { Service, PackageCombo } from '../../types';
import { formatVND } from '../../domain/financial';
import {
  Sparkles,
  Package as PackageIcon,
  Plus,
  Clock,
  Award,
  Layers,
  FileText,
  Trash2,
  Tag,
  Filter,
  Edit3,
  X,
  CheckCircle,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PackageModal } from './PackageModal';
import { excelService } from '../../services/excel';

export const ServiceList: React.FC = () => {
  const {
    services,
    packages,
    inventory,
    addService,
    updateService,
    deleteService,
    importServicesBatch,
    addPackage,
    updatePackage,
    deletePackage,
    importPackagesBatch,
  } = useSpaData();

  const [activeTab, setActiveTab] = useState<'services' | 'packages'>('services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // New Service Modal
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [srvName, setSrvName] = useState('');
  const [srvCode, setSrvCode] = useState('');
  const [srvCategory, setSrvCategory] = useState('Trị liệu da mặt');
  const [customCategory, setCustomCategory] = useState('');
  const [srvDescription, setSrvDescription] = useState('');
  const [srvDuration, setSrvDuration] = useState(60);
  const [srvPrice, setSrvPrice] = useState(450000);
  const [srvTour1, setSrvTour1] = useState(60000);
  const [srvTour2, setSrvTour2] = useState(30000);

  // Edit Service Modal State
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Package Modals State
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageCombo | null>(null);

  // Extract distinct categories
  const allCategories = Array.from(new Set(services.map((s) => s.category).filter(Boolean)));
  const defaultCategoryOptions = [
    'Trị liệu da mặt',
    'Chăm sóc da chuyên sâu',
    'Massage & Thư giãn',
    'Triệt lông vĩnh viễn',
    'Trị nám & Tàn nhang',
    'Gội đầu dưỡng sinh',
    'Khác (Nhập mới)',
  ];

  const filteredServices = services.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!srvName || !srvCode) {
      alert('Vui lòng nhập Mã và Tên dịch vụ!');
      return;
    }

    const finalCategory = srvCategory === 'Khác (Nhập mới)' ? customCategory || 'Chăm sóc da' : srvCategory;

    addService({
      code: srvCode.toUpperCase(),
      name: srvName,
      category: finalCategory,
      description:
        srvDescription ||
        'Dịch vụ làm đẹp chuyên sâu ứng dụng công nghệ cao tại Liin Spa, cam kết an toàn, dịu nhẹ và mang lại hiệu quả rõ rệt ngay sau buổi đầu tiên.',
      durationMinutes: Number(srvDuration),
      price: Number(srvPrice),
      tourFeePrimary: Number(srvTour1),
      tourFeeSecondary: Number(srvTour2),
      bom: [
        {
          materialId: inventory[0]?.id || 'mat-01',
          materialName: inventory[0]?.name || 'Tinh chất dưỡng da',
          quantity: 10,
          unit: 'ml',
        },
      ],
      steps: [
        'Làm sạch sâu da mặt & tẩy da chết sinh học',
        'Xông hơi thông thoáng lỗ chân lông',
        'Thực hiện quy trình điều trị chuyên sâu',
        'Đắp mặt nạ làm dịu & chiếu ánh sáng sinh học',
        'Thoa dưỡng chất khóa ẩm & kem chống nắng bảo vệ da',
      ],
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setShowAddServiceModal(false);
    setSrvName('');
    setSrvCode('');
    setSrvDescription('');
  };

  const handleUpdateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    updateService(editingService.id, {
      code: editingService.code.toUpperCase(),
      name: editingService.name,
      category: editingService.category,
      description: editingService.description,
      durationMinutes: Number(editingService.durationMinutes),
      price: Number(editingService.price),
      tourFeePrimary: Number(editingService.tourFeePrimary),
      tourFeeSecondary: Number(editingService.tourFeeSecondary),
    });

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    setEditingService(null);
  };

  const handleDeleteService = (srvId: string, srvName: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${srvName}" khỏi menu?`)) {
      deleteService(srvId);
    }
  };

  const handleDeletePackage = (pkg: PackageCombo) => {
    if (confirm(`Bạn có chắc chắn muốn xóa gói liệu trình "${pkg.name}" khỏi menu?`)) {
      deletePackage(pkg.id);
    }
  };

  // Excel Export & Import Handlers for Services & Packages
  const handleExportServicesExcel = () => {
    const dataToExport = services.map((s) => ({
      'Mã Dịch Vụ': s.code,
      'Tên Dịch Vụ': s.name,
      'Danh Mục': s.category,
      'Thời Lượng (Phút)': s.durationMinutes,
      'Đơn Giá (VND)': s.price,
      'Hoa Hồng KTV Chính (VND)': s.tourFeePrimary,
      'Hoa Hồng KTV Phụ (VND)': s.tourFeeSecondary,
      'Mô Tả Dịch Vụ': s.description,
    }));
    excelService.exportToExcel(dataToExport, 'DanhSach_DichVu_LiinSpa', 'DichVu');
  };

  const handleImportServicesExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await excelService.parseServicesExcel(file);
      if (res.validRows.length === 0) {
        alert('File Excel không có dữ liệu dịch vụ hợp lệ!');
        return;
      }

      const count = importServicesBatch(res.validRows);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(`Nhập thành công ${count} dịch vụ mới vào menu!`);
    } catch (err: any) {
      alert(`Lỗi khi đọc file Excel: ${err.message || err}`);
    } finally {
      e.target.value = '';
    }
  };

  const handleExportPackagesExcel = () => {
    const dataToExport = packages.map((p) => ({
      'Mã Gói': p.id,
      'Tên Gói Liệu Trình': p.name,
      'Đơn Giá Gói (VND)': p.price,
      'Giá Gốc (VND)': p.originalPrice,
      'Tiết Kiệm (%)': Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100),
      'Thời Hạn (Ngày)': p.validityDays,
      'Hoa Hồng Bán Gói (VND)': p.salesCommission,
      'Số Lượng Buổi': p.services.reduce((acc, curr) => acc + curr.sessionCount, 0),
    }));
    excelService.exportToExcel(dataToExport, 'DanhSach_GoiCombo_LiinSpa', 'GoiCombo');
  };

  const handleImportPackagesExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await excelService.parsePackagesExcel(file);
      if (res.validRows.length === 0) {
        alert('File Excel không có dữ liệu gói combo hợp lệ!');
        return;
      }

      const count = importPackagesBatch(res.validRows);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(`Nhập thành công ${count} gói combo liệu trình mới!`);
    } catch (err: any) {
      alert(`Lỗi khi đọc file Excel: ${err.message || err}`);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Menu Dịch Vụ & Gói Liệu Trình
          </h1>
          <p className="text-xs text-slate-500">
            Phân loại danh mục dịch vụ, mô tả chi tiết công dụng quy trình, định mức tiêu hao (BOM) và tiền hoa hồng Tour
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Excel Export Button */}
          <button
            onClick={activeTab === 'services' ? handleExportServicesExcel : handleExportPackagesExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 shadow-xs transition-all cursor-pointer"
            title={activeTab === 'services' ? 'Xuất danh sách dịch vụ ra Excel' : 'Xuất danh sách gói combo ra Excel'}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Excel Import Button */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs border border-blue-200 shadow-xs transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập Excel</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={activeTab === 'services' ? handleImportServicesExcel : handleImportPackagesExcel}
              className="hidden"
            />
          </label>

          {/* Download Template Button */}
          <button
            onClick={() => excelService.downloadTemplate(activeTab === 'services' ? 'services' : 'packages')}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
            title={`Tải file mẫu Excel chuẩn để nhập ${activeTab === 'services' ? 'Dịch vụ' : 'Gói Combo'}`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Create Button */}
          {activeTab === 'services' ? (
            <button
              onClick={() => setShowAddServiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Dịch Vụ Mới</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddPackageModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Gói Combo Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs: Services vs Packages */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-rose-600" />
          <span>Menu Dịch Vụ ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'packages'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PackageIcon className="w-4 h-4 text-amber-600" />
          <span>Gói Combo Liệu Trình ({packages.length})</span>
        </button>
      </div>

      {/* Tab 1: Services List with Category Filter and Descriptions */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Category Filter Pills (Phân loại dịch vụ) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 pr-2 border-r border-slate-200 shrink-0">
              <Filter className="w-3.5 h-3.5 text-rose-600" />
              <span>Phân loại:</span>
            </span>

            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rose-600 text-white font-bold shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả ({services.length})
            </button>

            {allCategories.map((cat) => {
              const count = services.filter((s) => s.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white font-bold shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-3.5 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {srv.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1">
                          <Tag className="w-2.5 h-2.5" />
                          <span>{srv.category}</span>
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 mt-1.5">{srv.name}</h3>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-base text-rose-700">{formatVND(srv.price)}</div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{srv.durationMinutes} phút</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Description (Mô tả chi tiết dịch vụ) */}
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50/50 via-slate-50 to-amber-50/30 border border-rose-100/60 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-rose-800 block mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-rose-600" />
                      <span>Mô tả dịch vụ & Hiệu quả:</span>
                    </span>
                    <p className="text-slate-600">{srv.description || 'Chưa cập nhật mô tả chi tiết.'}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Commission tour fee info */}
                  <div className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hoa hồng Tour KTV:</span>
                    </span>
                    <div className="font-semibold text-slate-800 space-x-2">
                      <span>Chính: <strong className="text-emerald-700">{formatVND(srv.tourFeePrimary)}</strong></span>
                      <span>•</span>
                      <span>Phụ: <strong className="text-slate-600">{formatVND(srv.tourFeeSecondary)}</strong></span>
                    </div>
                  </div>

                  {/* BOM Consumable items */}
                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-500" />
                      <span>Định mức Tiêu hao (BOM) tự động trừ kho:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {srv.bom.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-rose-50/80 border border-rose-100 text-[11px] font-medium text-rose-900"
                        >
                          {b.materialName}: <strong>{b.quantity} {b.unit}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action row with SỬA and XÓA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-[11px] text-slate-400">{srv.steps?.length || 0} bước quy trình</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingService(srv)}
                        className="px-2.5 py-1 text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Chỉnh sửa dịch vụ này"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteService(srv.id, srv.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1 text-[11px]"
                        title="Xóa dịch vụ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Packages List */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const savings = pkg.originalPrice - pkg.price;
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-3xl border border-amber-200/80 p-5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      Hạn dùng {pkg.validityDays} ngày
                    </span>
                    <span className="text-xs text-slate-400 line-through">{formatVND(pkg.originalPrice)}</span>
                  </div>

                  <div className="mt-2">
                    <h3 className="font-bold text-sm text-slate-900">{pkg.name}</h3>
                    <div className="font-bold text-lg text-rose-700 mt-1">{formatVND(pkg.price)}</div>
                    {savings > 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold">
                        Tiết kiệm {formatVND(savings)}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-xs flex justify-between my-3">
                    <span className="text-amber-900">Hoa hồng chốt gói:</span>
                    <strong className="text-amber-800">{formatVND(pkg.salesCommission)}</strong>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 my-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-slate-500">
                        Dịch vụ thành phần ({pkg.services.length}):
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        {pkg.services.reduce((sum, s) => sum + s.sessionCount, 0)} buổi tổng
                      </span>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto pr-0.5">
                      {pkg.services.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-slate-50/80 border border-slate-100"
                        >
                          <span className="font-medium text-slate-800 truncate mr-2">{s.serviceName}</span>
                          <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-lg shrink-0">
                            {s.sessionCount} buổi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingPackage(pkg)}
                    className="px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100/80 bg-amber-50 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    title="Chỉnh sửa dịch vụ, số lượng buổi và đơn giá gói"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Sửa Gói</span>
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title="Xóa gói combo này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-800">
                <Edit3 className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900">Chỉnh Sửa Dịch Vụ</h3>
              </div>
              <button onClick={() => setEditingService(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateServiceSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Dịch Vụ (*)</label>
                  <input
                    type="text"
                    value={editingService.code}
                    onChange={(e) => setEditingService({ ...editingService, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={editingService.durationMinutes}
                    onChange={(e) => setEditingService({ ...editingService, durationMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Dịch Vụ (*)</label>
                <input
                  type="text"
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phân loại / Danh mục dịch vụ (*)</label>
                <input
                  type="text"
                  value={editingService.category}
                  onChange={(e) => setEditingService({ ...editingService, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết dịch vụ & Công dụng</label>
                <textarea
                  rows={3}
                  value={editingService.description}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn Giá Bán Niêm Yết (VND)</label>
                <input
                  type="number"
                  step="10000"
                  value={editingService.price}
                  onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tour KTV Chính (VND)</label>
                  <input
                    type="number"
                    step="5000"
                    value={editingService.tourFeePrimary}
                    onChange={(e) => setEditingService({ ...editingService, tourFeePrimary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tour KTV Phụ (VND)</label>
                  <input
                    type="number"
                    step="5000"
                    value={editingService.tourFeeSecondary}
                    onChange={(e) => setEditingService({ ...editingService, tourFeeSecondary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {editingPackage && (
        <PackageModal
          packageToEdit={editingPackage}
          onClose={() => setEditingPackage(null)}
        />
      )}

      {/* Create Service Modal */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="font-bold text-slate-900 text-lg">Thêm Dịch Vụ Mới Vào Menu</h3>
            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã Dịch Vụ (*)</label>
                  <input
                    type="text"
                    value={srvCode}
                    onChange={(e) => setSrvCode(e.target.value)}
                    placeholder="DV-FAC-05"
                    className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    value={srvDuration}
                    onChange={(e) => setSrvDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Dịch Vụ (*)</label>
                <input
                  type="text"
                  value={srvName}
                  onChange={(e) => setSrvName(e.target.value)}
                  placeholder="Ví dụ: Chăm sóc da chuyên sâu căng bóng..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              {/* Phân loại dịch vụ (Category) */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 mb-1">Phân loại / Danh mục dịch vụ (*)</label>
                <select
                  value={srvCategory}
                  onChange={(e) => setSrvCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {defaultCategoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {srvCategory === 'Khác (Nhập mới)' && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Nhập tên phân loại mới (ví dụ: Phun xăm, Nail...)"
                    className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/40"
                    required
                  />
                )}
              </div>

              {/* Mô tả dịch vụ (Description) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Mô tả chi tiết dịch vụ & Công dụng (*)
                </label>
                <textarea
                  rows={3}
                  value={srvDescription}
                  onChange={(e) => setSrvDescription(e.target.value)}
                  placeholder="Mô tả công dụng, hiệu quả đem lại, đối tượng phù hợp và công nghệ sử dụng..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đơn Giá Bán Niêm Yết (VND) (*)</label>
                <input
                  type="number"
                  step="10000"
                  value={srvPrice}
                  onChange={(e) => setSrvPrice(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tour KTV Chính (VND)</label>
                  <input
                    type="number"
                    step="5000"
                    value={srvTour1}
                    onChange={(e) => setSrvTour1(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tour KTV Phụ (VND)</label>
                  <input
                    type="number"
                    step="5000"
                    value={srvTour2}
                    onChange={(e) => setSrvTour2(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddServiceModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
                >
                  Lưu Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showAddPackageModal && (
        <PackageModal onClose={() => setShowAddPackageModal(false)} />
      )}
    </div>
  );
};
