/**
 * Generates Napas247 Dynamic VietQR image URL
 * Standard: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png
 */

export interface BankOption {
  id: string;
  name: string;
  shortName: string;
}

export const VIETNAMESE_BANKS: BankOption[] = [
  { id: 'MB', name: 'MBBank - Ngân hàng Quân Đội', shortName: 'MBBank' },
  { id: 'VCB', name: 'Vietcombank - Ngân hàng Ngoại Thương VN', shortName: 'Vietcombank' },
  { id: 'TCB', name: 'Techcombank - Ngân hàng Kỹ Thương VN', shortName: 'Techcombank' },
  { id: 'VPB', name: 'VPBank - Ngân hàng TMCP Việt Nam Thịnh Vượng', shortName: 'VPBank' },
  { id: 'ACB', name: 'ACB - Ngân hàng TMCP Á Châu', shortName: 'ACB' },
  { id: 'BIDV', name: 'BIDV - Ngân hàng Đầu tư và Phát triển VN', shortName: 'BIDV' },
  { id: 'ICB', name: 'VietinBank - Ngân hàng Công Thương VN', shortName: 'VietinBank' },
  { id: 'TPB', name: 'TPBank - Ngân hàng Tiên Phong', shortName: 'TPBank' },
  { id: 'STB', name: 'Sacombank - Ngân hàng Sài Gòn Thương Tín', shortName: 'Sacombank' },
  { id: 'HDB', name: 'HDBank - Ngân hàng TMCP Phát triển TP.HCM', shortName: 'HDBank' },
  { id: 'VIB', name: 'VIB - Ngân hàng Quốc tế Việt Nam', shortName: 'VIB' },
  { id: 'SHB', name: 'SHB - Ngân hàng TMCP Sài Gòn - Hà Nội', shortName: 'SHB' },
  { id: 'MSB', name: 'MSB - Ngân hàng Hàng Hải Việt Nam', shortName: 'MSB' },
  { id: 'OCB', name: 'OCB - Ngân hàng TMCP Phương Đông', shortName: 'OCB' },
  { id: 'LPB', name: 'LPBank - Ngân hàng TMCP Lộc Phát VN', shortName: 'LPBank' },
  { id: 'SEAB', name: 'SeABank - Ngân hàng TMCP Đông Nam Á', shortName: 'SeABank' },
];

export interface VietQrConfig {
  bankId: string;
  accountNo: string;
  accountName: string;
  qrPrefix?: string;
}

export const DEFAULT_SPA_BANK: VietQrConfig = {
  bankId: 'MB', // MBBank
  accountNo: '090123456789',
  accountName: 'LIIN SPA VIETNAM',
  qrPrefix: 'LIINSPA',
};

export function generateVietQrUrl(
  amount: number,
  orderCode: string,
  config: VietQrConfig = DEFAULT_SPA_BANK
): string {
  const roundedAmount = Math.round(amount || 0);
  const cleanBank = encodeURIComponent(config.bankId || 'MB');
  const cleanAcc = encodeURIComponent(config.accountNo || '090123456789');
  const prefix = config.qrPrefix || 'LIINSPA';
  const cleanDesc = encodeURIComponent(`${prefix} ${orderCode}`.trim());
  const cleanName = encodeURIComponent(config.accountName || 'LIIN SPA VIETNAM');

  // Template: compact2 or qr_only
  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-compact2.png?amount=${roundedAmount}&addInfo=${cleanDesc}&accountName=${cleanName}`;
}

