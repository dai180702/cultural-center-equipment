# HỆ THỐNG QUẢN LÝ THIẾT BỊ TRUNG TÂM VĂN HÓA

## Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên

---

## SLIDE 1: GIỚI THIỆU DỰ ÁN

### Thông tin dự án

- **Tên dự án:** Hệ thống Quản lý Thiết bị Trung tâm Văn hóa
- **Công nghệ:** Next.js 15, React 18, TypeScript, Firebase, Material-UI
- **Cơ sở dữ liệu:** Firebase Firestore (NoSQL)
- **Kiến trúc:** Client-Server với Serverless Backend

### Mục tiêu

- Quản lý hiệu quả thiết bị tại Trung tâm Văn hóa
- Theo dõi tình trạng và bảo trì thiết bị
- Quản lý kho và mượn trả thiết bị
- Báo cáo và thống kê chi tiết

---

## SLIDE 2: TỔNG QUAN THÀNH QUẢ

### Số liệu thống kê

- ✅ **8+ Modules chính** đã hoàn thành
- ✅ **50+ Trang/Routes** đã triển khai
- ✅ **5 Collections** Firestore
- ✅ **7+ Services** Backend
- ✅ **15+ Components** tái sử dụng
- ✅ **100% TypeScript** với type safety
- ✅ **Responsive Design** đầy đủ
- ✅ **Firebase Integration** hoàn chỉnh

---

## SLIDE 3: MODULE 1 - XÁC THỰC & PHÂN QUYỀN

### Chức năng đã hoàn thành

#### 1. Đăng nhập & Bảo mật

- ✅ Đăng nhập bằng Firebase Authentication
- ✅ Quản lý phiên đăng nhập an toàn
- ✅ Tính năng "Quên mật khẩu"
- ✅ Đăng xuất hệ thống
- ✅ AuthGuard bảo vệ routes

#### 2. Phân quyền 5 cấp độ

- ✅ Director (Giám đốc) - Quyền cao nhất
- ✅ Deputy Director (Phó giám đốc)
- ✅ Manager (Trưởng phòng/Quản lý)
- ✅ Staff (Nhân viên)
- ✅ Technician (Kỹ thuật viên)

---

## SLIDE 4: MODULE 2 - DASHBOARD (TRANG CHỦ)

### Thống kê tổng quan

- ✅ Tổng số thiết bị trong hệ thống
- ✅ Thiết bị đang hoạt động
- ✅ Thiết bị cần bảo trì
- ✅ Thiết bị đã hỏng
- ✅ Thiết bị thanh lý
- ✅ Thiết bị mới trong tháng
- ✅ Tổng số nhân viên
- ✅ Số lượng phòng ban

### Tính năng

- ✅ Card thống kê trực quan với màu sắc
- ✅ Biểu tượng (icons) phân biệt
- ✅ Nút "Làm mới" cập nhật realtime
- ✅ Responsive design
 
---

## SLIDE 5: MODULE 3 - QUẢN LÝ NGƯỜI DÙNG (1/2)

### Quản lý Nhân viên

#### Thêm nhân viên mới

- ✅ Form nhập liệu 3 bước
  - Bước 1: Thông tin cơ bản
  - Bước 2: Thông tin công việc
  - Bước 3: Thông tin bổ sung
- ✅ Tự động tạo tài khoản Firebase Auth
- ✅ Yêu cầu mật khẩu hành động

#### Quản lý danh sách

- ✅ Xem danh sách với phân trang
- ✅ Tìm kiếm theo tên, mã NV, email
- ✅ Lọc theo: Phòng ban, Trạng thái, Vai trò
- ✅ Chỉnh sửa thông tin nhân viên
- ✅ Xóa nhân viên (có mật khẩu hành động)
- ✅ Xuất dữ liệu Excel, PDF

---

## SLIDE 6: MODULE 3 - QUẢN LÝ NGƯỜI DÙNG (2/2)

### Quản lý Thông tin cá nhân (Profile)

#### 4 Tab thông tin chi tiết

1. **Thông tin chung**

   - Mã NV, Họ tên, Email, SĐT
   - Phòng ban, Vai trò, Ngày vào làm

2. **Thông tin liên hệ**

   - Địa chỉ (Dropdown tìm kiếm Tỉnh/TP và Phường/Xã)
   - Thông tin liên hệ khẩn cấp

3. **Thông tin bổ sung**

   - Kỹ năng chuyên môn (Thêm/Xóa nhiều kỹ năng)
   - Ghi chú

4. **Đổi mật khẩu**
   - Xác thực mật khẩu hiện tại
   - Validation đầy đủ

---

## SLIDE 7: MODULE 4 - QUẢN LÝ THIẾT BỊ (1/2)

### Quản lý Thiết bị đang sử dụng

#### Thêm thiết bị mới

- ✅ Form 3 bước (Cơ bản → Chi tiết → Bảo trì)
- ✅ Validation đầy đủ

#### Danh sách thiết bị

- ✅ Phân trang và tìm kiếm nâng cao
- ✅ Lọc theo: Danh mục, Trạng thái, Phòng ban, Vị trí
- ✅ Hiển thị: Mã, Tên, Thương hiệu, Model, Trạng thái

#### Xem chi tiết

- ✅ Drawer với 4 Tab:
  1. Thông tin cơ bản
  2. Thông số kỹ thuật
  3. Thông tin bảo trì
  4. Thông tin người mượn

---

## SLIDE 8: MODULE 4 - QUẢN LÝ THIẾT BỊ (2/2)

### Các loại thiết bị

- ✅ Máy tính
- ✅ Máy in
- ✅ Thiết bị mạng
- ✅ Thiết bị âm thanh
- ✅ Thiết bị video
- ✅ Thiết bị thể thao
- ✅ Thiết bị văn phòng
- ✅ Khác

### Trạng thái thiết bị

- ✅ Active (Đang hoạt động)
- ✅ Maintenance (Cần bảo trì)
- ✅ Broken (Đã hỏng)
- ✅ Retired (Thanh lý)

### Tính năng khác

- ✅ Mượn/Trả thiết bị trực tiếp
- ✅ Xuất Excel, PDF
- ✅ Báo cáo thiết bị riêng

---

## SLIDE 9: MODULE 5 - QUẢN LÝ KHO

### Quản lý Kho thiết bị

- ✅ Thêm thiết bị vào kho (Form 3 bước)
- ✅ Chỉnh sửa thiết bị trong kho
- ✅ Xóa thiết bị khỏi kho (Mật khẩu hành động)
- ✅ Xem danh sách với phân trang
- ✅ Tìm kiếm và lọc
- ✅ Xem chi tiết đầy đủ

### Chuyển đổi thiết bị

- ✅ Chuyển từ Kho sang Sử dụng
  - Chọn phòng ban
  - Cập nhật vị trí
  - Tự động chuyển collection
- ✅ Nhập kho (Stock Entry)
  - Chuyển từ đang sử dụng về kho
  - Hỗ trợ chuyển nhiều thiết bị cùng lúc

---

## SLIDE 10: MODULE 6 - BẢO TRÌ THIẾT BỊ

### Quản lý Bảo trì

#### Trang Bảo trì thiết bị

- ✅ Hiển thị thiết bị cần bảo trì/đã hỏng
- ✅ Tìm kiếm và lọc

#### Cập nhật thông tin bảo trì

- ✅ Lịch bảo trì (maintenance schedule)
- ✅ Ngày bảo trì cuối (last maintenance)
- ✅ Ngày bảo trì tiếp theo (next maintenance)
- ✅ Thay đổi trạng thái thiết bị
- ✅ Ghi chú bảo trì

#### Theo dõi

- ✅ Lịch sử bảo trì
- ✅ Người cập nhật
- ✅ Timestamp tự động

---

## SLIDE 11: MODULE 7 - MƯỢN TRẢ THIẾT BỊ

### Quản lý Phiếu mượn

#### Tạo phiếu mượn mới

- ✅ Chọn thiết bị từ `devices` hoặc `warehouse`
- ✅ Nhập: Người mượn, Mục đích, Ngày mượn, Ngày trả dự kiến
- ✅ Validation đầy đủ

#### Xem danh sách phiếu mượn

- ✅ Phân trang
- ✅ Tìm kiếm theo người mượn, thiết bị
- ✅ Lọc theo trạng thái: Đang mượn, Đã trả, Quá hạn
- ✅ Xem chi tiết phiếu mượn

#### Trả thiết bị

- ✅ Xác nhận trả
- ✅ Tự động cập nhật ngày trả
- ✅ Cập nhật trạng thái

---

## SLIDE 12: MODULE 8 - BÁO CÁO & THỐNG KÊ (1/2)

### 5 Loại Báo cáo chính

#### 1. Báo cáo Tổng hợp

- ✅ Card thống kê tổng quan
- ✅ Biểu đồ Bar, Pie, Doughnut
- ✅ Thống kê theo nhiều tiêu chí
- ✅ Xuất Excel/PDF

#### 2. Báo cáo Tồn kho

- ✅ Thống kê thiết bị trong kho
- ✅ Thống kê thiết bị đang sử dụng
- ✅ Biểu đồ theo danh mục và trạng thái
- ✅ Xuất dữ liệu

#### 3. Báo cáo Bảo trì

- ✅ Thiết bị cần bảo trì
- ✅ Thiết bị quá hạn bảo hành
- ✅ Biểu đồ phân tích
- ✅ Xuất dữ liệu

---

## SLIDE 13: MODULE 8 - BÁO CÁO & THỐNG KÊ (2/2)

#### 4. Báo cáo Hiệu suất

- ✅ Phân tích hiệu quả sử dụng thiết bị
- ✅ Thống kê mượn trả
- ✅ Biểu đồ xu hướng
- ✅ Xuất dữ liệu

#### 5. Báo cáo Người dùng

- ✅ Thống kê nhân viên theo phòng ban
- ✅ Thống kê theo trạng thái
- ✅ Thống kê theo vai trò
- ✅ Biểu đồ phân bổ
- ✅ Xuất dữ liệu

### Tính năng chung

- ✅ Chart.js & react-chartjs-2
- ✅ Biểu đồ tương tác
- ✅ Responsive design

---

## SLIDE 14: CÁC MODULE BỔ SUNG

### 1. Module Cài đặt Hệ thống

- ✅ Quản lý Mật khẩu hành động
- ✅ Thiết lập/Thay đổi mật khẩu
- ✅ Chỉ Director/Deputy Director có quyền
- ✅ Theo dõi người cập nhật

### 2. Module Phòng ban

- ✅ 6 Phòng ban mặc định:
  - Phòng Hành chính
  - Phòng Kế toán
  - Phòng Kỹ thuật
  - Phòng Văn hóa
  - Phòng Thể thao
  - Phòng Truyền thanh
- ✅ Tích hợp vào tất cả forms và filters

### 3. Module Thông báo

- ✅ Xem tất cả thông báo
- ✅ Cảnh báo
- ✅ Quản lý thông báo

---

## SLIDE 15: GIAO DIỆN & TRẢI NGHIỆM NGƯỜI DÙNG

### Material-UI (MUI)

- ✅ Theme tùy chỉnh
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Material Icons đầy đủ

### Layout & Navigation

- ✅ Sidebar Navigation đa cấp
- ✅ Top Header với thông tin user
- ✅ Breadcrumbs
- ✅ Menu dropdown

### Components UI

- ✅ Loading states
- ✅ Error handling
- ✅ Success/Error notifications
- ✅ Dialogs & Modals
- ✅ Drawers cho chi tiết
- ✅ Pagination
- ✅ Search & Filters
- ✅ Data tables với validation

---

## SLIDE 16: BACKEND & DATABASE

### Firebase Integration

- ✅ Firebase Authentication
- ✅ Firestore Database (NoSQL)
- ✅ Security Rules

### 5 Collections chính

1. **users** - Người dùng/Nhân viên
2. **devices** - Thiết bị đang sử dụng
3. **warehouse** - Thiết bị trong kho
4. **borrowRecords** - Phiếu mượn trả
5. **settings** - Cài đặt hệ thống

### 7+ Services Layer

- ✅ users.ts - Quản lý người dùng
- ✅ devices.ts - Quản lý thiết bị
- ✅ warehouse.ts - Quản lý kho
- ✅ borrows.ts - Quản lý mượn trả
- ✅ notifications.ts - Thông báo
- ✅ settings.ts - Cài đặt
- ✅ departments.ts - Phòng ban

---

## SLIDE 17: TÍNH NĂNG NỔI BẬT

### 1. Responsive Design

- ✅ Desktop (>1200px)
- ✅ Tablet (768px - 1200px)
- ✅ Mobile (<768px)
- ✅ Sidebar tự động thu gọn

### 2. Xuất dữ liệu

- ✅ Xuất Excel (XLSX)
- ✅ Xuất PDF (jsPDF)
- ✅ Tất cả báo cáo có thể xuất

### 3. Tìm kiếm & Lọc nâng cao

- ✅ Tìm kiếm realtime
- ✅ Lọc đa điều kiện
- ✅ Phân trang thông minh

### 4. Địa chỉ Việt Nam

- ✅ Dropdown tìm kiếm 63 Tỉnh/TP
- ✅ Dropdown tìm kiếm Phường/Xã
- ✅ Dữ liệu đầy đủ

---

## SLIDE 18: BẢO MẬT

### Tính năng bảo mật

- ✅ Firebase Authentication
- ✅ Phân quyền chi tiết theo vai trò
- ✅ Mật khẩu hành động cho thao tác quan trọng
- ✅ Xác thực lại khi đổi mật khẩu
- ✅ HTTPS cho tất cả requests
- ✅ Firestore Security Rules
- ✅ Session management an toàn

### Audit Trail

- ✅ Theo dõi người tạo/cập nhật
- ✅ Timestamp tự động (createdAt, updatedAt)
- ✅ Lịch sử thay đổi

---

## SLIDE 19: TÀI LIỆU

### Documentation hoàn chỉnh

1. **DATABASE_SCHEMA.md**

   - Sơ đồ cơ sở dữ liệu chi tiết
   - ERD diagram
   - Use cases

2. **DEVICE_MANAGEMENT_README.md**

   - Hướng dẫn quản lý thiết bị

3. **USERS_MANAGEMENT_README.md**

   - Hướng dẫn quản lý người dùng

4. **BORROW_DEVICE_FEATURE_UPDATE.md**

   - Cập nhật tính năng mượn thiết bị

5. **FORGOT_PASSWORD_SETUP.md**

   - Hướng dẫn setup quên mật khẩu

6. **CHANGELOG_FORGOT_PASSWORD.md**
   - Changelog chi tiết

---

## SLIDE 20: CÔNG NGHỆ SỬ DỤNG

### Frontend

- ✅ **Next.js 15.4.6** - React Framework
- ✅ **React 18.3.1** - UI Library
- ✅ **TypeScript 5** - Type Safety
- ✅ **Material-UI 7.3.1** - UI Components
- ✅ **Emotion** - CSS-in-JS

### Backend & Database

- ✅ **Firebase 12.1.0** - Backend as a Service
- ✅ **Firestore** - NoSQL Database
- ✅ **Firebase Auth** - Authentication

### Utilities & Tools

- ✅ **Chart.js 4.5.0** - Biểu đồ
- ✅ **jsPDF 3.0.3** - Xuất PDF
- ✅ **XLSX 0.18.5** - Xuất Excel
- ✅ **date-fns 4.1.0** - Xử lý ngày tháng
- ✅ **Notistack 3.0.2** - Thông báo

---

## SLIDE 21: DEMO SCREENSHOTS

### 1. Dashboard

![Dashboard với thống kê tổng quan]

### 2. Quản lý Thiết bị

![Danh sách thiết bị với search và filter]

### 3. Chi tiết Thiết bị

![Drawer chi tiết với 4 tabs]

### 4. Quản lý Người dùng

![Danh sách nhân viên với phân trang]

### 5. Báo cáo

![Biểu đồ thống kê với Chart.js]

---

## SLIDE 22: LUỒNG HOẠT ĐỘNG CHÍNH

### Luồng 1: Thêm thiết bị mới

1. Người dùng đăng nhập
2. Truy cập "Quản lý thiết bị"
3. Nhấn "Thêm thiết bị mới"
4. Điền form 3 bước
5. Lưu vào Firestore
6. Dashboard tự động cập nhật

### Luồng 2: Mượn thiết bị

1. Nhân viên đăng nhập
2. Truy cập "Mượn-Trả thiết bị"
3. Chọn thiết bị từ danh sách
4. Điền thông tin mượn
5. Tạo phiếu mượn
6. Thiết bị được gán cho người mượn

### Luồng 3: Bảo trì thiết bị

1. Kỹ thuật viên đăng nhập
2. Xem danh sách thiết bị cần bảo trì
3. Chọn thiết bị và cập nhật
4. Điền thông tin bảo trì
5. Lưu và cập nhật trạng thái

---

## SLIDE 23: KẾT QUẢ ĐẠT ĐƯỢC

### Chức năng

- ✅ 100% chức năng core đã hoàn thành
- ✅ 8+ Modules chính hoàn chỉnh
- ✅ 50+ Trang/Routes đã triển khai
- ✅ Responsive design đầy đủ

### Kỹ thuật

- ✅ 100% TypeScript với type safety
- ✅ Firebase integration hoàn chỉnh
- ✅ Material-UI design system
- ✅ Clean code structure

### Tài liệu

- ✅ Database schema chi tiết
- ✅ User guides đầy đủ
- ✅ API documentation
- ✅ Changelog và updates

---

## SLIDE 24: ƯU ĐIỂM CỦA HỆ THỐNG

### 1. Dễ sử dụng

- Giao diện thân thiện, trực quan
- Menu navigation rõ ràng
- Tìm kiếm và lọc mạnh mẽ

### 2. Hiệu suất cao

- Realtime updates với Firebase
- Phân trang thông minh
- Caching tối ưu

### 3. Bảo mật tốt

- Firebase Authentication
- Phân quyền chi tiết
- Mật khẩu hành động

### 4. Linh hoạt

- Responsive design
- Xuất nhiều định dạng
- Tùy chỉnh dễ dàng

---

## SLIDE 25: HƯỚNG PHÁT TRIỂN TIẾP THEO

### Tính năng mới (Optional)

- ⏳ In mã QR cho thiết bị
- ⏳ Quét QR code để check-in/check-out
- ⏳ Thông báo email tự động
- ⏳ Mobile app (React Native)
- ⏳ Tích hợp camera để chụp ảnh thiết bị
- ⏳ Lịch sử chi tiết hơn
- ⏳ Dashboard analytics nâng cao

### Cải tiến

- ⏳ Performance optimization
- ⏳ Offline mode
- ⏳ Multi-language support
- ⏳ Advanced reporting

---

## SLIDE 26: KẾT LUẬN

### Tổng kết

Hệ thống Quản lý Thiết bị đã hoàn thành đầy đủ các chức năng cốt lõi:

✅ **Quản lý người dùng** với phân quyền chi tiết
✅ **Quản lý thiết bị** toàn diện
✅ **Quản lý kho** hiệu quả
✅ **Mượn trả thiết bị** hoàn chỉnh
✅ **Báo cáo thống kê** chi tiết
✅ **Bảo trì thiết bị** chuyên nghiệp
✅ **Giao diện** thân thiện, responsive
✅ **Bảo mật** cao với Firebase

### Đánh giá

**Hệ thống đã sẵn sàng để triển khai và sử dụng trong môi trường thực tế!** 🚀

---

## PHỤ LỤC: THÔNG TIN LIÊN HỆ & HỖ TRỢ

### Thông tin dự án

- **GitHub Repository:** [Link to repository]
- **Documentation:** [Link to docs]
- **Demo:** [Link to demo]

### Liên hệ

- **Email:** [Your email]
- **Phone:** [Your phone]

### Công nghệ

- **Framework:** Next.js 15
- **Database:** Firebase Firestore
- **Hosting:** [Hosting provider]

---

# CẢM ƠN! 🙏

## Câu hỏi?
