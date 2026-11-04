import React, { useState } from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { InventoryType, InventoryItem } from '../../types';
import { formatVND } from '../../domain/financial';
import { getInventoryAlerts } from '../../domain/inventory';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  ShieldCheck,
  Edit3,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
} from 'lucide-react';
import { EditInventoryModal } from './EditInventoryModal';
import { excelService } from '../../services/excel';
import confetti from 'canvas-confetti';

export const InventoryManager: React.FC = () => {
  const { inventory, updateStock, addInventoryItem, deleteInventoryItem, importInventoryBatch } = useSpaData();

  const [activeType, setActiveType] = useState<InventoryType>('consumable');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('ml');
  const [quantity, setQuantity] = useState(100);
  const [minThreshold, setMinThreshold] = useState(20);
  const [costPrice, setCostPrice] = useState(1000);
  const [retailPrice, setRetailPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState('2028-12-31');

  const { lowStock, nearExpiry } = getInventoryAlerts(inventory);

  const filteredItems = inventory.filter(
    (item) =>
      item.type === activeType &&
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku) return;

    addInventoryItem({
      sku,
      barcode: `893${Date.now().toString().slice(-6)}`,
      name,
      type: activeType,
      unit,
      quantity: Number(quantity),
      minThreshold: Number(minThreshold),
      costPrice: Number(costPrice),
      retailPrice: activeType === 'commercial' ? Number(retailPrice) : 0,
      expiryDate,
      batchNumber: `LOT-${new Date().getFullYear()}`,
    });

    setShowAddModal(false);
    setName('');
    setSku('');
  };

  const handleDeleteItem = (itemToDelete: InventoryItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa mặt hàng "${itemToDelete.name}" (${itemToDelete.sku}) khỏi kho?`)) {
      deleteInventoryItem(itemToDelete.id);
    }
  };

  // Excel Handlers for 2 Warehouses
  const handleExportExcel = () => {
    const itemsToExport = inventory
      .filter((i) => i.type === activeType)
      .map((i) => ({
        'Mã SKU': i.sku,
        'Mã Vạch Barcode': i.barcode,
        'Tên Mặt Hàng': i.name,
        'Loại Kho': i.type === 'consumable' ? 'Tiêu hao nội bộ' : 'Thương mại bán lẻ',
        'Đơn Vị Tính': i.unit,
        'Số Lượng Tồn': i.quantity,
        'Ngưỡng Tối Thiểu': i.minThreshold,
        'Giá Vốn (VND)': i.costPrice,
        'Giá Bán Lẻ (VND)': i.retailPrice,
        'Hạn Sử Dụng': i.expiryDate,
        'Số Lô Hàng': i.batchNumber,
      }));

    const fileName =
      activeType === 'consumable'
        ? 'TonKho_TieuHaoNoiBo_LiinSpa'
        : 'TonKho_ThuongMaiBanLe_LiinSpa';
    const sheetName = activeType === 'consumable' ? 'KhoTieuHao' : 'KhoThuongMai';
    excelService.exportToExcel(itemsToExport, fileName, sheetName);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await excelService.parseInventoryExcel(file);
      if (res.validRows.length === 0) {
        alert('File Excel không có dữ liệu hàng hóa hợp lệ hoặc sai định dạng!');
        return;
      }

      const preparedRows = res.validRows.map((r) => ({
        ...r,
        type: r.type || activeType,
      }));

      const count = importInventoryBatch(preparedRows);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(
        `Nhập dữ liệu kho Excel thành công!\n- Tổng số dòng đọc được: ${res.totalRows}\n- Thêm mới thành công: ${count} mặt hàng\n- Số dòng trùng SKU bỏ qua: ${res.totalRows - count}`
      );
    } catch (err: any) {
      alert(`Lỗi khi đọc file Excel kho: ${err.message || err}`);
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
            Quản Lý 2 Kho Hàng Độc Lập
          </h1>
          <p className="text-xs text-slate-500">
            Tách biệt nghiêm ngặt giữa Kho bán lẻ thương mại và Kho vật tư tiêu hao nội bộ (Nguyên tắc II Hiến pháp)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs border border-emerald-200 shadow-xs transition-all cursor-pointer"
            title={`Xuất tồn kho ${activeType === 'consumable' ? 'Kho tiêu hao' : 'Kho thương mại'} ra Excel`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Excel Kho</span>
          </button>

          {/* Excel Import Button */}
          <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl font-bold text-xs border border-blue-200 shadow-xs transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Nhập Excel Kho</span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {/* Download Template Button */}
          <button
            onClick={() => excelService.downloadTemplate('inventory')}
            className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
            title="Tải file mẫu Excel chuẩn để nhập kho"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mặt Hàng</span>
          </button>
        </div>
      </div>

      {/* Warehouse Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
          <button
            onClick={() => setActiveType('consumable')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'consumable'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>Kho Tiêu Hao Nội Bộ (Làm dịch vụ)</span>
          </button>

          <button
            onClick={() => setActiveType('commercial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeType === 'commercial'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Kho Thương Mại (Bán lẻ mang về)</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã SKU..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 w-60 bg-white"
          />
        </div>
      </div>

      {/* Alert Banner if items in active warehouse need attention */}
      {lowStock.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Có <strong>{lowStock.length} mặt hàng</strong> đang ở mức tồn kho dưới ngưỡng an toàn.
          </span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
            <tr>
              <th className="p-3 rounded-l-xl">Mã SKU</th>
              <th className="p-3">Tên mặt hàng</th>
              <th className="p-3">Đơn vị</th>
              <th className="p-3 text-right">Tồn kho hiện tại</th>
              <th className="p-3 text-right">Giá vốn</th>
              {activeType === 'commercial' && <th className="p-3 text-right">Giá bán lẻ</th>}
              <th className="p-3">Hạn dùng</th>
              <th className="p-3 text-center">Tồn kho +/-</th>
              <th className="p-3 text-center rounded-r-xl">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isLow = item.quantity <= item.minThreshold;

              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-800">{item.sku}</td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400">Lô: {item.batchNumber}</div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">{item.unit}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        isLow
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {item.quantity} {item.unit}
                    </span>
                    {isLow && (
                      <div className="text-[9px] text-rose-600 font-bold mt-0.5">Sắp hết hàng!</div>
                    )}
                  </td>
                  <td className="p-3 text-right font-medium">{formatVND(item.costPrice)}</td>
                  {activeType === 'commercial' && (
                    <td className="p-3 text-right font-bold text-emerald-700">
                      {formatVND(item.retailPrice)}
                    </td>
                  )}
                  <td className="p-3 font-mono text-[11px] text-slate-500">{item.expiryDate}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-white shadow-sm">
                      <button
                        onClick={() => updateStock(item.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        title="Trừ 1 đơn vị"
                      >
                        -
                      </button>
                      <button
                        onClick={() => updateStock(item.id, 10)}
                        className="px-2 h-6 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Nhập thêm 10 đơn vị"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => updateStock(item.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100"
                        title="Cộng 1 đơn vị"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold border border-slate-200/80"
                        title="Sửa thông tin hàng hóa"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa mặt hàng này khỏi kho"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">
              Thêm Hàng Hóa Vào {activeType === 'consumable' ? 'Kho Tiêu Hao' : 'Kho Thương Mại'}
            </h3>
            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã SKU (*)</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="NVL-05"
                    className="w-full p-2.5 rounded-xl border border-slate-200 uppercase font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị tính (*)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="ml, lọ, miếng..."
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Mặt Hàng (*)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tinh chất Collagen tươi..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng nhập</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngưỡng báo sắp hết</label>
                  <input
                    type="number"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá vốn (VND)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                {activeType === 'commercial' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giá bán lẻ (VND)</label>
                    <input
                      type="number"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hạn sử dụng</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
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
                  Nhập Hàng Vào Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Item Modal */}
      {editingItem && (
        <EditInventoryModal item={editingItem} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
};

