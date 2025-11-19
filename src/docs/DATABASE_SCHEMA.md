# SƠ ĐỒ QUAN HỆ CƠ SỞ DỮ LIỆU

## Hệ thống Quản lý Thiết bị Trung tâm Văn hóa

---

## 1. BẢNG USERS (Người dùng/Nhân viên)

**Collection:** `users`

### Các trường dữ liệu:

| Tên trường       | Kiểu dữ liệu  | Bắt buộc | Mô tả                                                                            |
| ---------------- | ------------- | -------- | -------------------------------------------------------------------------------- |
| **id**           | String        | Auto     | ID tự động (Firestore Document ID) - **PRIMARY KEY**                             |
| uid              | String        | Không    | UID từ Firebase Authentication                                                   |
| **employeeId**   | String        | Có       | Mã nhân viên (duy nhất)                                                          |
| **fullName**     | String        | Có       | Họ và tên đầy đủ                                                                 |
| **email**        | String        | Có       | Email                                                                            |
| **phone**        | String        | Có       | Số điện thoại                                                                    |
| **department**   | String        | Có       | Phòng ban                                                                        |
| **position**     | String        | Có       | Chức vụ                                                                          |
| **startDate**    | String        | Có       | Ngày vào làm (YYYY-MM-DD)                                                        |
| **status**       | Enum          | Có       | Trạng thái: "active" \| "inactive" \| "suspended"                                |
| **role**         | Enum          | Có       | Vai trò: "director" \| "deputy_director" \| "manager" \| "staff" \| "technician" |
| avatar           | String        | Không    | URL ảnh đại diện                                                                 |
| address          | String        | Không    | Địa chỉ                                                                          |
| emergencyContact | Object        | Không    | Liên hệ khẩn cấp {name, phone, relationship}                                     |
| skills           | Array[String] | Không    | Danh sách kỹ năng chuyên môn                                                     |
| notes            | String        | Không    | Ghi chú                                                                          |
| **createdAt**    | String        | Có       | Ngày tạo (ISO string)                                                            |
| **updatedAt**    | String        | Có       | Ngày cập nhật cuối (ISO string)                                                  |

---

## 2. BẢNG DEVICES (Thiết bị đang sử dụng)

**Collection:** `devices`

### Các trường dữ liệu:

| Tên trường          | Kiểu dữ liệu | Bắt buộc | Mô tả                                                                                                                                                   |
| ------------------- | ------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**              | String       | Auto     | ID tự động (Firestore Document ID) - **PRIMARY KEY**                                                                                                    |
| **name**            | String       | Có       | Tên thiết bị                                                                                                                                            |
| **code**            | String       | Có       | Mã thiết bị (duy nhất)                                                                                                                                  |
| **category**        | String       | Có       | Danh mục: "Máy tính" \| "Máy in" \| "Thiết bị mạng" \| "Thiết bị âm thanh" \| "Thiết bị video" \| "Thiết bị thể thao" \| "Thiết bị văn phòng" \| "Khác" |
| **brand**           | String       | Có       | Thương hiệu                                                                                                                                             |
| **model**           | String       | Có       | Model thiết bị                                                                                                                                          |
| **serialNumber**    | String       | Có       | Số serial                                                                                                                                               |
| **purchaseDate**    | String       | Có       | Ngày mua (YYYY-MM-DD)                                                                                                                                   |
| **warrantyExpiry**  | String       | Có       | Ngày hết hạn bảo hành (YYYY-MM-DD)                                                                                                                      |
| **status**          | Enum         | Có       | Trạng thái: "active" \| "maintenance" \| "broken" \| "retired"                                                                                          |
| **location**        | String       | Có       | Vị trí đặt thiết bị                                                                                                                                     |
| **department**      | String       | Có       | Phòng ban sử dụng                                                                                                                                       |
| assignedTo          | String       | Không    | **FK → users.uid** (Người được giao thiết bị)                                                                                                           |
| description         | String       | Không    | Mô tả thiết bị                                                                                                                                          |
| specifications      | String       | Không    | Thông số kỹ thuật                                                                                                                                       |
| purchasePrice       | Number       | Không    | Giá mua                                                                                                                                                 |
| supplier            | String       | Không    | Nhà cung cấp                                                                                                                                            |
| maintenanceSchedule | String       | Không    | Lịch bảo trì (VD: "6 tháng/lần")                                                                                                                        |
| lastMaintenance     | String       | Không    | Lần bảo trì cuối (YYYY-MM-DD)                                                                                                                           |
| nextMaintenance     | String       | Không    | Lần bảo trì tiếp theo (YYYY-MM-DD)                                                                                                                      |
| notes               | String       | Không    | Ghi chú                                                                                                                                                 |
| **createdAt**       | Date         | Có       | Ngày tạo thiết bị                                                                                                                                       |
| **updatedAt**       | Date         | Có       | Ngày cập nhật cuối                                                                                                                                      |
| **createdBy**       | String       | Có       | **FK → users.uid** (UID người tạo)                                                                                                                      |
| createdByName       | String       | Không    | Tên người tạo                                                                                                                                           |
| updatedBy           | String       | Không    | **FK → users.uid** (UID người cập nhật)                                                                                                                 |
| updatedByName       | String       | Không    | Tên người cập nhật                                                                                                                                      |

---

## 3. BẢNG WAREHOUSE (Thiết bị trong kho)

**Collection:** `warehouse`

### Các trường dữ liệu:

| Tên trường          | Kiểu dữ liệu | Bắt buộc | Mô tả                                                          |
| ------------------- | ------------ | -------- | -------------------------------------------------------------- |
| **id**              | String       | Auto     | ID tự động (Firestore Document ID) - **PRIMARY KEY**           |
| **name**            | String       | Có       | Tên thiết bị                                                   |
| **code**            | String       | Có       | Mã thiết bị (duy nhất)                                         |
| **category**        | String       | Có       | Danh mục thiết bị                                              |
| **brand**           | String       | Có       | Thương hiệu                                                    |
| **model**           | String       | Có       | Model thiết bị                                                 |
| **serialNumber**    | String       | Có       | Số serial                                                      |
| **purchaseDate**    | String       | Có       | Ngày mua (YYYY-MM-DD)                                          |
| **warrantyExpiry**  | String       | Có       | Ngày hết hạn bảo hành (YYYY-MM-DD)                             |
| **status**          | Enum         | Có       | Trạng thái: "active" \| "maintenance" \| "broken" \| "retired" |
| **location**        | String       | Có       | Vị trí (thường là "Kho")                                       |
| **department**      | String       | Có       | Phòng ban                                                      |
| assignedTo          | String       | Không    | **FK → users.uid** (Người đang mượn thiết bị từ kho)           |
| description         | String       | Không    | Mô tả thiết bị                                                 |
| specifications      | String       | Không    | Thông số kỹ thuật                                              |
| purchasePrice       | Number       | Không    | Giá mua                                                        |
| supplier            | String       | Không    | Nhà cung cấp                                                   |
| maintenanceSchedule | String       | Không    | Lịch bảo trì                                                   |
| lastMaintenance     | String       | Không    | Lần bảo trì cuối                                               |
| nextMaintenance     | String       | Không    | Lần bảo trì tiếp theo                                          |
| notes               | String       | Không    | Ghi chú                                                        |
| **createdAt**       | Date         | Có       | Ngày tạo                                                       |
| **updatedAt**       | Date         | Có       | Ngày cập nhật cuối                                             |
| **createdBy**       | String       | Có       | **FK → users.uid** (UID người tạo)                             |
| createdByName       | String       | Không    | Tên người tạo                                                  |
| updatedBy           | String       | Không    | **FK → users.uid** (UID người cập nhật)                        |
| updatedByName       | String       | Không    | Tên người cập nhật                                             |

**Lưu ý:** Bảng `warehouse` có cấu trúc tương tự `devices` nhưng dùng để lưu thiết bị chưa được đưa vào sử dụng (còn trong kho).

---

## 4. BẢNG BORROW_RECORDS (Phiếu mượn trả)

**Collection:** `borrowRecords`

### Các trường dữ liệu:

| Tên trường         | Kiểu dữ liệu | Bắt buộc | Mô tả                                                |
| ------------------ | ------------ | -------- | ---------------------------------------------------- |
| **id**             | String       | Auto     | ID tự động (Firestore Document ID) - **PRIMARY KEY** |
| **deviceId**       | String       | Có       | **FK → devices.id** (ID thiết bị được mượn)          |
| deviceCode         | String       | Không    | Mã thiết bị (denormalized)                           |
| deviceName         | String       | Không    | Tên thiết bị (denormalized)                          |
| **borrowerId**     | String       | Có       | **FK → users.uid** (UID người mượn)                  |
| borrowerName       | String       | Không    | Tên người mượn (denormalized)                        |
| department         | String       | Không    | Phòng ban mượn                                       |
| purpose            | String       | Không    | Mục đích mượn                                        |
| **borrowDate**     | Date         | Có       | Thời điểm mượn                                       |
| expectedReturnDate | Date         | Không    | Dự kiến ngày trả                                     |
| returnDate         | Date         | Không    | Thực tế ngày trả                                     |
| **status**         | Enum         | Có       | Trạng thái: "borrowed" \| "returned" \| "overdue"    |
| notes              | String       | Không    | Ghi chú                                              |
| **createdAt**      | Date         | Có       | Ngày tạo phiếu                                       |
| **updatedAt**      | Date         | Có       | Ngày cập nhật cuối                                   |
| **createdBy**      | String       | Có       | **FK → users.uid** (UID người tạo phiếu)             |
| createdByName      | String       | Không    | Tên người tạo phiếu                                  |
| updatedBy          | String       | Không    | **FK → users.uid** (UID người cập nhật)              |
| updatedByName      | String       | Không    | Tên người cập nhật                                   |

---

## 5. BẢNG SETTINGS (Cài đặt hệ thống)

**Collection:** `settings`

### Các trường dữ liệu:

| Tên trường     | Kiểu dữ liệu | Bắt buộc | Mô tả                                   |
| -------------- | ------------ | -------- | --------------------------------------- |
| **id**         | String       | Fixed    | ID cố định: "global" - **PRIMARY KEY**  |
| actionPassword | String       | Không    | Mật khẩu cho các thao tác quan trọng    |
| updatedAt      | String       | Không    | Ngày cập nhật cuối                      |
| updatedBy      | String       | Không    | **FK → users.uid** (UID người cập nhật) |

**Lưu ý:** Bảng này chỉ có 1 document duy nhất với ID cố định là "global".

---

## MỐI QUAN HỆ GIỮA CÁC BẢNG

### 1. USERS ↔ DEVICES

- **Quan hệ:** One-to-Many
- **Chi tiết:**
  - Một người dùng có thể tạo nhiều thiết bị (`devices.createdBy` → `users.uid`)
  - Một người dùng có thể được giao nhiều thiết bị (`devices.assignedTo` → `users.uid`)
  - Một người dùng có thể cập nhật nhiều thiết bị (`devices.updatedBy` → `users.uid`)

### 2. USERS ↔ WAREHOUSE

- **Quan hệ:** One-to-Many
- **Chi tiết:**
  - Một người dùng có thể thêm nhiều thiết bị vào kho (`warehouse.createdBy` → `users.uid`)
  - Một người dùng có thể cập nhật nhiều thiết bị trong kho (`warehouse.updatedBy` → `users.uid`)

### 3. USERS ↔ BORROW_RECORDS

- **Quan hệ:** One-to-Many
- **Chi tiết:**
  - Một người dùng có thể mượn nhiều thiết bị (`borrowRecords.borrowerId` → `users.uid`)
  - Một người dùng có thể tạo nhiều phiếu mượn (`borrowRecords.createdBy` → `users.uid`)
  - Một người dùng có thể cập nhật nhiều phiếu mượn (`borrowRecords.updatedBy` → `users.uid`)

### 4. DEVICES ↔ BORROW_RECORDS

- **Quan hệ:** One-to-Many
- **Chi tiết:**
  - Một thiết bị có thể có nhiều phiếu mượn (`borrowRecords.deviceId` → `devices.id`)
  - **Lưu ý quan trọng:**
    - Thiết bị có thể được mượn từ cả collection `devices` hoặc `warehouse`
    - `deviceId` trong `borrowRecords` có thể tham chiếu đến `devices.id` HOẶC `warehouse.id` tùy thuộc vào thiết bị đang ở collection nào
    - Khi mượn từ warehouse, hệ thống KHÔNG tự động chuyển thiết bị sang devices, mà chỉ cập nhật `assignedTo` và `location` trong warehouse
    - Điều này có nghĩa là một thiết bị trong warehouse vẫn có thể có phiếu mượn, và `deviceId` sẽ tham chiếu đến `warehouse.id`

### 6. WAREHOUSE ↔ BORROW_RECORDS

- **Quan hệ:** One-to-Many (gián tiếp)
- **Chi tiết:**
  - Một thiết bị trong warehouse có thể có nhiều phiếu mượn (`borrowRecords.deviceId` → `warehouse.id`)
  - Khi mượn thiết bị từ warehouse, hệ thống cập nhật `assignedTo` trong warehouse để theo dõi người đang mượn

### 5. USERS ↔ SETTINGS

- **Quan hệ:** One-to-Many (về mặt logic)
- **Chi tiết:**
  - Nhiều người dùng có thể cập nhật cài đặt (`settings.updatedBy` → `users.uid`)

---

## CÁC CHỨC NĂNG ĐÃ TRIỂN KHAI

### 1. Quản lý Người dùng (USERS)

- ✅ Thêm, sửa, xóa nhân viên
- ✅ Xem danh sách nhân viên với phân trang
- ✅ Tìm kiếm và lọc nhân viên
- ✅ Quản lý vai trò và quyền hạn
- ✅ Tạo tài khoản đăng nhập Firebase Auth

### 2. Quản lý Thiết bị (DEVICES)

- ✅ Thêm, sửa, xóa thiết bị đang sử dụng
- ✅ Xem danh sách thiết bị với phân trang
- ✅ Tìm kiếm và lọc thiết bị
- ✅ Xem chi tiết thiết bị (Drawer)
- ✅ Quản lý trạng thái thiết bị
- ✅ Theo dõi lịch sử bảo trì
- ✅ Giao thiết bị cho người dùng (assignedTo)

### 3. Quản lý Kho (WAREHOUSE)

- ✅ Thêm thiết bị vào kho
- ✅ Xem danh sách thiết bị trong kho
- ✅ Sửa, xóa thiết bị trong kho
- ✅ Xem chi tiết thiết bị trong kho (Drawer)
- ✅ Chuyển thiết bị từ kho sang đang sử dụng
- ✅ Chuyển thiết bị từ đang sử dụng về kho (Nhập kho)
- ✅ Hiển thị người thêm thiết bị vào kho

### 4. Quản lý Mượn trả (BORROW_RECORDS)

- ✅ Tạo phiếu mượn thiết bị
- ✅ Xem danh sách phiếu mượn với phân trang
- ✅ Tìm kiếm và lọc phiếu mượn
- ✅ Xem chi tiết phiếu mượn (Drawer)
- ✅ Xác nhận trả thiết bị
- ✅ Theo dõi trạng thái mượn (borrowed/returned/overdue)
- ✅ Hiển thị thông tin người mượn trong chi tiết thiết bị
- ✅ Mượn thiết bị từ cả devices và warehouse

### 5. Báo cáo và Thống kê

- ✅ Báo cáo tổng quan
- ✅ Báo cáo tồn kho
- ✅ Báo cáo bảo trì
- ✅ Báo cáo hiệu suất
- ✅ Báo cáo người dùng

### 6. Cài đặt hệ thống (SETTINGS)

- ✅ Quản lý mật khẩu thao tác quan trọng
- ✅ Theo dõi người cập nhật cài đặt

---

## 2.5. CÁC MODULE ĐÃ THỰC HIỆN

### 2.5.0. Module Dashboard (Trang chủ)

Module trang chủ cung cấp giao diện tổng quan với các thống kê nhanh về hệ thống. Hiển thị số lượng thiết bị theo từng trạng thái (tổng thiết bị, đang hoạt động, cần bảo trì, đã hỏng, thanh lý), số thiết bị mới trong tháng, tổng nhân viên và số phòng ban. Module tự động tải và cập nhật số liệu realtime từ Firestore, giúp quản lý nhanh chóng nắm bắt tình hình tổng thể của hệ thống. Giao diện được thiết kế với các card thống kê trực quan, màu sắc phân biệt theo từng loại thông tin.

### 2.5.1. Module đăng nhập người dùng

Module này cung cấp chức năng đăng nhập bằng Firebase Authentication. Người dùng đăng nhập bằng email và mật khẩu đã được quản trị viên tạo sẵn. Hệ thống đảm bảo quản lý phiên đăng nhập an toàn và bảo vệ thông tin người dùng. Hệ thống hỗ trợ phân quyền theo vai trò (director, deputy_director, manager, staff, technician), cho phép kiểm soát truy cập các chức năng theo từng cấp độ. Dữ liệu người dùng được lưu trữ trong Firestore với mã hóa an toàn, đảm bảo tính bảo mật cao. Lưu ý: Hệ thống không có chức năng đăng ký công khai, tài khoản chỉ được tạo bởi quản trị viên thông qua module quản lý người dùng.

### 2.5.2. Module quản lý người dùng và nhân viên

Cho phép quản trị viên quản lý toàn bộ thông tin nhân viên trong hệ thống. Module hỗ trợ thêm, sửa, xóa nhân viên với form nhập liệu 3 bước (thông tin cơ bản, thông tin công việc, thông tin bổ sung). Hệ thống cung cấp tính năng tìm kiếm và lọc nhân viên theo nhiều tiêu chí (tên, mã nhân viên, email, phòng ban, trạng thái, vai trò). Dữ liệu được hiển thị trực quan với phân trang, hỗ trợ xem chi tiết từng nhân viên và quản lý trạng thái (active, inactive, suspended). Module tự động tạo tài khoản Firebase Auth khi thêm nhân viên mới (có thể tùy chọn tạo mật khẩu) và đồng bộ dữ liệu realtime từ Firestore. Module yêu cầu mật khẩu hành động khi thực hiện các thao tác quan trọng như thêm hoặc xóa nhân viên.

### 2.5.3. Module quản lý thiết bị đang sử dụng

Hiển thị danh sách thiết bị đang được sử dụng tại các phòng ban với đầy đủ thông tin (tên, mã, danh mục, thương hiệu, model, trạng thái, vị trí). Người dùng có thể xem chi tiết thiết bị bao gồm thông số kỹ thuật, lịch sử bảo trì, người được giao và thông tin mua sắm. Hệ thống hỗ trợ thêm, sửa, xóa thiết bị với form validation đầy đủ. Module cung cấp tính năng tìm kiếm và lọc theo danh mục, trạng thái, phòng ban. Quản lý trạng thái thiết bị (active, maintenance, broken, retired) với giao diện màu sắc trực quan. Module hỗ trợ mượn và trả thiết bị trực tiếp từ trang chi tiết. Hệ thống kết nối dữ liệu trực tiếp từ Firestore collection `devices`, đồng bộ theo thời gian thực và tự động cập nhật thông tin người tạo/cập nhật. Module còn cung cấp trang báo cáo thiết bị riêng với thống kê theo trạng thái, danh mục, phòng ban và vị trí.

### 2.5.4. Module quản lý kho thiết bị

Quản lý thiết bị chưa được đưa vào sử dụng, còn lưu trữ trong kho. Module cho phép thêm thiết bị mới vào kho, xem danh sách thiết bị trong kho với phân trang và tìm kiếm. Hệ thống hỗ trợ chuyển thiết bị từ kho sang đang sử dụng (collection `devices`) và ngược lại thông qua trang nhập kho (stock-entry) cho phép chuyển nhiều thiết bị cùng lúc. Người dùng có thể sửa, xóa thiết bị trong kho và xem chi tiết đầy đủ thông tin. Module hiển thị người thêm thiết bị vào kho và theo dõi lịch sử thay đổi. Dữ liệu được lưu trữ trong Firestore collection `warehouse` với cấu trúc tương tự collection `devices`, đảm bảo tính nhất quán trong quản lý.

### 2.5.5. Module quản lý mượn trả thiết bị

Cho phép tạo phiếu mượn thiết bị từ cả collection `devices` và `warehouse`. Module cung cấp hai giao diện: một cho quản lý (xem tất cả phiếu mượn) và một cho nhân viên (trang mượn-trả thiết bị). Người dùng có thể xem danh sách phiếu mượn với phân trang, tìm kiếm và lọc theo nhiều tiêu chí (người mượn, thiết bị, trạng thái, ngày mượn). Module hỗ trợ xác nhận trả thiết bị và tự động cập nhật trạng thái (borrowed, returned, overdue). Hệ thống theo dõi thông tin chi tiết mỗi phiếu mượn bao gồm người mượn, thiết bị, mục đích, ngày mượn, ngày trả dự kiến và thực tế. Module hiển thị thông tin người mượn trong chi tiết thiết bị, giúp quản lý dễ dàng theo dõi thiết bị đang được mượn bởi ai. Dữ liệu được lưu trong Firestore collection `borrowRecords` với denormalization để tối ưu hiệu suất truy vấn.

### 2.5.6. Module báo cáo và thống kê

Cung cấp các báo cáo tổng quan về hệ thống với nhiều trang báo cáo chi tiết: báo cáo tổng hợp (summary) hiển thị tổng quan toàn hệ thống, báo cáo tồn kho (inventory) thống kê thiết bị trong kho và đang sử dụng, báo cáo bảo trì (maintenance) theo dõi thiết bị cần bảo trì và quá hạn bảo hành, báo cáo hiệu suất (performance) phân tích hiệu quả sử dụng thiết bị, và báo cáo người dùng (users) thống kê nhân viên. Module tính toán và hiển thị số liệu thống kê realtime từ dữ liệu hiện có trong các collection (không có bảng báo cáo riêng). Hệ thống hỗ trợ xem số lượng thiết bị theo trạng thái, danh mục, phòng ban, vị trí. Dữ liệu được trình bày trực quan với biểu đồ (Bar, Pie, Doughnut, Line) và bảng số liệu, giúp quản lý dễ dàng đánh giá tình hình sử dụng thiết bị và đưa ra quyết định.

### 2.5.7. Module quản trị hệ thống (Admin)

Dành cho người quản trị (director, deputy_director), cho phép quản lý mật khẩu cho các thao tác quan trọng (xóa, chuyển đổi thiết bị) thông qua trang quản lý mật khẩu. Module theo dõi người cập nhật cài đặt và lưu trữ thông tin trong Firestore collection `settings` với document ID cố định "global". Hệ thống cung cấp giao diện quản lý tập trung, cho phép cấu hình các tham số hệ thống và bảo mật. Dữ liệu cài đặt được cập nhật realtime và áp dụng ngay lập tức cho toàn bộ hệ thống. Module hỗ trợ đặt lại mật khẩu hành động khi cần thiết.

### 2.5.8. Module quản lý bảo trì thiết bị

Module chuyên biệt để quản lý thiết bị cần bảo trì và đã hỏng. Hiển thị danh sách thiết bị có trạng thái "maintenance" hoặc "broken" từ collection `devices`. Module cung cấp tính năng tìm kiếm, lọc theo danh mục và trạng thái. Người dùng có thể chỉnh sửa thông tin bảo trì trực tiếp từ danh sách, cập nhật lịch bảo trì, ngày bảo trì cuối, ngày bảo trì tiếp theo và thay đổi trạng thái thiết bị. Module giúp kỹ thuật viên dễ dàng theo dõi và quản lý công việc bảo trì thiết bị một cách hiệu quả.

---

## 3. PHÂN TÍCH HỆ THỐNG

### 3.1. Phân tích hệ thống

#### 3.1.1. Danh sách các Actor

**Bảng 3.1: Bảng danh sách các Actor**

| STT | Tên Actor                                | Ý nghĩa                                                                                                                                                                                                                                                         |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Lãnh đạo (Director, Deputy Director)** | Người đứng đầu tổ chức và người phụ trách, có quyền cao nhất trong hệ thống. Có toàn quyền quản lý: thiết bị, kho, bảo trì, người dùng, phòng ban, thông báo, quyền hạn, mượn/trả thiết bị, và quản lý mật khẩu hành động cho các thao tác quan trọng.          |
| 2   | **Quản lý (Manager)**                    | Người quản lý các phòng ban, có quyền quản lý rộng. Có thể quản lý thiết bị, kho, bảo trì, người dùng, phòng ban, thông báo, quyền hạn và mượn/trả thiết bị. Không có quyền quản lý mật khẩu hành động.                                                         |
| 3   | **Nhân viên (Staff)**                    | Nhân viên thông thường trong tổ chức, có quyền hạn cơ bản. Có thể xem dashboard, báo cáo, danh sách thiết bị, quản lý thiết bị (giới hạn) và mượn/trả thiết bị. Không có quyền quản lý kho, bảo trì, người dùng, phòng ban, thông báo và quyền hạn.             |
| 4   | **Kỹ thuật viên (Technician)**           | Nhân viên chuyên trách về bảo trì và sửa chữa thiết bị. Có thể quản lý thiết bị, kho và bảo trì thiết bị (chức năng chính). Có thể xem dashboard, báo cáo và thống kê. Không có quyền quản lý người dùng, phòng ban, thông báo, quyền hạn và mượn/trả thiết bị. |

**Ghi chú:**

- Tất cả các Actor đều có quyền đăng nhập vào hệ thống bằng email và mật khẩu được quản trị viên cấp.
- Quyền hạn được phân cấp rõ ràng theo vai trò, đảm bảo tính bảo mật và kiểm soát truy cập.
- Director và Deputy Director có quyền quản lý mật khẩu hành động cho các thao tác quan trọng (xóa, chuyển đổi thiết bị).

#### 3.1.2. Danh sách các chức năng

**Bảng 3.2: Danh sách các chức năng**

| STT | Tên chức năng                          | Mô tả chức năng                                                                                                                                                                | Actor                            |
| --- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1   | **Đăng nhập hệ thống**                 | Người dùng đăng nhập vào hệ thống bằng email và mật khẩu đã được quản trị viên cấp. Hệ thống xác thực và phân quyền tự động theo vai trò.                                      | Tất cả Actor                     |
| 2   | **Xem Dashboard**                      | Hiển thị trang chủ với các thống kê tổng quan: tổng thiết bị, thiết bị đang hoạt động, cần bảo trì, đã hỏng, thanh lý, thiết bị mới trong tháng, tổng nhân viên, số phòng ban. | Tất cả Actor                     |
| 3   | **Quản lý người dùng - Thêm**          | Thêm nhân viên mới vào hệ thống với form 3 bước (thông tin cơ bản, công việc, bổ sung). Tự động tạo tài khoản Firebase Auth. Yêu cầu mật khẩu hành động.                       | Lãnh đạo, Quản lý                |
| 4   | **Quản lý người dùng - Sửa**           | Chỉnh sửa thông tin nhân viên (mã NV, họ tên, email, phòng ban, chức vụ, trạng thái, vai trò, v.v.).                                                                           | Lãnh đạo, Quản lý                |
| 5   | **Quản lý người dùng - Xóa**           | Xóa nhân viên khỏi hệ thống. Yêu cầu mật khẩu hành động.                                                                                                                       | Lãnh đạo, Quản lý                |
| 6   | **Quản lý người dùng - Xem danh sách** | Xem danh sách tất cả nhân viên với phân trang, tìm kiếm và lọc theo phòng ban, trạng thái, vai trò.                                                                            | Lãnh đạo, Quản lý                |
| 7   | **Quản lý người dùng - Xem chi tiết**  | Xem thông tin chi tiết đầy đủ của một nhân viên.                                                                                                                               | Lãnh đạo, Quản lý                |
| 8   | **Quản lý thiết bị - Thêm**            | Thêm thiết bị mới đang sử dụng với form 3 bước (thông tin cơ bản, chi tiết, bảo trì).                                                                                          | Tất cả Actor                     |
| 9   | **Quản lý thiết bị - Sửa**             | Chỉnh sửa thông tin thiết bị (tên, mã, danh mục, thương hiệu, model, trạng thái, vị trí, v.v.).                                                                                | Tất cả Actor                     |
| 10  | **Quản lý thiết bị - Xóa**             | Xóa thiết bị khỏi hệ thống. Yêu cầu mật khẩu hành động.                                                                                                                        | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 11  | **Quản lý thiết bị - Xem danh sách**   | Xem danh sách thiết bị với phân trang, tìm kiếm và lọc theo danh mục, trạng thái, phòng ban.                                                                                   | Tất cả Actor                     |
| 12  | **Quản lý thiết bị - Xem chi tiết**    | Xem thông tin chi tiết thiết bị bao gồm thông số kỹ thuật, lịch sử bảo trì, người được giao.                                                                                   | Tất cả Actor                     |
| 13  | **Quản lý kho - Thêm**                 | Thêm thiết bị mới vào kho.                                                                                                                                                     | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 14  | **Quản lý kho - Sửa**                  | Chỉnh sửa thông tin thiết bị trong kho.                                                                                                                                        | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 15  | **Quản lý kho - Xóa**                  | Xóa thiết bị khỏi kho. Yêu cầu mật khẩu hành động.                                                                                                                             | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 16  | **Quản lý kho - Xem danh sách**        | Xem danh sách thiết bị trong kho với phân trang và tìm kiếm.                                                                                                                   | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 17  | **Quản lý kho - Chuyển sang sử dụng**  | Chuyển thiết bị từ kho sang collection đang sử dụng (devices).                                                                                                                 | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 18  | **Quản lý kho - Nhập kho**             | Chuyển thiết bị từ đang sử dụng về kho (stock-entry), có thể chuyển nhiều thiết bị cùng lúc.                                                                                   | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 19  | **Quản lý bảo trì - Xem danh sách**    | Xem danh sách thiết bị cần bảo trì (status = "maintenance" hoặc "broken").                                                                                                     | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 20  | **Quản lý bảo trì - Cập nhật**         | Cập nhật thông tin bảo trì: lịch bảo trì, ngày bảo trì cuối, ngày bảo trì tiếp theo, trạng thái thiết bị.                                                                      | Lãnh đạo, Quản lý, Kỹ thuật viên |
| 21  | **Mượn thiết bị**                      | Tạo phiếu mượn thiết bị từ collection devices hoặc warehouse. Ghi nhận người mượn, mục đích, ngày mượn, ngày trả dự kiến.                                                      | Lãnh đạo, Quản lý, Nhân viên     |
| 22  | **Trả thiết bị**                       | Xác nhận trả thiết bị, cập nhật ngày trả thực tế và trạng thái phiếu mượn.                                                                                                     | Lãnh đạo, Quản lý, Nhân viên     |
| 23  | **Xem phiếu mượn**                     | Xem danh sách phiếu mượn với phân trang, tìm kiếm và lọc theo người mượn, thiết bị, trạng thái, ngày mượn.                                                                     | Tất cả Actor                     |
| 24  | **Báo cáo tổng hợp**                   | Xem báo cáo tổng quan toàn hệ thống với biểu đồ và số liệu thống kê.                                                                                                           | Tất cả Actor                     |
| 25  | **Báo cáo tồn kho**                    | Xem báo cáo thống kê thiết bị trong kho và đang sử dụng theo danh mục, trạng thái.                                                                                             | Tất cả Actor                     |
| 26  | **Báo cáo bảo trì**                    | Xem báo cáo thiết bị cần bảo trì, quá hạn bảo hành với biểu đồ phân tích.                                                                                                      | Tất cả Actor                     |
| 27  | **Báo cáo hiệu suất**                  | Xem báo cáo phân tích hiệu quả sử dụng thiết bị, thống kê mượn trả.                                                                                                            | Tất cả Actor                     |
| 28  | **Báo cáo người dùng**                 | Xem báo cáo thống kê nhân viên theo phòng ban, trạng thái, vai trò.                                                                                                            | Tất cả Actor                     |
| 29  | **Quản lý mật khẩu hành động**         | Thiết lập và quản lý mật khẩu cho các thao tác quan trọng (xóa, chuyển đổi thiết bị).                                                                                          | Lãnh đạo                         |
| 30  | **Quản lý phòng ban**                  | Quản lý danh sách phòng ban trong tổ chức.                                                                                                                                     | Lãnh đạo, Quản lý                |
| 31  | **Quản lý thông báo**                  | Tạo, xem, quản lý các thông báo và cảnh báo trong hệ thống.                                                                                                                    | Lãnh đạo, Quản lý                |

**Ghi chú:**

- Các chức năng yêu cầu "mật khẩu hành động" chỉ có thể thực hiện sau khi nhập đúng mật khẩu đã được Lãnh đạo thiết lập.
- Một số chức năng có quyền hạn khác nhau tùy theo Actor, được phân cấp rõ ràng trong hệ thống.
- Tất cả các chức năng đều có validation và kiểm tra quyền truy cập trước khi thực hiện.

### 3.3. Đặc tả UseCase

**Bảng 3.3: Tổng quan Use Case theo module**

| Module                | Use Case ID | Tên Use Case                        | Actor chính                      |
| --------------------- | ----------- | ----------------------------------- | -------------------------------- |
| Đăng nhập & Dashboard | UC01, UC02  | Đăng nhập hệ thống; Xem Dashboard   | Tất cả Actor                     |
| Quản lý nhân viên     | UC03        | Thêm nhân viên                      | Lãnh đạo, Quản lý                |
| Quản lý thiết bị      | UC08        | Thêm thiết bị vào kho               | Lãnh đạo, Quản lý, Kỹ thuật viên |
| Quản lý thiết bị      | UC17        | Chuyển thiết bị từ kho sang sử dụng | Tất cả Actor                     |
| Bảo trì thiết bị      | UC20        | Cập nhật lịch sử bảo trì            | Lãnh đạo, Quản lý, Kỹ thuật viên |
| Mượn trả thiết bị     | UC21, UC22  | Mượn thiết bị; Trả thiết bị         | Lãnh đạo, Quản lý, Nhân viên     |
| Báo cáo thống kê      | UC24        | Xem báo cáo tổng hợp                | Tất cả Actor                     |
| Mật khẩu hành động    | UC29        | Quản lý mật khẩu hành động          | Lãnh đạo                         |
| Thông báo             | UC31        | Quản lý thông báo nội bộ            | Lãnh đạo, Quản lý                |

#### 3.3.1. UC01: Đăng nhập hệ thống

**Use Case ID:** UC01

**Tên Use Case:** Đăng nhập hệ thống

**Mô tả:** Người dùng đăng nhập bằng email và mật khẩu đã được quản trị viên cấp; hệ thống xác thực và gán quyền theo vai trò.

**Tác nhân (Actor):** Tất cả Actor (Lãnh đạo, Quản lý, Nhân viên, Kỹ thuật viên)

**Điều kiện tiên quyết:**

- Người dùng đã có tài khoản hợp lệ trong Firebase Authentication và bản ghi tương ứng trong collection `users`.
- Hệ thống mạng và dịch vụ Firebase đang hoạt động.

**Điều kiện sau:**

- Phiên đăng nhập được khởi tạo (Firebase Auth + session phía client).
- Giao diện điều hướng về Dashboard kèm theo bộ quyền tương ứng vai trò người dùng.

**Luồng cơ bản:**

1. Người dùng truy cập trang đăng nhập.
2. Hệ thống hiển thị form nhập email và mật khẩu.
3. Người dùng nhập thông tin và nhấn “Đăng nhập”.
4. Firebase Authentication xác thực thông tin.
5. Hệ thống truy vấn collection `users` lấy thông tin vai trò.
6. Hệ thống khởi tạo session và lưu thông tin người dùng trong state.
7. Hệ thống điều hướng đến trang Dashboard.

**Luồng thay thế:**

- **3a. Email hoặc mật khẩu không đúng:** Hệ thống hiển thị thông báo lỗi và giữ người dùng ở trang đăng nhập.
- **4a. Tài khoản bị vô hiệu hóa:** Hệ thống thông báo “Tài khoản đã bị khóa, liên hệ quản trị viên”.

**Quy tắc nghiệp vụ:**

- Chỉ tài khoản được quản trị viên tạo mới có thể đăng nhập.
- Vai trò được lấy từ trường `role` trong collection `users` và không thể chỉnh sửa trong lúc đăng nhập.
- Mỗi lần đăng nhập được ghi lại trong audit log (module nhật ký hoạt động).

**Yêu cầu phi chức năng:**

- Thời gian phản hồi xác thực < 3 giây trong điều kiện mạng ổn định.
- Thông tin chứng thực gửi qua kết nối HTTPS.
- Hệ thống hiển thị thông báo lỗi thân thiện và không tiết lộ chi tiết kỹ thuật.

---

#### 3.3.2. UC02: Xem Dashboard

**Use Case ID:** UC02

**Tên Use Case:** Xem Dashboard

**Mô tả:** Người dùng xem bảng điều khiển tổng quan với thống kê thiết bị, nhân sự, phòng ban và cảnh báo.

**Tác nhân (Actor):** Tất cả Actor

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập thành công.

**Điều kiện sau:**

- Dashboard được hiển thị với số liệu mới nhất.
- Các phân hệ thống kê được cache tạm thời trên client cho phiên hiện tại.

**Luồng cơ bản:**

1. Người dùng truy cập trang Dashboard.
2. Hệ thống gọi dịch vụ tổng hợp dữ liệu từ `devices`, `warehouse`, `users`, `departments`, `borrowRecords`.
3. Hệ thống tính toán các chỉ số (tổng số thiết bị, trạng thái, thiết bị mới, tổng nhân viên, tổng phòng ban, cảnh báo bảo trì).
4. Hệ thống hiển thị card, biểu đồ và danh sách cảnh báo.

**Luồng thay thế:**

- **2a. Lỗi tải dữ liệu:** Hệ thống hiển thị thông báo lỗi và cho phép người dùng thử tải lại.

**Quy tắc nghiệp vụ:**

- Dữ liệu thống kê phản ánh thời điểm hiện tại (realtime hoặc gần realtime).
- Người dùng chỉ xem được thông tin thuộc phạm vi tổ chức; không lọc theo phòng ban nếu không có quyền.

**Yêu cầu phi chức năng:**

- Thời gian tải Dashboard < 5 giây với 10.000 bản ghi thiết bị.
- Các biểu đồ responsive trên thiết bị di động.
- Dữ liệu hiển thị phải được làm mới tự động tối thiểu mỗi 60 giây.

---

#### 3.3.3. UC03: Thêm nhân viên

**Use Case ID:** UC03

**Tên Use Case:** Thêm nhân viên

**Mô tả:** Người có quyền nhập thông tin và tạo mới hồ sơ nhân viên, đồng thời tạo tài khoản đăng nhập tương ứng.

**Tác nhân (Actor):** Lãnh đạo, Quản lý

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập.
- Quyền `canManageUsers = true`.
- Mật khẩu hành động đã được thiết lập trong hệ thống.

**Điều kiện sau:**

- Bản ghi nhân viên mới được lưu trong collection `users`.
- Nếu cung cấp mật khẩu, tài khoản Firebase Auth được khởi tạo và liên kết với hồ sơ.
- Lịch sử thao tác ghi nhận sự kiện tạo nhân viên.

**Luồng cơ bản:**

1. Người dùng mở trang “Thêm nhân viên”.
2. Hệ thống hiển thị wizard 3 bước (Thông tin cơ bản → Công việc → Bổ sung).
3. Người dùng nhập thông tin từng bước, chuyển bước kế tiếp.
4. Ở bước hoàn tất, hệ thống yêu cầu nhập mật khẩu hành động.
5. Người dùng cung cấp mật khẩu hành động và xác nhận lưu.
6. Hệ thống xác thực mật khẩu hành động.
7. Hệ thống tạo tài khoản Firebase Auth (nếu khai báo thông tin truy cập).
8. Hệ thống lưu hồ sơ vào `users`, gắn metadata `createdBy`.
9. Hệ thống thông báo thành công và chuyển đến danh sách nhân viên.

**Luồng thay thế:**

- **3a. Thiếu/ sai dữ liệu:** Hệ thống hiển thị lỗi và yêu cầu chỉnh sửa trước khi tiếp tục.
- **4a. Từ chối nhập mật khẩu hành động:** Người dùng hủy thao tác, hệ thống không lưu dữ liệu.
- **6a. Mật khẩu hành động sai:** Hệ thống hiển thị cảnh báo và cho phép nhập lại tối đa 3 lần.
- **7a. Email đã tồn tại:** Hệ thống báo lỗi và quay về bước thông tin cơ bản.

**Quy tắc nghiệp vụ:**

- Mã nhân viên (`employeeId`) phải duy nhất trong tổ chức.
- Vai trò được chọn phải nằm trong danh sách `UserRole` đã định nghĩa.
- Không được phép tạo nhân viên ở trạng thái “inactive” nếu chưa có ngày bắt đầu làm việc.

**Yêu cầu phi chức năng:**

- Thao tác lưu hoàn tất trong < 5 giây.
- Form hỗ trợ lưu nháp cục bộ khi trình duyệt bị làm mới.
- Validation hiển thị rõ ràng, hỗ trợ trợ năng (ARIA) cho người dùng đặc biệt.

---

#### 3.3.4. UC08: Thêm thiết bị vào kho

**Use Case ID:** UC08

**Tên Use Case:** Thêm thiết bị vào kho

**Mô tả:** Người dùng tạo hồ sơ thiết bị mới và lưu vào kho (warehouse), bao gồm thông tin kỹ thuật, giá mua, nhà cung cấp và thông tin bảo trì ban đầu.

**Tác nhân (Actor):** Lãnh đạo, Quản lý, Kỹ thuật viên

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập.
- Người dùng có quyền `canManageWarehouse`.

**Điều kiện sau:**

- Thiết bị mới được lưu trong collection `warehouse`.
- Vị trí (`location`) mặc định được đặt là "Kho".
- Trạng thái (`status`) có thể là `active`, `maintenance`, `broken`, hoặc `retired` (tùy theo tình trạng thiết bị khi nhập kho).
- Số liệu thống kê liên quan (Dashboard, báo cáo) được cập nhật ở lần đồng bộ kế tiếp.

**Luồng cơ bản:**

1. Người dùng mở trang "Thêm thiết bị vào kho".
2. Hệ thống hiển thị wizard 3 bước (Thông tin cơ bản → Chi tiết → Bảo trì & thông tin kho).
3. Người dùng nhập dữ liệu và chuyển bước:
   - Bước 1: Thông tin cơ bản (tên, mã, danh mục, thương hiệu, model, serial number).
   - Bước 2: Thông tin chi tiết (mô tả, thông số kỹ thuật, giá mua, nhà cung cấp, ngày mua, hết hạn bảo hành).
   - Bước 3: Thông tin bảo trì (lịch bảo trì, ngày bảo trì cuối, ngày bảo trì tiếp theo, ghi chú).
4. Hệ thống kiểm tra tính duy nhất của mã thiết bị trong cả `warehouse` và `devices`.
5. Người dùng xác nhận lưu.
6. Hệ thống tự động gán `location = "Kho"`.
7. Hệ thống ghi thiết bị vào collection `warehouse` với trạng thái đã chọn (thường là `active` cho thiết bị mới), kèm metadata `createdBy`, `createdByName`.
8. Hệ thống hiển thị thông báo thành công và điều hướng về danh sách thiết bị trong kho.

**Luồng thay thế:**

- **3a. Dữ liệu thiếu:** Hệ thống đánh dấu trường lỗi và yêu cầu bổ sung, không cho phép chuyển bước tiếp theo.
- **4a. Trùng mã thiết bị:** Hệ thống hiển thị cảnh báo "Mã thiết bị đã tồn tại trong kho hoặc đang sử dụng" và yêu cầu nhập mã khác.

**Quy tắc nghiệp vụ:**

- Mỗi thiết bị phải thuộc một danh mục (`category`) hợp lệ.
- Mã thiết bị (`code`) phải duy nhất trong toàn hệ thống (cả `warehouse` và `devices`).
- Thiết bị mới thêm vào kho luôn có vị trí `location = "Kho"`.
- Trạng thái (`status`) của thiết bị trong kho sử dụng các giá trị: `active` (đang hoạt động), `maintenance` (cần bảo trì), `broken` (đã hỏng), hoặc `retired` (thanh lý). Thiết bị mới thường có trạng thái `active`.
- Sau khi thêm vào kho, thiết bị có thể được chuyển sang sử dụng thông qua chức năng "Chuyển thiết bị từ kho sang sử dụng" (UC17).

**Yêu cầu phi chức năng:**

- Form hỗ trợ upload ảnh thiết bị tối đa 5 MB/ảnh.
- Thao tác lưu phải đảm bảo idempotent (tránh tạo trùng khi người dùng double-click).
- Toàn bộ thao tác tuân thủ chuẩn truy cập WCAG 2.1 AA.
- Hệ thống phải kiểm tra mã thiết bị trong cả hai collection (`warehouse` và `devices`) để đảm bảo tính duy nhất.

---

#### 3.3.5. UC17: Chuyển thiết bị từ kho sang sử dụng

**Use Case ID:** UC17

**Tên Use Case:** Chuyển thiết bị từ kho sang sử dụng

**Mô tả:** Người có quyền chuyển thiết bị từ collection `warehouse` sang collection `devices`, cập nhật trạng thái và thông tin sử dụng. Chức năng này nằm trong module "Quản lý thiết bị".

**Tác nhân (Actor):** Tất cả Actor (Lãnh đạo, Quản lý, Nhân viên, Kỹ thuật viên)

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập và có quyền `canManageDevices`.
- Thiết bị đang tồn tại trong collection `warehouse`.

**Điều kiện sau:**

- Thiết bị được ghi nhận trong collection `devices` với đầy đủ thông tin sử dụng.
- Bản ghi tương ứng trong `warehouse` bị xóa (thiết bị được chuyển hoàn toàn sang `devices`).
- Lịch sử thao tác ghi lại sự kiện chuyển kho.

**Luồng cơ bản:**

1. Người dùng truy cập trang "Quản lý thiết bị".
2. Người dùng chọn nút "Thêm từ kho" hoặc tương tự để xem danh sách thiết bị trong kho.
3. Hệ thống hiển thị danh sách thiết bị trong `warehouse`.
4. Người dùng chọn thiết bị cần chuyển sang sử dụng.
5. Hệ thống hiển thị dialog chọn phòng ban để gán thiết bị.
6. Người dùng chọn phòng ban và xác nhận "Chuyển sang sử dụng".
7. Hệ thống validate dữ liệu và kiểm tra thiết bị còn tồn tại trong kho.
8. Hệ thống tạo bản ghi mới trong `devices`, sao chép thông tin từ `warehouse` và cập nhật:
   - `location`: Thay đổi từ "Kho" sang vị trí sử dụng
   - `department`: Phòng ban đã chọn
   - `createdBy`, `createdByName`: Người thực hiện chuyển
9. Hệ thống xóa bản ghi trong `warehouse`.
10. Hệ thống thông báo thành công và cập nhật danh sách thiết bị.

**Luồng thay thế:**

- **5a. Thiết bị đang bị khóa kiểm kê:** Hệ thống hiển thị thông báo và không cho phép chuyển.
- **6a. Người dùng hủy thao tác:** Hệ thống đóng form, không thay đổi dữ liệu.

**Quy tắc nghiệp vụ:**

- Mỗi lần chuyển phải gắn với phòng ban hoặc kho sử dụng cụ thể.
- Nếu chuyển cho phòng ban, phải gán `assignedDepartmentId` và `location`.
- Các thông tin lịch bảo trì sẽ được khởi tạo theo chính sách mặc định cho thiết bị mới sử dụng.

**Yêu cầu phi chức năng:**

- Thời gian chuyển không vượt quá 5 giây kể cả khi kèm hình ảnh/thông tin chi tiết.
- Giao diện cho phép thao tác hàng loạt (bulk transfer) với tối đa 50 thiết bị/lần.
- Ghi log thao tác đầy đủ để phục vụ truy vết.

---

#### 3.3.6. UC20: Cập nhật lịch sử bảo trì

**Use Case ID:** UC20

**Tên Use Case:** Cập nhật lịch sử bảo trì thiết bị

**Mô tả:** Người có quyền bảo trì cập nhật thông tin bảo trì định kỳ hoặc khẩn cấp cho thiết bị, đồng thời điều chỉnh trạng thái thiết bị.

**Tác nhân (Actor):** Lãnh đạo, Quản lý, Kỹ thuật viên

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập và có quyền `canManageMaintenance`.
- Thiết bị tồn tại trong collection `devices` hoặc `warehouse`.
- Lịch trình bảo trì đối với thiết bị đã được thiết lập.

**Điều kiện sau:**

- Bản ghi bảo trì mới được thêm vào sub-collection `maintenanceHistory` (nếu có) hoặc trường `maintenanceRecords`.
- Thiết bị cập nhật lại các trường `lastMaintenance`, `nextMaintenance`, `status`.
- Hệ thống gửi thông báo (nếu cấu hình) đến các bên liên quan.

**Luồng cơ bản:**

1. Người dùng truy cập trang “Quản lý bảo trì”.
2. Người dùng chọn thiết bị cần cập nhật bảo trì.
3. Hệ thống hiển thị dialog nhập thông tin bảo trì (ngày thực hiện, hạng mục, kết quả, chi phí, ghi chú).
4. Người dùng nhập thông tin, chọn trạng thái thiết bị sau bảo trì và nhấn “Cập nhật”.
5. Hệ thống validate dữ liệu (ngày, nội dung bắt buộc).
6. Hệ thống ghi lịch sử bảo trì vào Firestore và cập nhật trạng thái thiết bị.
7. Hệ thống tính toán và cập nhật `nextMaintenance` dựa trên chu kỳ hoặc hướng dẫn kỹ thuật.
8. Hệ thống thông báo thành công, làm mới danh sách.

**Luồng thay thế:**

- **5a. Dữ liệu thiếu:** Hệ thống hiển thị lỗi và yêu cầu nhập lại.
- **7a. Không có lịch bảo trì tiếp theo:** Hệ thống yêu cầu người dùng xác định thủ công ngày bảo trì tiếp theo.

**Quy tắc nghiệp vụ:**

- Các hạng mục bảo trì phải tuân theo checklist chuẩn của từng loại thiết bị.
- Nếu trạng thái sau bảo trì là `broken` hoặc `retired`, hệ thống bắt buộc yêu cầu nguyên nhân và đề xuất xử lý.
- Một thiết bị không được ghi nhận hai lần bảo trì trong cùng một ngày nếu không có lý do đặc biệt (phải nhập ghi chú).

**Yêu cầu phi chức năng:**

- Hệ thống phải hỗ trợ đính kèm hình ảnh/tài liệu tối đa 10 MB mỗi lần cập nhật.
- Thời gian lưu và cập nhật bảo trì phải < 7 giây.
- Toàn bộ lịch sử bảo trì phải xem được offline (cache cục bộ) đối với ứng dụng mobile (nếu áp dụng).

---

#### 3.3.7. UC21: Mượn thiết bị

**Use Case ID:** UC21

**Tên Use Case:** Mượn thiết bị

**Mô tả:** Người dùng có thẩm quyền tạo phiếu mượn và gán thiết bị cho người mượn trong một khoảng thời gian xác định.

**Tác nhân (Actor):** Lãnh đạo, Quản lý, Nhân viên

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập và có quyền `canBorrowDevices`.
- Thiết bị được chọn ở trạng thái cho phép mượn (không bị khóa, không đang bảo trì).

**Điều kiện sau:**

- Bản ghi mượn thiết bị được lưu tại collection `borrowRecords` với trạng thái `borrowed`.
- Thiết bị được cập nhật trường `assignedTo`, `assignedToName`, `borrowStatus`.
- Lịch sử hoạt động ghi nhận thao tác mượn.

**Luồng cơ bản:**

1. Người dùng mở trang “Mượn thiết bị”.
2. Hệ thống hiển thị danh sách thiết bị khả dụng, hỗ trợ lọc/tìm kiếm.
3. Người dùng chọn thiết bị và điền thông tin mượn (mục đích, ngày mượn, ngày trả dự kiến).
4. Người dùng xác nhận tạo phiếu.
5. Hệ thống kiểm tra trạng thái thiết bị và validate dữ liệu.
6. Hệ thống tạo record trong `borrowRecords`.
7. Hệ thống cập nhật thiết bị tương ứng (`assignedTo`, `status`, `location` nếu lấy từ kho).
8. Hệ thống thông báo thành công và điều hướng về danh sách phiếu mượn.

**Luồng thay thế:**

- **3a. Thiết bị thuộc kho (`warehouse`):** Hệ thống tự động chuyển trạng thái sang `in_use` và cập nhật `location` theo phòng ban người mượn.
- **5a. Thiết bị đang được mượn:** Hệ thống từ chối, hiển thị thông báo và yêu cầu chọn thiết bị khác.
- **5b. Người dùng hủy thao tác:** Hệ thống đóng form, không lưu dữ liệu.

**Quy tắc nghiệp vụ:**

- Mỗi người dùng không được mượn quá số thiết bị tối đa do lãnh đạo cấu hình (trường `maxBorrowDevices` nếu có).
- Thời hạn mượn mặc định tối đa 30 ngày, vượt quá phải có phê duyệt của lãnh đạo.
- Các trường thông tin bắt buộc: thiết bị, mục đích, ngày trả dự kiến.

**Yêu cầu phi chức năng:**

- Hỗ trợ tạo phiếu mượn trên thiết bị di động.
- Đảm bảo thao tác tạo phiếu thành công kể cả khi danh sách thiết bị lớn (phân trang phía server).
- Ghi log thao tác để phục vụ truy vết sự cố.

---

#### 3.3.6. UC22: Trả thiết bị

**Use Case ID:** UC22

**Tên Use Case:** Trả thiết bị

**Mô tả:** Người dùng xác nhận hoàn trả thiết bị, cập nhật trạng thái phiếu mượn và giải phóng thiết bị khỏi người mượn.

**Tác nhân (Actor):** Lãnh đạo, Quản lý, Nhân viên

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập và có quyền `canBorrowDevices`.
- Phiếu mượn tồn tại và đang ở trạng thái `borrowed`.

**Điều kiện sau:**

- Phiếu mượn chuyển trạng thái thành `returned` hoặc `overdue`.
- Thiết bị được cập nhật trạng thái phù hợp (giải phóng `assignedTo` nếu cần).
- Lịch sử hoạt động ghi nhận thao tác trả thiết bị.

**Luồng cơ bản:**

1. Người dùng mở danh sách phiếu mượn.
2. Người dùng chọn phiếu trạng thái `borrowed` và nhấn “Trả thiết bị”.
3. Hệ thống hiển thị hộp thoại xác nhận.
4. Người dùng xác nhận trả.
5. Hệ thống cập nhật phiếu mượn (`returnDate`, `status`, `updatedBy`).
6. Hệ thống cập nhật thiết bị (`assignedTo`, `status`, `location` nếu trả về kho).
7. Hệ thống thông báo thành công và cập nhật danh sách phiếu mượn.

**Luồng thay thế:**

- **3a. Người dùng hủy:** Hệ thống đóng hộp thoại và không thay đổi dữ liệu.
- **6a. Thiết bị trả về kho:** Hệ thống tự động chuyển thiết bị sang collection `warehouse` hoặc cập nhật trạng thái `warehouse_transfer`.

**Quy tắc nghiệp vụ:**

- Nếu quá hạn (ngày trả thực tế > ngày dự kiến), hệ thống gắn cờ `overdue` và gửi thông báo cho lãnh đạo.
- Chỉ người tạo phiếu hoặc cấp trên trực tiếp mới được phép xác nhận trả.
- Khi trả thiết bị hỏng, phải ghi chú tình trạng vào phiếu trước khi hoàn tất.

**Yêu cầu phi chức năng:**

- Thao tác trả thiết bị phải an toàn trước việc reload trang (sử dụng optimistic update + rollback khi thất bại).
- Thông báo kết quả hiển thị trong vòng 2 giây sau khi cập nhật.
- Giao diện đáp ứng tốt trên màn hình nhỏ (≥ 360px).

---

#### 3.3.7. UC24: Xem báo cáo tổng hợp

**Use Case ID:** UC24

**Tên Use Case:** Xem báo cáo tổng hợp

**Mô tả:** Người dùng truy cập báo cáo tổng quan hệ thống, xem biểu đồ và xuất dữ liệu ra các định dạng PDF/Excel.

**Tác nhân (Actor):** Tất cả Actor

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập.

**Điều kiện sau:**

- Báo cáo hiển thị đầy đủ với dữ liệu cập nhật.
- File PDF/Excel được tải về nếu người dùng yêu cầu xuất.

**Luồng cơ bản:**

1. Người dùng mở trang “Báo cáo tổng hợp”.
2. Hệ thống tải dữ liệu từ `devices`, `warehouse`, `borrowRecords`, `users`.
3. Hệ thống tổng hợp và hiển thị card thống kê, biểu đồ.
4. Người dùng tương tác xem chi tiết, lọc theo thời gian/phòng ban (nếu có).
5. Người dùng chọn “Xuất Excel” hoặc “Xuất PDF”.
6. Hệ thống tạo file theo định dạng tương ứng và cung cấp liên kết tải xuống.

**Luồng thay thế:**

- **2a. Lỗi tải dữ liệu:** Hệ thống hiển thị thông báo và cho phép tải lại; các thành phần hiển thị trạng thái rỗng.
- **5a. Người dùng hủy xuất:** Hệ thống dừng quá trình tạo file.

**Quy tắc nghiệp vụ:**

- Chỉ thống kê dữ liệu trong phạm vi tổ chức; nếu muốn lọc theo phòng ban, người dùng phải có quyền phù hợp.
- Dữ liệu báo cáo sử dụng thông tin thời gian thực (không lưu trữ bảng báo cáo cố định).
- Khi xuất file, tên file phải bao gồm ngày giờ và loại báo cáo để dễ truy vết.

**Yêu cầu phi chức năng:**

- Việc tạo file PDF/Excel phải hoàn tất trong < 10 giây với 10.000 bản ghi.
- File xuất ra tương thích với Excel 2016 trở lên và đọc tốt trên thiết bị di động.
- Giao diện báo cáo hỗ trợ dark mode và in ấn.

---

#### 3.3.8. UC29: Quản lý mật khẩu hành động

**Use Case ID:** UC29

**Tên Use Case:** Quản lý mật khẩu hành động

**Mô tả:** Lãnh đạo thiết lập, thay đổi hoặc đặt lại mật khẩu bảo vệ các tác vụ quan trọng trong hệ thống.

**Tác nhân (Actor):** Lãnh đạo (Director, Deputy Director)

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập.
- Quyền `canManageActionPassword = true`.

**Điều kiện sau:**

- Mật khẩu hành động được lưu/ cập nhật tại collection `settings`.
- Thông tin cập nhật hiển thị tức thì trên giao diện và đồng bộ cho các tác vụ khác.

**Luồng cơ bản:**

1. Người dùng truy cập trang “Quản lý mật khẩu hành động”.
2. Hệ thống xác nhận quyền truy cập.
3. Hệ thống hiển thị trạng thái hiện tại và form thay đổi.
4. Người dùng chọn thao tác:
   - Thay đổi mật khẩu: nhập mật khẩu mới + xác nhận.
   - Đặt lại mật khẩu: yêu cầu xóa/ làm rỗng.
5. Hệ thống validate mật khẩu (độ dài, ký tự).
6. Hệ thống ghi nhận thay đổi vào `settings/global`.
7. Hệ thống hiển thị thông báo thành công.

**Luồng thay thế:**

- **2a. Không đủ quyền:** Hệ thống hiển thị cảnh báo và điều hướng về Dashboard.
- **5a. Mật khẩu mới không đạt chuẩn:** Hệ thống thông báo yêu cầu nhập lại (độ dài tối thiểu 6 ký tự, có chữ và số).
- **4a. Người dùng hủy thao tác:** Hệ thống giữ nguyên mật khẩu hiện tại.

**Quy tắc nghiệp vụ:**

- Chỉ Director/Deputy Director mới được phép thay đổi mật khẩu hành động.
- Mật khẩu phải được mã hóa trước khi lưu (Hash + Pepper) theo cấu hình bảo mật.
- Sau khi thay đổi mật khẩu, hệ thống gửi thông báo nội bộ cho các quản lý liên quan.

**Yêu cầu phi chức năng:**

- Thao tác thay đổi phải thực hiện qua kết nối HTTPS và không log mật khẩu dạng rõ.
- Form phải ẩn ký tự mật khẩu và hỗ trợ hiển thị/ẩn tùy chọn.
- Thời gian cập nhật tối đa 2 giây; nếu vượt, hệ thống phải rollback và thông báo lỗi.

---

#### 3.3.9. UC31: Quản lý thông báo nội bộ

**Use Case ID:** UC31

**Tên Use Case:** Quản lý thông báo nội bộ

**Mô tả:** Người quản trị tạo, chỉnh sửa, phân loại và gửi thông báo/h cảnh báo đến các nhóm người dùng trong hệ thống.

**Tác nhân (Actor):** Lãnh đạo, Quản lý

**Điều kiện tiên quyết:**

- Người dùng đã đăng nhập và có quyền `canManageNotifications`.
- Module thông báo đã cấu hình các kênh nhận (email, trong ứng dụng, SMS nếu có).

**Điều kiện sau:**

- Thông báo mới được lưu trong collection `notifications` với trạng thái, ưu tiên và phạm vi áp dụng.
- Người nhận phù hợp nhận được thông báo (qua real-time listener hoặc dịch vụ gửi thông báo).
- Lịch sử gửi thông báo được cập nhật.

**Luồng cơ bản:**

1. Người dùng truy cập trang “Quản lý thông báo”.
2. Người dùng chọn “Tạo thông báo mới”.
3. Hệ thống hiển thị form nhập tiêu đề, nội dung, loại thông báo, mức độ ưu tiên, nhóm nhận (toàn bộ, theo vai trò, theo phòng ban) và tùy chọn gửi kèm liên kết/tài liệu.
4. Người dùng nhập thông tin, chọn kênh gửi và nhấn “Gửi”.
5. Hệ thống validate dữ liệu (tiêu đề, nội dung, nhóm nhận).
6. Hệ thống lưu thông báo vào `notifications`, gắn metadata (`createdBy`, `createdAt`, `targets`).
7. Hệ thống kích hoạt dịch vụ gửi thông báo (Firebase Cloud Messaging/Email).
8. Hệ thống hiển thị thông báo thành công và cập nhật danh sách.

**Luồng thay thế:**

- **2a. Chỉnh sửa thông báo:** Người dùng chọn thông báo nháp hoặc chưa gửi, cập nhật nội dung rồi lưu.
- **3a. Chọn lịch gửi:** Người dùng đặt lịch gửi (schedule) → hệ thống lưu trạng thái `scheduled` và thiết lập trigger.
- **4a. Người dùng lưu nháp:** Hệ thống lưu trạng thái `draft`, chưa gửi thông báo.

**Quy tắc nghiệp vụ:**

- Thông báo mức độ “Khẩn” phải được duyệt bởi Director trước khi gửi (workflow phê duyệt).
- Thông báo phải hỗ trợ gắn tag module (devices, maintenance, borrow) để người nhận lọc được.
- Hệ thống lưu trữ tối thiểu 12 tháng lịch sử thông báo để tra cứu.

**Yêu cầu phi chức năng:**

- Giao diện tạo thông báo phải hỗ trợ soạn thảo rich text cơ bản.
- Thời gian gửi thông báo đồng thời đến 500 người dùng không vượt quá 15 giây.
- Hệ thống hỗ trợ đa ngôn ngữ cho nội dung thông báo nếu cấu hình.

---

## SƠ ĐỒ QUAN HỆ (ERD) - ĐẦY ĐỦ

```
                                    ╔══════════════════════════════════════════╗
                                    ║            USERS                          ║
                                    ║     (Người dùng/Nhân viên)                ║
                                    ╠══════════════════════════════════════════╣
                                    ║ 🔑 id (PK)                                ║
                                    ║ 🔑 uid (PK) ◄────────────────────────────┼────┐
                                    ║    employeeId                            ║     │
                                    ║    fullName                               ║     │
                                    ║    email                                  ║     │
                                    ║    phone                                  ║     │
                                    ║    department                             ║     │
                                    ║    position                               ║     │
                                    ║    startDate                              ║     │
                                    ║    status                                 ║     │
                                    ║    role                                   ║     │
                                    ║    avatar, address, skills, ...           ║     │
                                    ║    createdAt, updatedAt                   ║     │
                                    ╚══════════════════════════════════════════╝     │
                                            │                                       │
                                            │ 1                                     │ N
                                            │                                       │
                    ════════════════════════╪═══════════════════════════════════════╪═══════════════
                    │                       │                                       │
                    │                       │                                       │
                    ▼                       ▼                                       ▼              ▼
    ╔═══════════════════════════╗  ╔═══════════════════════════╗  ╔═══════════════════════════╗  ╔═══════════════╗
    ║      DEVICES               ║  ║      WAREHOUSE            ║  ║   BORROW_RECORDS          ║  ║   SETTINGS    ║
    ║  (Thiết bị đang sử dụng)   ║  ║  (Thiết bị trong kho)     ║  ║   (Phiếu mượn trả)        ║  ║  (Cài đặt)    ║
    ╠═══════════════════════════╣  ╠═══════════════════════════╣  ╠═══════════════════════════╣  ╠═══════════════╣
    ║ 🔑 id (PK)                 ║  ║ 🔑 id (PK)                ║  ║ 🔑 id (PK)                 ║  ║ 🔑 id="global"║
    ║    name                    ║  ║    name                   ║  ║ 🔗 deviceId (FK)           ║  ║    actionPass ║
    ║    code                    ║  ║    code                   ║  ║    → devices.id            ║  ║ 🔗 updatedBy   ║
    ║    category                ║  ║    category               ║  ║    → warehouse.id          ║  ║    → users.uid ║
    ║    brand                   ║  ║    brand                  ║  ║ 🔗 borrowerId (FK)         ║  ║    updatedAt   ║
    ║    model                   ║  ║    model                  ║  ║    → users.uid              ║  ╚═══════════════╝
    ║    serialNumber            ║  ║    serialNumber           ║  ║    borrowDate              ║
    ║    status                  ║  ║    status                 ║  ║    expectedReturnDate      ║
    ║    location                ║  ║    location               ║  ║    returnDate              ║
    ║    department              ║  ║    department             ║  ║    status                  ║
    ║ 🔗 assignedTo (FK)         ║  ║ 🔗 assignedTo (FK)       ║  ║    purpose                 ║
    ║    → users.uid             ║  ║    → users.uid            ║  ║    department              ║
    ║ 🔗 createdBy (FK)          ║  ║ 🔗 createdBy (FK)         ║  ║    notes                   ║
    ║    → users.uid            ║  ║    → users.uid            ║  ║ 🔗 createdBy (FK)          ║
    ║ 🔗 updatedBy (FK)         ║  ║ 🔗 updatedBy (FK)         ║  ║    → users.uid              ║
    ║    → users.uid            ║  ║    → users.uid            ║  ║ 🔗 createdBy (FK)          ║
    ║ 🔗 updatedBy (FK)         ║  ║    createdByName          ║  ║    → users.uid              ║
    ║    → users.uid            ║  ║    updatedByName          ║  ║ 🔗 updatedBy (FK)           ║
    ║    createdByName           ║  ║    purchaseDate           ║  ║    → users.uid              ║
    ║    updatedByName           ║  ║    warrantyExpiry         ║  ║    createdByName           ║
    ║    purchaseDate           ║  ║    purchasePrice            ║  ║    updatedByName            ║
    ║    warrantyExpiry         ║  ║    supplier                ║  ║ 📋 deviceCode (denorm)     ║
    ║    purchasePrice          ║  ║    maintenanceSchedule     ║  ║ 📋 deviceName (denorm)     ║
    ║    supplier               ║  ║    lastMaintenance         ║  ║ 📋 borrowerName(denorm)    ║
    ║    maintenanceSchedule    ║  ║    nextMaintenance         ║  ║    createdAt                ║
    ║    lastMaintenance        ║  ║    notes                   ║  ║    updatedAt                ║
    ║    nextMaintenance        ║  ║    createdAt               ║  ╚═══════════════════════════╝
    ║    notes                  ║  ║    updatedAt              ║
    ║    createdAt              ║  ╚═══════════════════════════╝
    ║    updatedAt              ║           │
    ╚═══════════════════════════╝           │
            │                                │
            │ 1                              │ 1
            │                                │
            └────────────────────────────────┴──────────────┐
                                                             │
                                                             │ N
                                                             │
                                    ┌────────────────────────┘
                                    │
                                    │ deviceId có thể tham chiếu đến:
                                    │ • devices.id (nếu thiết bị đang trong collection devices)
                                    │ • warehouse.id (nếu thiết bị đang trong collection warehouse)
                                    │
                                    │ Lưu ý: Khi mượn từ warehouse, hệ thống KHÔNG tự động
                                    │ chuyển thiết bị sang devices, mà chỉ cập nhật assignedTo
                                    │ và location trong warehouse.
```

CHÚ THÍCH:

**Ký hiệu:**

- 🔑 = Primary Key (PK)
- 🔗 = Foreign Key (FK)
- 📋 = Denormalized field (lưu trực tiếp để tối ưu truy vấn)
- → = Quan hệ One-to-Many (1:N)

**Quan hệ:**

- Tất cả Foreign Key đều tham chiếu đến users.uid (trừ deviceId)
- deviceId trong BORROW_RECORDS có thể tham chiếu đến:
  • devices.id (nếu thiết bị đang trong collection devices)
  • warehouse.id (nếu thiết bị đang trong collection warehouse)
- Thiết bị có thể được mượn từ cả DEVICES và WAREHOUSE mà không cần chuyển collection
- Một thiết bị có thể có nhiều phiếu mượn (lịch sử mượn trả)

```

---

## GHI CHÚ QUAN TRỌNG

1. **Firebase Firestore:** Hệ thống sử dụng Firebase Firestore (NoSQL), không phải SQL database truyền thống. Các quan hệ được thể hiện thông qua Foreign Key tham chiếu bằng ID/UID.

2. **Denormalization:** Một số trường như `deviceName`, `deviceCode`, `borrowerName` được lưu trực tiếp trong `borrowRecords` để tối ưu hiệu suất truy vấn (denormalization).

3. **Không có bảng Maintenance riêng:** Thông tin bảo trì được lưu trực tiếp trong bảng `devices` thông qua các trường:

   - `maintenanceSchedule`
   - `lastMaintenance`
   - `nextMaintenance`
   - `status` (có thể là "maintenance" hoặc "broken")

4. **Quan hệ giữa DEVICES và WAREHOUSE:**

   - Hai bảng này không có quan hệ trực tiếp (không có Foreign Key)
   - Có thể chuyển đổi thiết bị giữa hai bảng thông qua các hàm:
     - `moveDeviceFromWarehouseToDevices()`: Chuyển từ kho sang đang sử dụng
     - `moveDeviceFromDevicesToWarehouse()`: Chuyển từ đang sử dụng về kho
   - **Quan trọng:** Khi mượn thiết bị từ warehouse, hệ thống KHÔNG tự động chuyển thiết bị sang devices collection. Thay vào đó, nó chỉ cập nhật `assignedTo` và `location` trong warehouse. `deviceId` trong `borrowRecords` có thể tham chiếu đến cả `devices.id` hoặc `warehouse.id` tùy thuộc vào thiết bị đang ở collection nào.

5. **Primary Keys:** Tất cả các bảng đều sử dụng Firestore Document ID tự động làm Primary Key (trừ `settings` có ID cố định là "global").

---

## CÁC TRƯỜNG ENUM

### User Status:

- `active`: Đang làm việc
- `inactive`: Tạm nghỉ
- `suspended`: Đình chỉ

### User Role:

- `director`: Giám đốc
- `deputy_director`: Phó giám đốc
- `manager`: Quản lý
- `staff`: Nhân viên
- `technician`: Kỹ thuật viên

### Device Status:

- `active`: Đang hoạt động
- `maintenance`: Cần bảo trì
- `broken`: Đã hỏng
- `retired`: Thanh lý

### Borrow Record Status:

- `borrowed`: Đang mượn
- `returned`: Đã trả
- `overdue`: Quá hạn

---

## SƠ ĐỒ TUẦN TỰ QUY TRÌNH BẢO TRÌ THIẾT BỊ

```

┌─────────────┐
│ Người dùng │
└──────┬──────┘
│
│ 1. Mở trang "Danh sách thiết bị cần bảo trì"
▼
┌─────────────────────────────┐
│ Giao diện │
│ (Maintenance Page) │
└──────┬──────────────────────┘
│
│ 2. getDevices()
▼
┌─────────────────────────────┐
│ Device Service │
│ (devices.ts) │
└──────┬──────────────────────┘
│
│ 3. Truy vấn collection `devices`
▼
┌─────────────────────────────┐
│ Firestore │
└──────┬──────────────────────┘
│
│ 4. Trả về danh sách thiết bị
│
│ ◄────────────────────┘
│
│ 5. Trả về danh sách thiết bị
│
┌──────▼──────────────────────┐
│ Giao diện │
│ (Maintenance Page) │
└──────┬──────────────────────┘
│
│ 6. Lọc thiết bị có status = "maintenance" hoặc "broken"
│
│ 7. Hiển thị danh sách thiết bị cần bảo trì
│
┌──────▼──────────────────────┐
│ Người dùng │
└──────┬──────────────────────┘
│
│ 8. Chọn thiết bị và nhấn "Chỉnh sửa"
│
▼
┌─────────────────────────────┐
│ Giao diện │
│ (Form chỉnh sửa) │
└──────┬──────────────────────┘
│
│ 9. Người dùng cập nhật thông tin bảo trì:
│ - status: "maintenance" / "broken" / "active"
│ - lastMaintenance: Ngày bảo trì cuối
│ - nextMaintenance: Ngày bảo trì tiếp theo
│ - maintenanceSchedule: Lịch bảo trì
│
│ 10. Nhấn "Lưu"
│
│ 11. updateDevice(deviceId, deviceData, userId, userName)
│
▼
┌─────────────────────────────┐
│ Device Service │
│ (devices.ts) │
└──────┬──────────────────────┘
│
│
├─────────────────────────────────┐
│ │
│ 12. Kiểm tra thiết bị ở đâu? │
│ │
▼ ▼
┌──────────────────┐ ┌──────────────────┐
│ Collection │ │ Collection │
│ `devices` │ │ `warehouse` │
└──────┬───────────┘ └──────┬───────────┘
│ │
│ 13a. updateDoc() │ 13b. updateDoc()
│ (nếu ở devices) │ (nếu ở warehouse)
│ │
│ 14a. Xác nhận │ 14b. Xác nhận
│ │
└───────────┬───────────┘
│
│ 15. Trả về kết quả cập nhật
│
┌──────────────────▼───────────┐
│ Device Service │
└──────┬──────────────────────┘
│
│ 16. Trả về kết quả
│
▼
┌─────────────────────────────┐
│ Giao diện │
│ (Maintenance Page) │
└──────┬──────────────────────┘
│
│ 17. Tải lại danh sách thiết bị
│
│ 18. Hiển thị thông báo thành công & cập nhật danh sách
│
▼
┌─────────────────────────────┐
│ Người dùng │
│ (Xem kết quả) │
└─────────────────────────────┘

═══════════════════════════════════════════════════════════════════

📋 CÁC TRƯỜNG BẢO TRÌ ĐƯỢC LƯU TRỰC TIẾP TRONG BẢNG:

┌─────────────────────────────────────────────────────────────┐
│ Collection: `devices` hoặc `warehouse` │
├─────────────────────────────────────────────────────────────┤
│ • maintenanceSchedule: Lịch bảo trì (VD: "6 tháng/lần") │
│ • lastMaintenance: Ngày bảo trì cuối (YYYY-MM-DD) │
│ • nextMaintenance: Ngày bảo trì tiếp theo (YYYY-MM-DD) │
│ • status: Trạng thái ("maintenance", "broken", "active", │
│ "retired") │
│ • updatedAt: Ngày cập nhật (tự động) │
│ • updatedBy: UID người cập nhật (tự động) │
│ • updatedByName: Tên người cập nhật (tự động) │
└─────────────────────────────────────────────────────────────┘

```

**Ý nghĩa các bước chính:**
- User xem danh sách thiết bị cần bảo trì (status = "maintenance" hoặc "broken").
- User chỉnh sửa thông tin bảo trì của thiết bị (cập nhật lịch bảo trì, ngày bảo trì cuối, ngày bảo trì tiếp theo, trạng thái).
- Service cập nhật thông tin vào Firestore (có thể ở collection `devices` hoặc `warehouse` tùy thuộc vào thiết bị đang ở đâu).
- Giao diện cập nhật lại danh sách và thông báo kết quả cho người dùng.

**Lưu ý:**
- Hệ thống không có bảng Maintenance riêng, thông tin bảo trì được lưu trực tiếp trong bảng `devices` hoặc `warehouse`.
- Khi cập nhật thông tin bảo trì, hệ thống tự động cập nhật `updatedAt`, `updatedBy`, và `updatedByName` để theo dõi lịch sử thay đổi.

---

## HƯỚNG DẪN SỬA SƠ ĐỒ TUẦN TỰ (ĐỂ ĐÚNG VỚI CODE)

### 📝 Sơ đồ đơn giản hóa (Style giống hình bạn vẽ):

```

┌─────────────────┐
│ Kỹ thuật viên │
└────────┬────────┘
│
│ 1: Xem thiết bị cần bảo trì
▼
┌─────────────────────────────┐
│ Website quản lý thiết bị │
│ (Maintenance Page) │
└────────┬────────────────────┘
│
│ 2: getDevices()
▼
┌─────────────────────────────┐
│ Device Service │
│ (devices.ts) │
└────────┬────────────────────┘
│
│ 3: Truy vấn collection `devices`
│ (Lấy TẤT CẢ thiết bị)
▼
┌─────────────────────────────┐
│ Firebase Firestore Database │
└────────┬────────────────────┘
│
│ 4: Trả về danh sách thiết bị
│
│ ◄────────────────────┘
│
│ 5: Trả về danh sách thiết bị
│
┌────────▼────────────────────┐
│ Device Service │
└────────┬────────────────────┘
│
│ 6: Trả về danh sách thiết bị
│
┌────────▼────────────────────┐
│ Website quản lý thiết bị │
│ (Lọc status = "maintenance" │
│ hoặc "broken") │
└────────┬────────────────────┘
│
│ 7: Hiển thị danh sách thiết bị cần bảo trì
│
┌────────▼────────────────────┐
│ Kỹ thuật viên │
└────────┬────────────────────┘
│
│ 8: Chọn sửa thiết bị
│
▼
┌─────────────────────────────┐
│ Website quản lý thiết bị │
│ (Form chỉnh sửa) │
└────────┬────────────────────┘
│
│ 9: Người dùng nhập thông tin bảo trì
│ và nhấn "Lưu"
│
│ 10: updateDevice(deviceId, deviceData, ...)
│
▼
┌─────────────────────────────┐
│ Device Service │
│ (devices.ts) │
└────────┬────────────────────┘
│
│ 11: Kiểm tra thiết bị ở collection nào?
│
├─────────────────────┬─────────────────────┐
│ │ │
│ 12a: Nếu ở `devices`│ 12b: Nếu ở `warehouse`
│ │ │
▼ ▼ ▼
┌──────────────┐ ┌──────────────────┐
│ Collection │ │ Collection │
│ `devices` │ │ `warehouse` │
└──────┬───────┘ └──────┬───────────┘
│ │
│ 13a: updateDoc() │ 13b: updateDoc()
│ │
│ 14a: Xác nhận │ 14b: Xác nhận
│ │
└──────────┬─────────┘
│
│ 15: Trả về kết quả cập nhật
│
┌─────────────────▼──────────┐
│ Device Service │
└────────┬───────────────────┘
│
│ 16: Trả về kết quả
│
┌────────▼───────────────────┐
│ Website quản lý thiết bị │
└────────┬───────────────────┘
│
│ 17: Tải lại danh sách
│
│ 18: Thông báo thành công
│
┌────────▼───────────────────┐
│ Kỹ thuật viên │
└────────────────────────────┘

```

### ✅ CÁC ĐIỂM CẦN SỬA TRONG SƠ ĐỒ CỦA BẠN:

#### **1. Thêm Participant "Device Service"**
- **Sửa:** Thêm một lifeline mới giữa "Website" và "Firebase Firestore"
- **Tên:** `Device Service (devices.ts)`
- **Vị trí:** Ở giữa Website và Firestore

#### **2. Sửa Message 2 (Query)**
- **Sai:** "2 : Truy vấn /devices/{id}" (truy vấn 1 thiết bị)
- **Đúng:** "2 : getDevices()" → "3 : Truy vấn collection `devices`" (truy vấn TẤT CẢ)
- **Lý do:** Code gọi `getDevices()` để lấy tất cả, sau đó mới lọc theo status

#### **3. Thêm Message sau "Giao diện sửa thiết bị"**
- **Thêm:** Message từ "Website" → "Device Service": "10 : updateDevice(deviceId, deviceData, userId, userName)"
- **Thêm:** Message từ "Device Service" → "Firestore": "11 : Kiểm tra thiết bị ở collection nào?"

#### **4. Thêm Logic Phân nhánh (Alt Fragment)**
- **Thêm:** Một khung "alt" (alternative) sau bước 11
- **Nhánh 1:** Nếu ở `devices` → "12a : updateDoc('devices', ...)"
- **Nhánh 2:** Nếu ở `warehouse` → "12b : updateDoc('warehouse', ...)"
- **Kết quả:** Cả 2 nhánh đều trả về "Xác nhận cập nhật thành công"

#### **5. Thêm Message trả về từ Firestore**
- **Thêm:** Message từ "Firestore" → "Device Service": "15 : Trả về kết quả cập nhật"
- **Thêm:** Message từ "Device Service" → "Website": "16 : Trả về kết quả"

#### **6. Sửa Message 6**
- **Sai:** "6 : Thông báo thành công" (thiếu bước cập nhật DB)
- **Đúng:**
  - "17 : Tải lại danh sách thiết bị"
  - "18 : Thông báo thành công"

### 📋 CHECKLIST KHI VẼ LẠI:

- [ ] Có 4 participants: Kỹ thuật viên, Website, Device Service, Firestore
- [ ] Message 2-3: Query TẤT CẢ thiết bị (không phải /devices/{id})
- [ ] Có bước lọc thiết bị theo status ở Website (bước 6)
- [ ] Có message "updateDevice()" từ Website → Device Service (bước 10)
- [ ] Có logic phân nhánh: devices vs warehouse (bước 12a/12b)
- [ ] Có message "updateDoc()" từ Device Service → Firestore (bước 13a/13b)
- [ ] Có message trả về từ Firestore → Device Service → Website (bước 15-16)
- [ ] Có bước "Tải lại danh sách" trước "Thông báo thành công" (bước 17-18)

### 🎨 CÁCH VẼ TRONG WORD/DRAW.IO:

1. **Mở Draw.io hoặc Word → Insert → Shapes**
2. **Vẽ 4 lifelines dọc:**
   - Kỹ thuật viên (Actor - stick figure)
   - Website quản lý thiết bị
   - Device Service (devices.ts) ← **THÊM MỚI**
   - Firebase Firestore Database
3. **Vẽ các message:**
   - Mũi tên đầy (→) cho request
   - Mũi tên đứt nét (--→) cho response
4. **Vẽ Activation Box:**
   - Hình chữ nhật dọc trên mỗi lifeline khi đang xử lý
5. **Vẽ Alt Fragment:**
   - Khung chữ nhật với nhãn "alt" ở bước 11-14
   - Chia 2 nhánh: "Nếu ở devices" và "Nếu ở warehouse"
6. **Đánh số thứ tự:** 1, 2, 3... 18

---

## CÁCH VẼ SƠ ĐỒ TRONG WORD

1. **Sử dụng Shapes:**

   - Vẽ hình chữ nhật cho mỗi bảng
   - Vẽ đường thẳng có mũi tên để thể hiện quan hệ
   - Ghi chú "1" và "N" ở hai đầu đường quan hệ

2. **Màu sắc:**

   - Mỗi bảng một màu khác nhau
   - Primary Key có thể tô màu vàng
   - Foreign Key có thể tô màu xanh nhạt

3. **Bố cục:**

   - Đặt bảng `USERS` ở giữa (vì có nhiều quan hệ nhất)
   - Các bảng khác xung quanh
   - Sắp xếp theo luồng logic: Users → Devices → BorrowRecords

4. **Chú thích:**
   - Thêm legend giải thích ký hiệu
   - Ghi rõ loại quan hệ (One-to-Many, etc.)
```
