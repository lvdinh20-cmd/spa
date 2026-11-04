import * as XLSX from 'xlsx';
import { Customer, Service, PackageCombo, InventoryItem, Staff } from '../types';

export interface RowValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportResult<T> {
  success: boolean;
  validRows: T[];
  errors: RowValidationError[];
  totalRows: number;
}

export const excelService = {
  /**
   * Export JSON data to formatted .xlsx file
   */
  exportToExcel<T>(data: T[], fileName: string, sheetName: string = 'Sheet1') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  /**
   * Download pre-configured Excel Template with sample data and instructions
   */
  downloadTemplate(entityType: 'customers' | 'services' | 'packages' | 'inventory' | 'staff') {
    let sampleData: any[] = [];
    let fileName = '';

    switch (entityType) {
      case 'customers':
        fileName = 'Mau_Import_KhachHang_LiinSpa';
        sampleData = [
          {
            'Họ và Tên': 'Nguyễn Thu Thủy',
            'Số Điện Thoại': '0912999888',
            'Giới Tính (female/male)': 'female',
            'Ngày Sinh (YYYY-MM-DD)': '1996-08-20',
            'Nguồn Khách': 'Facebook',
            'Tình Trạng Da': 'Da nhạy cảm dầu mụn',
            'Tiền Sử Dị Ứng': 'Không',
            'Ghi Chú': 'Thích phòng yên tĩnh',
          },
          {
            'Họ và Tên': 'Trần Văn Hùng',
            'Số Điện Thoại': '0988111222',
            'Giới Tính (female/male)': 'male',
            'Ngày Sinh (YYYY-MM-DD)': '1990-03-12',
            'Nguồn Khách': 'Bạn bè giới thiệu',
            'Tình Trạng Da': 'Da khô',
            'Tiền Sử Dị Ứng': 'Dị ứng cồn',
            'Ghi Chú': 'Khách quen',
          },
        ];
        break;

      case 'services':
        fileName = 'Mau_Import_DichVu_LiinSpa';
        sampleData = [
          {
            'Mã Dịch Vụ': 'DV-TEST-01',
            'Tên Dịch Vụ': 'Chăm Sóc Da Căn Bản 8 Bước',
            'Danh Mục': 'Trị liệu da mặt',
            'Mô Tả': 'Liệu trình làm sạch sâu và cấp ẩm đa tầng',
            'Thời Lượng (Phút)': 60,
            'Đơn Giá (VND)': 350000,
            'Hoa Hồng KTV Chính (VND)': 50000,
            'Hoa Hồng KTV Phụ (VND)': 25000,
          },
          {
            'Mã Dịch Vụ': 'DV-TEST-02',
            'Tên Dịch Vụ': 'Massage Thải Độc Vai Gáy Thảo Dược',
            'Danh Mục': 'Massage & Thư giãn',
            'Mô Tả': 'Đả thông kinh lạc, giảm đau mỏi cổ vai gáy',
            'Thời Lượng (Phút)': 75,
            'Đơn Giá (VND)': 450000,
            'Hoa Hồng KTV Chính (VND)': 70000,
            'Hoa Hồng KTV Phụ (VND)': 35000,
          },
        ];
        break;

      case 'packages':
        fileName = 'Mau_Import_GoiCombo_LiinSpa';
        sampleData = [
          {
            'Tên Gói Liệu Trình': 'Combo Trị Mụn Chuẩn Y Khoa 10 Buổi',
            'Đơn Giá Gói (VND)': 4500000,
            'Giá Gốc (VND)': 6000000,
            'Thời Hạn (Tháng)': 6,
            'Hoa Hồng Bán Gói (VND)': 200000,
            'Tổng Số Buổi': 10,
          },
          {
            'Tên Gói Liệu Trình': 'Combo Trẻ Hóa Nâng Cơ Collagen VIP',
            'Đơn Giá Gói (VND)': 8000000,
            'Giá Gốc (VND)': 10000000,
            'Thời Hạn (Tháng)': 12,
            'Hoa Hồng Bán Gói (VND)': 400000,
            'Tổng Số Buổi': 8,
          },
        ];
        break;

      case 'inventory':
        fileName = 'Mau_Import_KhoHang_LiinSpa';
        sampleData = [
          {
            'Mã SKU': 'NVL-SR-99',
            'Mã Vạch Barcode': '893009999',
            'Tên Mặt Hàng': 'Serum Cấp Ẩm Hyaluronic Acid',
            'Loại Kho (consumable/commercial)': 'consumable',
            'Đơn Vị Tính': 'ml',
            'Số Lượng Tồn': 500,
            'Ngưỡng Tối Thiểu': 100,
            'Giá Vốn (VND)': 800,
            'Giá Bán Lẻ (VND)': 0,
            'Hạn Sử Dụng (YYYY-MM-DD)': '2028-12-31',
            'Số Lô Hàng': 'LOT-2026-HA',
          },
          {
            'Mã SKU': 'SP-KEM-88',
            'Mã Vạch Barcode': '893008888',
            'Tên Mặt Hàng': 'Kem Dưỡng Đêm Tái Tạo Da Liin',
            'Loại Kho (consumable/commercial)': 'commercial',
            'Đơn Vị Tính': 'hộp',
            'Số Lượng Tồn': 20,
            'Ngưỡng Tối Thiểu': 5,
            'Giá Vốn (VND)': 300000,
            'Giá Bán Lẻ (VND)': 450000,
            'Hạn Sử Dụng (YYYY-MM-DD)': '2028-06-30',
            'Số Lô Hàng': 'LOT-2026-KEM',
          },
        ];
        break;

      case 'staff':
        fileName = 'Mau_Import_NhanSu_LiinSpa';
        sampleData = [
          {
            'Họ và Tên': 'Bùi Thúy Hằng',
            'Số Điện Thoại': '0933224455',
            'Vai Trò (admin/receptionist/technician)': 'technician',
            'Chức Danh': 'Kỹ thuật viên Trị mụn',
            'Lương Cơ Bản (VND)': 8500000,
            'Tỷ Lệ Hoa Hồng Sale (%)': 2,
          },
        ];
        break;
    }

    this.exportToExcel(sampleData, fileName, 'Mau_Nhap_Lieu');
  },

  /**
   * Parse uploaded Excel file and validate row-by-row
   */
  async parseCustomersExcel(file: File): Promise<ImportResult<Partial<Customer>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

          const validRows: Partial<Customer>[] = [];
          const errors: RowValidationError[] = [];

          rawRows.forEach((row, index) => {
            const rowNumber = index + 2; // +1 for 0-index, +1 for header
            const fullName = row['Họ và Tên'] || row['fullName'];
            const phone = String(row['Số Điện Thoại'] || row['phone'] || '').trim();

            if (!fullName) {
              errors.push({ row: rowNumber, field: 'Họ và Tên', value: fullName, message: 'Họ và tên không được để trống' });
            }

            // Vietnamese phone number validation: 10 digits starting with 0
            const phoneRegex = /^0\d{9}$/;
            if (!phone || !phoneRegex.test(phone.replace(/\s+/g, ''))) {
              errors.push({ row: rowNumber, field: 'Số Điện Thoại', value: phone, message: 'Số điện thoại không hợp lệ (phải gồm 10 số bắt đầu bằng 0)' });
            }

            if (!errors.some((err) => err.row === rowNumber)) {
              validRows.push({
                fullName,
                phone: phone.replace(/\s+/g, ''),
                gender: (row['Giới Tính (female/male)'] || 'female').toLowerCase() === 'male' ? 'male' : 'female',
                birthday: row['Ngày Sinh (YYYY-MM-DD)'] || '2000-01-01',
                source: (row['Nguồn Khách'] || 'walk_in').toLowerCase(),
                skinType: row['Tình Trạng Da'] || 'Bình thường',
                allergies: row['Tiền Sử Dị Ứng'] || 'Không',
                notes: row['Ghi Chú'] || '',
                totalSpend: 0,
                debtBalance: 0,
                loyaltyPoints: 0,
                walletBalance: 0,
                createdAt: new Date().toISOString(),
              });
            }
          });

          resolve({
            success: errors.length === 0,
            validRows,
            errors,
            totalRows: rawRows.length,
          });
        } catch (err: any) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    });
  },

  async parseInventoryExcel(file: File): Promise<ImportResult<Partial<InventoryItem>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

          const validRows: Partial<InventoryItem>[] = [];
          const errors: RowValidationError[] = [];

          rawRows.forEach((row, index) => {
            const rowNumber = index + 2;
            const sku = String(row['Mã SKU'] || row['sku'] || '').trim();
            const name = row['Tên Mặt Hàng'] || row['name'];
            const type = (row['Loại Kho (consumable/commercial)'] || row['type'] || 'consumable').toLowerCase();
            const qty = Number(row['Số Lượng Tồn'] ?? row['quantity']);
            const cost = Number(row['Giá Vốn (VND)'] ?? row['costPrice']);

            if (!sku) {
              errors.push({ row: rowNumber, field: 'Mã SKU', value: sku, message: 'Mã SKU bắt buộc' });
            }
            if (!name) {
              errors.push({ row: rowNumber, field: 'Tên Mặt Hàng', value: name, message: 'Tên hàng hóa bắt buộc' });
            }
            if (isNaN(qty) || qty < 0) {
              errors.push({ row: rowNumber, field: 'Số Lượng Tồn', value: qty, message: 'Số lượng phải là số không âm' });
            }
            if (isNaN(cost) || cost < 0) {
              errors.push({ row: rowNumber, field: 'Giá Vốn', value: cost, message: 'Giá vốn phải là số không âm' });
            }

            if (!errors.some((err) => err.row === rowNumber)) {
              validRows.push({
                sku,
                name,
                barcode: String(row['Mã Vạch Barcode'] || ''),
                type: type.includes('com') ? 'commercial' : 'consumable',
                unit: row['Đơn Vị Tính'] || 'chiếc',
                quantity: qty,
                minThreshold: Number(row['Ngưỡng Tối Thiểu'] || 5),
                costPrice: cost,
                retailPrice: Number(row['Giá Bán Lẻ (VND)'] || 0),
                expiryDate: row['Hạn Sử Dụng (YYYY-MM-DD)'] || '2028-12-31',
                batchNumber: String(row['Số Lô Hàng'] || 'LOT-2026'),
              });
            }
          });

          resolve({
            success: errors.length === 0,
            validRows,
            errors,
            totalRows: rawRows.length,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    });
  },

  async parseServicesExcel(file: File): Promise<ImportResult<Partial<Service>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

          const validRows: Partial<Service>[] = [];
          const errors: RowValidationError[] = [];

          rawRows.forEach((row, index) => {
            const rowNumber = index + 2;
            const code = String(row['Mã Dịch Vụ'] || row['code'] || '').trim();
            const name = String(row['Tên Dịch Vụ'] || row['name'] || '').trim();
            const category = String(row['Danh Mục'] || row['category'] || 'Trị liệu da mặt').trim();
            const price = Number(row['Đơn Giá (VND)'] ?? row['price']);
            const duration = Number(row['Thời Lượng (Phút)'] ?? row['durationMinutes'] ?? 60);

            if (!code) {
              errors.push({ row: rowNumber, field: 'Mã Dịch Vụ', value: code, message: 'Mã dịch vụ không được để trống' });
            }
            if (!name) {
              errors.push({ row: rowNumber, field: 'Tên Dịch Vụ', value: name, message: 'Tên dịch vụ không được để trống' });
            }
            if (isNaN(price) || price < 0) {
              errors.push({ row: rowNumber, field: 'Đơn Giá (VND)', value: price, message: 'Đơn giá phải là số không âm' });
            }

            if (!errors.some((err) => err.row === rowNumber)) {
              validRows.push({
                code: code.toUpperCase(),
                name,
                category,
                description: String(
                  row['Mô Tả'] ||
                    row['description'] ||
                    'Dịch vụ làm đẹp chuyên sâu ứng dụng công nghệ cao tại Liin Spa.'
                ),
                durationMinutes: duration,
                price,
                tourFeePrimary: Number(row['Hoa Hồng KTV Chính (VND)'] ?? row['tourFeePrimary'] ?? 0),
                tourFeeSecondary: Number(row['Hoa Hồng KTV Phụ (VND)'] ?? row['tourFeeSecondary'] ?? 0),
                bom: [],
                steps: [
                  'Làm sạch sâu da mặt & tẩy da chết',
                  'Xông hơi thông thoáng lỗ chân lông',
                  'Thực hiện quy trình điều trị chuyên sâu',
                  'Đắp mặt nạ làm dịu da & khóa ẩm',
                ],
              });
            }
          });

          resolve({
            success: errors.length === 0,
            validRows,
            errors,
            totalRows: rawRows.length,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    });
  },

  async parsePackagesExcel(file: File): Promise<ImportResult<Partial<PackageCombo>>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

          const validRows: Partial<PackageCombo>[] = [];
          const errors: RowValidationError[] = [];

          rawRows.forEach((row, index) => {
            const rowNumber = index + 2;
            const name = String(row['Tên Gói Liệu Trình'] || row['name'] || '').trim();
            const price = Number(row['Đơn Giá Gói (VND)'] ?? row['price']);
            const originalPrice = Number(row['Giá Gốc (VND)'] ?? row['originalPrice'] ?? price * 1.25);
            const validityDays = Number(row['Thời Hạn (Ngày)'] ?? (Number(row['Thời Hạn (Tháng)'] || 6) * 30));
            const totalSessions = Number(row['Tổng Số Buổi'] ?? 10);
            const commission = Number(row['Hoa Hồng Bán Gói (VND)'] ?? row['salesCommission'] ?? 0);

            if (!name) {
              errors.push({ row: rowNumber, field: 'Tên Gói Liệu Trình', value: name, message: 'Tên gói không được để trống' });
            }
            if (isNaN(price) || price <= 0) {
              errors.push({ row: rowNumber, field: 'Đơn Giá Gói (VND)', value: price, message: 'Đơn giá gói phải lớn hơn 0' });
            }

            if (!errors.some((err) => err.row === rowNumber)) {
              validRows.push({
                name,
                price,
                originalPrice,
                validityDays,
                salesCommission: commission,
                services: [
                  {
                    serviceId: 'srv-01',
                    serviceName: 'Buổi điều trị liệu trình trong gói',
                    sessionCount: totalSessions,
                  },
                ],
              });
            }
          });

          resolve({
            success: errors.length === 0,
            validRows,
            errors,
            totalRows: rawRows.length,
          });
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsBinaryString(file);
    });
  },
};

