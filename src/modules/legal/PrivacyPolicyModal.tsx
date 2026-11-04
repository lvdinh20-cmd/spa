import React from 'react';
import { useSpaData } from '../../context/SpaDataContext';
import { ShieldCheck, X, FileText, Lock, UserCheck, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
  const { settings } = useSpaData();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg">
                Chính Sách Bảo Vệ Dữ Liệu Cá Nhân
              </h2>
              <p className="text-[11px] text-rose-200">
                Tuân thủ Nghị định số 13/2023/NĐ-CP của Chính phủ Việt Nam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-600 leading-relaxed">
          {/* Section 1 */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-amber-950 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px]">Cam kết bảo mật dữ liệu</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                <strong>{settings.spaName || 'Liin Spa'}</strong> cam kết tôn trọng quyền riêng tư và bảo vệ tuyệt đối thông tin dữ liệu cá nhân của Quý khách theo đúng quy định tại <strong>Nghị định 13/2023/NĐ-CP</strong> về Bảo vệ Dữ liệu Cá nhân tại Việt Nam.
              </p>
            </div>
          </div>

          {/* Section 2: Bên kiểm soát và xử lý dữ liệu */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
              <UserCheck className="w-4 h-4 text-rose-600" />
              <span>1. Bên Kiểm Soát & Xử Lý Dữ Liệu</span>
            </h3>
            <p>
              Đơn vị chịu trách nhiệm kiểm soát và xử lý dữ liệu cá nhân của Quý khách là:
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 font-medium">
              <div>• <strong>Đơn vị:</strong> {settings.spaName || 'Hệ Thống Liin Spa & Beauty Clinic'}</div>
              <div>• <strong>Hotline bảo vệ dữ liệu:</strong> {settings.hotline}</div>
              <div>• <strong>Email phụ trách:</strong> {settings.email}</div>
              <div>• <strong>Địa chỉ cơ sở:</strong> {settings.address}</div>
            </div>
          </div>

          {/* Section 3: Loại dữ liệu thu thập */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
              <FileText className="w-4 h-4 text-rose-600" />
              <span>2. Loại Dữ Liệu Cá Nhân Thu Thập</span>
            </h3>
            <p>
              Khi Quý khách sử dụng biểu mẫu đặt lịch trực tuyến hoặc đăng ký dịch vụ tại Spa, chúng tôi chỉ thu thập các dữ liệu cá nhân cơ bản cần thiết gồm:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Thông tin định danh:</strong> Họ và tên khách hàng.</li>
              <li><strong>Thông tin liên lạc:</strong> Số điện thoại di động (dùng để xác nhận lịch hẹn, gửi mã OTP và nhắc lịch).</li>
              <li><strong>Thông tin dịch vụ & lịch hẹn:</strong> Dịch vụ làm đẹp lựa chọn, thời gian mong muốn, giường/phòng trị liệu và ghi chú tình trạng da (do khách hàng tự nguyện cung cấp).</li>
            </ul>
            <p className="text-slate-500 italic">
              * Chúng tôi tuyệt đối <strong>không</strong> yêu cầu hoặc thu thập các dữ liệu cá nhân nhạy cảm không liên quan (như tôn giáo, quan điểm chính trị, thông tin sinh trắc học bắt buộc...).
            </p>
          </div>

          {/* Section 4: Mục đích xử lý dữ liệu */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>3. Mục Đích Xử Lý Dữ Liệu</span>
            </h3>
            <p>
              Dữ liệu của Quý khách chỉ được xử lý nhằm các mục đích hợp pháp sau:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kiểm tra tình trạng trống của giường điều trị và Kỹ thuật viên (KTV) để xác nhận đặt chỗ.</li>
              <li>Gửi tin nhắn / email thông báo xác nhận và nhắc lịch hẹn trước ca làm dịch vụ.</li>
              <li>Lưu trữ hồ sơ liệu trình, bảo đảm quyền lợi bảo hành và tích điểm thành viên (Loyalty).</li>
              <li>Giải quyết các yêu cầu khiếu nại, phản hồi chất lượng dịch vụ của Quý khách.</li>
              <li>Tuyệt đối <strong>không bán, cho thuê hoặc chia sẻ dữ liệu</strong> cho bất kỳ bên thứ ba nào vì mục đích quảng cáo/thương mại trái phép.</li>
            </ul>
          </div>

          {/* Section 5: Quyền của Quý khách theo Nghị định 13/2023/NĐ-CP */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>4. Quyền Của Khách Hàng (Theo Điều 9 NĐ 13/2023/NĐ-CP)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">• Quyền được biết:</strong>
                <span>Quý khách được biết về hoạt động xử lý dữ liệu cá nhân của mình.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">• Quyền đồng ý & rút lại:</strong>
                <span>Có quyền đồng ý hoặc rút lại sự đồng ý bất cứ lúc nào.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">• Quyền chỉnh sửa & xóa:</strong>
                <span>Yêu cầu xem lại, cập nhật hoặc xóa dữ liệu cá nhân trong hệ thống Spa.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <strong className="text-slate-800 block mb-0.5">• Quyền khiếu nại:</strong>
                <span>Gửi khiếu nại nếu phát hiện dữ liệu bị sử dụng sai mục đích cam kết.</span>
              </div>
            </div>
          </div>

          {/* Section 6: Biện pháp bảo vệ an toàn */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-rose-800">
              <Lock className="w-4 h-4 text-rose-600" />
              <span>5. Biện Pháp Bảo Đảm An Toàn Dữ Liệu</span>
            </h3>
            <p>
              Hệ thống quản lý nội bộ của {settings.spaName} áp dụng các biện pháp kỹ thuật và tổ chức nghiêm ngặt:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mã hóa lưu trữ và truyền tải dữ liệu trên đường truyền an toàn (SSL/TLS).</li>
              <li>Kiểm soát phân quyền chặt chẽ theo vai trò (RBAC): Chỉ nhân viên được giao ca mới tiếp cận thông tin liên quan.</li>
              <li>Lưu vết nhật ký truy cập (Audit log) để phòng ngừa rò rỉ dữ liệu.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>Hotline giải đáp: <strong className="font-mono text-slate-800">{settings.hotline}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-luxury transition-all cursor-pointer"
          >
            Đã Hiểu & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

