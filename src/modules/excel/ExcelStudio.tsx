import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { excelService, RowValidationError } from '../../services/excel';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExcelStudio: React.FC = () => {
  const { customers, inventory, orders, commissions, importCustomersBatch, importInventoryBatch } = useSpaData();

  const [activeEntity, setActiveEntity] = useState<'customers' | 'inventory'>('customers');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<RowValidationError[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Export handlers
  const handleExportCustomers = () => {
    const flatData = customers.map((c) => ({
      'Mã Khách': c.id,
      'Họ và Tên': c.fullName,
      'Số Điện Thoại': c.phone,
      'Giới Tính': c.gender,
      'Ngày Sinh': c.birthday,
      'Nguồn Khách': c.source,
      'Tình Trạng Da': c.skinType,
      'Tiền Sử Dị Ứng': c.allergies,
      'Tổng Chi Tiêu (VND)': c.totalSpend,
      'Công Nợ (VND)': c.debtBalance,
      'Ví Trả Trước (VND)': c.walletBalance,
      'Điểm Tích Lũy': c.loyaltyPoints,
    }));
    excelService.exportToExcel(flatData, 'Danh_Sach_Khach_Hang_LiinSpa');
  };

  const handleExportInventory = () => {
    const flatData = inventory.map((i) => ({
      'Mã SKU': i.sku,
      'Mã Vạch': i.barcode,
      'Tên Hàng Hóa': i.name,
      'Loại Kho': i.type === 'commercial' ? 'Kho Thương Mại' : 'Kho Tiêu Hao',
      'Đơn Vị': i.unit,
      'Số Lượng Tồn': i.quantity,
      'Ngưỡng Tối Thiểu': i.minThreshold,
      'Giá Vốn (VND)': i.costPrice,
      'Giá Bán Lẻ (VND)': i.retailPrice,
      'Hạn Sử Dụng': i.expiryDate,
      'Số Lô': i.batchNumber,
    }));
    excelService.exportToExcel(flatData, 'Bao_Cao_Ton_Kho_LiinSpa');
  };

  const handleExportOrders = () => {
    const flatData = orders.map((o) => ({
      'Mã Hóa Đơn': o.code,
      'Khách Hàng': o.customerName,
      'Số Điện Thoại': o.customerPhone,
      'Thu Ngân': o.cashierName,
      'Người Bán': o.sellerName,
      'Tạm Tính': o.subtotal,
      'Giảm Giá': o.discountAmount,
      'Tổng Tiền': o.totalAmount,
      'Thực Thu': o.paidAmount,
      'Ghi Nợ': o.debtAmount,
      'Phương Thức': o.paymentMethod,
      'Lợi Nhuận Gộp (VND)': o.grossProfit,
      'Thời Gian': o.createdAt,
    }));
    excelService.exportToExcel(flatData, 'Bao_Cao_Doanh_Thu_Don_Hang_LiinSpa');
  };

  const handleExportCommissions = () => {
    const flatData = commissions.map((c) => ({
      'Mã Giao Dịch': c.referenceCode,
      'Nhân Viên Nhận': c.staffName,
      'Loại Hoa Hồng': c.type,
      'Nội Dung': c.description,
      'Số Tiền (VND)': c.amount,
      'Thời Gian': c.timestamp,
    }));
    excelService.exportToExcel(flatData, 'Bang_Ke_Hoa_Hong_LiinSpa');
  };

  // Import handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValidationErrors([]);
      setImportSuccessMsg(null);
    }
  };

  const handleProcessImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    setValidationErrors([]);
    setImportSuccessMsg(null);

    try {
      if (activeEntity === 'customers') {
        const result = await excelService.parseCustomersExcel(selectedFile);
        if (!result.success) {
          setValidationErrors(result.errors);
        } else {
          const inserted = importCustomersBatch(result.validRows);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          setImportSuccessMsg(`Đã nhập thành công ${inserted} khách hàng từ file Excel!`);
          setSelectedFile(null);
        }
      } else if (activeEntity === 'inventory') {
        const result = await excelService.parseInventoryExcel(selectedFile);
        if (!result.success) {
          setValidationErrors(result.errors);
        } else {
          const inserted = importInventoryBatch(result.validRows);
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
          setImportSuccessMsg(`Đã nhập thành công ${inserted} mặt hàng vào kho!`);
          setSelectedFile(null);
        }
      }
    } catch (err: any) {
      alert(`Lỗi đọc file: ${err.message || 'File không đúng định dạng Excel.'}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
          Studio Xuất / Nhập Dữ Liệu Excel Chuẩn Hóa
        </h1>
        <p className="text-xs text-slate-500">
          Hỗ trợ tải file mẫu, kiểm tra tính toàn vẹn dữ liệu từng dòng trước khi nhập và xuất báo cáo .xlsx chuẩn (Nguyên tắc VII Hiến pháp)
        </p>
      </div>

      {/* Grid: 2 Panels (Export Center on Left 6 cols, Import Studio on Right 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Fast Export Center */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Xuất Dữ Liệu Ra File Excel (.xlsx)</h2>
              <p className="text-[11px] text-slate-500">Tải dữ liệu tức thì phục vụ báo cáo và lưu trữ</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleExportCustomers}
              className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                  Danh Sách Khách Hàng
                </span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] text-slate-500">
                Xuất {customers.length} hồ sơ da, SĐT, số dư ví & công nợ
              </div>
            </button>

            <button
              onClick={handleExportInventory}
              className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                  Báo Cáo Tồn 2 Kho
                </span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] text-slate-500">
                Xuất {inventory.length} mặt hàng tiêu hao & bán lẻ
              </div>
            </button>

            <button
              onClick={handleExportOrders}
              className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                  Doanh Thu & Hóa Đơn
                </span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] text-slate-500">
                Xuất {orders.length} hóa đơn kèm lợi nhuận gộp P&L
              </div>
            </button>

            <button
              onClick={handleExportCommissions}
              className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-all space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800">
                  Bảng Kê Hoa Hồng
                </span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-[11px] text-slate-500">
                Xuất {commissions.length} lượt tour & sale nhân viên
              </div>
            </button>
          </div>
        </div>

        {/* Panel 2: Bulk Import Studio */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Nhập Dữ Liệu Từ File Excel</h2>
              <p className="text-[11px] text-slate-500">Tải file mẫu, kiểm tra hợp lệ từng dòng trước khi lưu</p>
            </div>
          </div>

          {/* Select Entity Type for Import */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveEntity('customers');
                setSelectedFile(null);
                setValidationErrors([]);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeEntity === 'customers'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hồ Sơ Khách Hàng
            </button>
            <button
              onClick={() => {
                setActiveEntity('inventory');
                setSelectedFile(null);
                setValidationErrors([]);
              }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                activeEntity === 'inventory'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Hàng Hóa Kho Bãi
            </button>
          </div>

          {/* Download Template Action */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-amber-900">1. Tải file mẫu chuẩn</div>
              <div className="text-[11px] text-amber-800">Chứa sẵn tiêu đề cột và dữ liệu mẫu minh họa</div>
            </div>
            <button
              onClick={() => excelService.downloadTemplate(activeEntity)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải Mẫu Excel</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div className="space-y-3">
            <div className="font-bold text-xs text-slate-700">2. Tải lên file Excel đã điền dữ liệu</div>
            <label className="border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-rose-50/30">
              <FileSpreadsheet className="w-8 h-8 text-rose-500 mb-2" />
              <span className="text-xs font-bold text-slate-800">
                {selectedFile ? selectedFile.name : 'Nhấp để chọn file Excel (.xlsx, .xls, .csv)'}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Dung lượng tối đa 15MB</span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleProcessImport}
            disabled={!selectedFile || importing}
            className={`w-full py-3 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${
              !selectedFile || importing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {importing ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileCheck className="w-4 h-4" />}
            <span>{importing ? 'Đang kiểm tra & nhập liệu...' : 'Kiểm tra & Nhập Dữ Liệu'}</span>
          </button>

          {/* Success Message */}
          {importSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {/* Error Diagnostics Table */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Phát hiện {validationErrors.length} lỗi trong file Excel (Chưa lưu vào hệ thống):</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {validationErrors.map((err, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-white/80 border border-rose-100 text-[11px] text-slate-700">
                    <strong className="text-rose-700">Dòng {err.row}:</strong> Trường [{err.field}] - {err.message} (Giá trị nhận: "{err.value}")
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

