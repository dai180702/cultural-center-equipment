# Hệ thống Quản lý Nhân viên

## Tổng quan

Hệ thống Quản lý Nhân viên là một module hoàn chỉnh để quản lý thông tin nhân viên, phòng ban và phân quyền trong hệ thống Quản lý Thiết bị Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên.

## Tính năng chính

### 1. Quản lý danh sách nhân viên

- **Xem danh sách**: Hiển thị tất cả nhân viên với thông tin cơ bản
- **Tìm kiếm**: Tìm kiếm theo tên, mã nhân viên, email, chức vụ
- **Lọc dữ liệu**: Lọc theo phòng ban, trạng thái, vai trò
- **Phân trang**: Hỗ trợ phân trang với nhiều tùy chọn hiển thị
- **Thống kê nhanh**: Hiển thị số liệu tổng quan về nhân viên

### 2. Thêm nhân viên mới

- **Form 3 bước**: Chia thành 3 bước để nhập thông tin
  - Bước 1: Thông tin cơ bản (mã NV, họ tên, email, điện thoại, địa chỉ)
  - Bước 2: Thông tin công việc (phòng ban, chức vụ, ngày vào làm, trạng thái, vai trò)
  - Bước 3: Thông tin bổ sung (liên hệ khẩn cấp, kỹ năng, ghi chú)
- **Validation**: Kiểm tra dữ liệu đầu vào theo từng bước
- **Responsive**: Giao diện thân thiện trên mọi thiết bị

### 3. Xem chi tiết nhân viên

- **Thông tin đầy đủ**: Hiển thị tất cả thông tin của nhân viên
- **Giao diện đẹp**: Layout card với avatar và thông tin được nhóm logic
- **Thao tác nhanh**: Nút chỉnh sửa và xóa ngay trên trang chi tiết

### 4. Chỉnh sửa thông tin nhân viên

- **Form tương tự thêm mới**: Sử dụng cùng layout 3 bước
- **Dữ liệu có sẵn**: Tự động điền thông tin hiện tại
- **Cập nhật real-time**: Lưu thay đổi và cập nhật ngay lập tức

### 5. Xóa nhân viên

- **Xác nhận an toàn**: Dialog xác nhận trước khi xóa
- **Cập nhật danh sách**: Tự động refresh sau khi xóa

## Cấu trúc dữ liệu

### Model User

```typescript
interface User {
  id?: string; // ID tự động (Firebase)
  employeeId: string; // Mã nhân viên
  fullName: string; // Họ và tên
  email: string; // Email
  phone: string; // Số điện thoại
  department: string; // Phòng ban
  position: string; // Chức vụ
  startDate: string; // Ngày vào làm
  status: "active" | "inactive" | "suspended"; // Trạng thái
  role: "admin" | "manager" | "staff" | "technician"; // Vai trò
  address?: string; // Địa chỉ (tùy chọn)
  emergencyContact?: {
    // Liên hệ khẩn cấp (tùy chọn)
    name: string;
    phone: string;
    relationship: string;
  };
  skills?: string[]; // Kỹ năng chuyên môn (tùy chọn)
  notes?: string; // Ghi chú (tùy chọn)
  createdAt: string; // Ngày tạo
  updatedAt: string; // Ngày cập nhật cuối
}
```

### Trạng thái nhân viên

- **active**: Đang làm việc
- **inactive**: Tạm nghỉ
- **suspended**: Đình chỉ

### Vai trò nhân viên

- **admin**: Quản trị viên
- **manager**: Quản lý
- **staff**: Nhân viên
- **technician**: Kỹ thuật viên

## Cấu trúc thư mục

```
src/
├── services/
│   └── users.ts              # Service layer cho CRUD operations
├── hooks/
│   └── useUsers.ts           # Custom hook quản lý state
└── app/(app)/users/
    ├── page.tsx              # Trang danh sách nhân viên
    ├── new/
    │   └── page.tsx          # Trang thêm nhân viên mới
    └── [id]/
        ├── page.tsx          # Trang xem chi tiết nhân viên
        └── edit/
            └── page.tsx      # Trang chỉnh sửa nhân viên
```

## API Endpoints

### Service Functions

- `getUsers()`: Lấy danh sách tất cả nhân viên
- `getUsersPaginated(options)`: Lấy danh sách với phân trang
- `getUserById(id)`: Lấy thông tin nhân viên theo ID
- `getUserByEmployeeId(employeeId)`: Lấy nhân viên theo mã nhân viên
- `getUsersByFilters(filters)`: Lọc nhân viên theo điều kiện
- `addUser(userData)`: Thêm nhân viên mới
- `updateUser(id, userData)`: Cập nhật thông tin nhân viên
- `deleteUser(id)`: Xóa nhân viên
- `getDepartments()`: Lấy danh sách phòng ban
- `getUserStatistics()`: Lấy thống kê nhân viên

### Hook Functions

- `fetchUsers()`: Tải danh sách nhân viên
- `fetchUserById(id)`: Tải thông tin nhân viên
- `createUser(userData)`: Tạo nhân viên mới
- `editUser(id, userData)`: Chỉnh sửa nhân viên
- `removeUser(id)`: Xóa nhân viên
- `filterUsers(filters)`: Lọc nhân viên
- `fetchUserStatistics()`: Tải thống kê

## Hướng dẫn sử dụng

### 1. Truy cập hệ thống

- Đăng nhập vào hệ thống
- Vào menu "Quản lý nhân viên" trong sidebar
- Chọn "Danh sách" để xem tất cả nhân viên

### 2. Thêm nhân viên mới

- Click nút "Thêm nhân viên" trên trang danh sách
- Điền thông tin theo 3 bước:
  - **Bước 1**: Thông tin cơ bản (bắt buộc)
  - **Bước 2**: Thông tin công việc (bắt buộc)
  - **Bước 3**: Thông tin bổ sung (tùy chọn)
- Click "Lưu nhân viên" để hoàn tất

### 3. Xem chi tiết nhân viên

- Click nút "Xem" (👁️) trên bất kỳ dòng nào trong bảng
- Xem đầy đủ thông tin nhân viên
- Sử dụng nút "Chỉnh sửa" hoặc "Xóa" nếu cần

### 4. Chỉnh sửa nhân viên

- Từ trang chi tiết, click nút "Chỉnh sửa" (✏️)
- Hoặc từ trang danh sách, click nút "Chỉnh sửa" (✏️)
- Cập nhật thông tin cần thiết
- Click "Cập nhật nhân viên" để lưu

### 5. Xóa nhân viên

- Click nút "Xóa" (🗑️) trên bất kỳ dòng nào
- Xác nhận trong dialog hiện ra
- Click "Xóa" để hoàn tất

### 6. Tìm kiếm và lọc

- Sử dụng ô tìm kiếm để tìm theo từ khóa
- Chọn phòng ban, trạng thái, vai trò để lọc
- Click "Xóa bộ lọc" để reset tất cả bộ lọc

## Tính năng nâng cao

### 1. Responsive Design

- Giao diện tối ưu cho desktop, tablet và mobile
- Sidebar tự động ẩn/hiện theo kích thước màn hình
- Grid layout thích ứng với mọi thiết bị

### 2. Real-time Updates

- Tự động refresh dữ liệu sau mỗi thao tác
- Cập nhật thống kê real-time
- Xử lý lỗi và thông báo người dùng

### 3. Performance Optimization

- Lazy loading với phân trang
- Debounced search để tối ưu hiệu suất
- Memoized components để tránh re-render không cần thiết

### 4. Error Handling

- Validation form theo từng bước
- Hiển thị lỗi rõ ràng cho người dùng
- Fallback UI khi có lỗi

## Bảo mật

### 1. Authentication

- Yêu cầu đăng nhập để truy cập
- Kiểm tra quyền người dùng
- Bảo vệ các API endpoints

### 2. Data Validation

- Validation dữ liệu đầu vào
- Sanitize dữ liệu trước khi lưu
- Kiểm tra quyền truy cập

### 3. Audit Trail

- Ghi log tất cả thao tác CRUD
- Lưu thông tin người thực hiện
- Timestamp cho mọi thay đổi

## Troubleshooting

### 1. Lỗi thường gặp

- **"Không thể kết nối Firebase"**: Kiểm tra cấu hình Firebase
- **"Không tìm thấy nhân viên"**: Kiểm tra dữ liệu và bộ lọc
- **"Lỗi validation"**: Kiểm tra các trường bắt buộc

### 2. Giải pháp

- Refresh trang và thử lại
- Kiểm tra console để xem lỗi chi tiết
- Liên hệ admin nếu vấn đề vẫn tiếp tục

## Phát triển tương lai

### 1. Tính năng dự kiến

- Import/Export Excel
- Bulk operations (xóa nhiều, cập nhật hàng loạt)
- Advanced reporting và analytics
- Integration với hệ thống lương
- Mobile app

### 2. Cải tiến kỹ thuật

- Caching layer
- Offline support
- Real-time collaboration
- Advanced search với Elasticsearch
- Microservices architecture

## Liên hệ hỗ trợ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:

- **Email**: support@vanhoathethao-bactanuyen.gov.vn
- **Hotline**: 1900-1900
- **Admin**: admin@vanhoathethao-bactanuyen.gov.vn

---

**Phiên bản**: 1.0.0  
**Cập nhật lần cuối**: 2025  
**Tác giả**: Development Team  
**Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên**
