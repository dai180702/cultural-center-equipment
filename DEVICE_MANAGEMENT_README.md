# Hướng dẫn sử dụng hệ thống quản lý thiết bị

## Tổng quan

Hệ thống quản lý thiết bị cung cấp đầy đủ các chức năng CRUD (Create, Read, Update, Delete) cho việc quản lý thiết bị tại Trung tâm Văn hóa Thể thao & Truyền thanh xã Bắc Tân Uyên.

## Các chức năng chính

### 1. Xem danh sách thiết bị

- **Đường dẫn**: `/devices`
- **Chức năng**:
  - Hiển thị danh sách tất cả thiết bị
  - Tìm kiếm thiết bị theo tên, mã, thương hiệu
  - Lọc theo trạng thái và danh mục
  - Phân trang (10 thiết bị/trang)
  - Các nút thao tác: Xem, Sửa, Xóa

### 2. Xem chi tiết thiết bị

- **Đường dẫn**: `/devices/[id]`
- **Chức năng**:
  - Hiển thị đầy đủ thông tin thiết bị
  - Thông tin cơ bản: tên, mã, danh mục, thương hiệu, model
  - Thông tin trạng thái và ngày tháng
  - Thông tin chi tiết: mô tả, thông số kỹ thuật, giá mua
  - Thông tin hệ thống: người tạo, ngày tạo, cập nhật
  - Các nút thao tác: Chỉnh sửa, Xóa, Làm mới

### 3. Thêm thiết bị mới

- **Đường dẫn**: `/devices/new`
- **Chức năng**:
  - Form thêm thiết bị với 3 bước
  - Bước 1: Thông tin cơ bản
  - Bước 2: Thông tin chi tiết
  - Bước 3: Thông tin bảo trì
  - Validation đầy đủ các trường bắt buộc

### 4. Chỉnh sửa thiết bị

- **Đường dẫn**: `/devices/[id]/edit`
- **Chức năng**:
  - Form chỉnh sửa với đầy đủ thông tin
  - Cập nhật tất cả các trường
  - Validation và kiểm tra dữ liệu
  - Nút Làm mới để tải lại dữ liệu gốc

### 5. Xóa thiết bị

- **Chức năng**:
  - Dialog xác nhận trước khi xóa
  - Hiển thị tên và mã thiết bị cần xóa
  - Cảnh báo hành động không thể hoàn tác
  - Xóa từ cả danh sách hiện tại và Firestore

## Cấu trúc dữ liệu thiết bị

### Thông tin cơ bản (bắt buộc)

- `name`: Tên thiết bị
- `code`: Mã thiết bị
- `category`: Danh mục thiết bị
- `brand`: Thương hiệu
- `model`: Model
- `serialNumber`: Số serial
- `purchaseDate`: Ngày mua
- `warrantyExpiry`: Hết hạn bảo hành
- `status`: Trạng thái (active/maintenance/broken/retired)
- `location`: Vị trí
- `department`: Phòng ban

### Thông tin bổ sung (tùy chọn)

- `assignedTo`: Người được giao
- `description`: Mô tả
- `specifications`: Thông số kỹ thuật
- `purchasePrice`: Giá mua
- `supplier`: Nhà cung cấp
- `maintenanceSchedule`: Lịch bảo trì
- `lastMaintenance`: Lần bảo trì cuối
- `nextMaintenance`: Lần bảo trì tiếp theo
- `notes`: Ghi chú

### Thông tin hệ thống

- `createdAt`: Ngày tạo
- `updatedAt`: Ngày cập nhật cuối
- `createdBy`: Người tạo

## Các trạng thái thiết bị

1. **Đang hoạt động** (active) - Màu xanh lá
2. **Cần bảo trì** (maintenance) - Màu vàng
3. **Đã hỏng** (broken) - Màu đỏ
4. **Thanh lý** (retired) - Màu xám

## Danh mục thiết bị

- Máy tính
- Máy in
- Thiết bị mạng
- Thiết bị âm thanh
- Thiết bị video
- Thiết bị thể thao
- Thiết bị văn phòng
- Khác

## Cách sử dụng

### Để xem danh sách thiết bị:

1. Truy cập `/devices`
2. Sử dụng thanh tìm kiếm để tìm thiết bị
3. Sử dụng bộ lọc theo trạng thái và danh mục
4. Click vào các nút thao tác để thực hiện hành động

### Để xem chi tiết thiết bị:

1. Từ danh sách, click nút "Xem chi tiết" (biểu tượng mắt)
2. Hoặc truy cập trực tiếp `/devices/[id]`
3. Xem đầy đủ thông tin thiết bị
4. Sử dụng các nút thao tác ở đầu trang

### Để chỉnh sửa thiết bị:

1. Từ danh sách, click nút "Chỉnh sửa" (biểu tượng bút chì)
2. Hoặc từ trang chi tiết, click nút "Chỉnh sửa"
3. Điền thông tin cần thay đổi
4. Click "Lưu thay đổi"

### Để xóa thiết bị:

1. Từ danh sách, click nút "Xóa" (biểu tượng thùng rác)
2. Hoặc từ trang chi tiết, click nút "Xóa"
3. Xác nhận trong dialog
4. Click "Xóa" để hoàn tất

### Để thêm thiết bị mới:

1. Truy cập `/devices/new`
2. Hoặc click nút "+" (FAB) ở góc phải dưới
3. Điền thông tin theo 3 bước
4. Click "Lưu" để hoàn tất

## Lưu ý quan trọng

1. **Xác thực**: Tất cả các trang đều yêu cầu đăng nhập
2. **Quyền**: Hiện tại tất cả người dùng đã đăng nhập đều có quyền đầy đủ
3. **Validation**: Các trường bắt buộc được kiểm tra trước khi lưu
4. **Backup**: Dữ liệu được lưu trữ trên Firebase Firestore
5. **Responsive**: Giao diện tương thích với cả desktop và mobile

## Xử lý lỗi

- **Lỗi tải dữ liệu**: Hiển thị thông báo lỗi và nút thử lại
- **Lỗi lưu dữ liệu**: Hiển thị thông báo lỗi cụ thể
- **Lỗi xóa**: Hiển thị thông báo lỗi và giữ nguyên dữ liệu
- **Lỗi mạng**: Tự động thử lại và hiển thị trạng thái

## Hỗ trợ kỹ thuật

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra kết nối internet
2. Làm mới trang
3. Kiểm tra console để xem lỗi chi tiết
4. Liên hệ quản trị viên hệ thống
