# Hướng dẫn cấu hình chức năng Quên mật khẩu

## Tổng quan
Chức năng quên mật khẩu đã được tích hợp vào hệ thống sử dụng Firebase Authentication. Người dùng có thể yêu cầu đặt lại mật khẩu qua email.

## Các file đã được tạo/cập nhật

### 1. AuthContext (`src/contexts/AuthContext.tsx`)
- Thêm hàm `resetPassword(email: string)` để gửi email đặt lại mật khẩu
- Sử dụng Firebase `sendPasswordResetEmail()`

### 2. Trang Quên mật khẩu (`src/app/(auth)/forgot-password/page.tsx`)
- Giao diện người dùng để nhập email
- Hiển thị thông báo thành công/lỗi
- Có nút quay lại trang đăng nhập

### 3. Trang Đăng nhập (`src/app/(auth)/login/page.tsx`)
- Thêm link "Quên mật khẩu?" dưới nút đăng nhập

## Cấu hình Firebase

### Bước 1: Kích hoạt Email/Password Authentication
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** > **Sign-in method**
4. Kích hoạt **Email/Password**

### Bước 2: Cấu hình Email Template (Tùy chọn)
1. Trong Firebase Console, vào **Authentication** > **Templates**
2. Chọn **Password reset**
3. Tùy chỉnh template email theo ý muốn:
   - Tiêu đề email
   - Nội dung email
   - Tên người gửi
4. Lưu thay đổi

### Bước 3: Cấu hình biến môi trường
Đảm bảo file `.env.local` có đầy đủ các biến Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Cách sử dụng

### Đối với người dùng:
1. Truy cập trang đăng nhập
2. Nhấn vào link "Quên mật khẩu?"
3. Nhập email đã đăng ký
4. Nhấn "Gửi email khôi phục"
5. Kiểm tra email (có thể trong thư mục spam)
6. Nhấn vào link trong email để đặt lại mật khẩu
7. Nhập mật khẩu mới và xác nhận
8. Đăng nhập với mật khẩu mới

### Đối với lập trình viên:
Sử dụng hàm `resetPassword` từ AuthContext:

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { resetPassword } = useAuth();

  const handleReset = async (email: string) => {
    try {
      await resetPassword(email);
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Error:", error);
    }
  };
}
```

## Xử lý lỗi

Các mã lỗi phổ biến từ Firebase:
- `auth/user-not-found`: Email không tồn tại
- `auth/invalid-email`: Email không hợp lệ
- `auth/too-many-requests`: Quá nhiều yêu cầu, cần đợi

## Tùy chỉnh Email Template

### Email mặc định của Firebase bao gồm:
- Link đặt lại mật khẩu (tự động hết hạn sau 1 giờ)
- Tên ứng dụng
- Hướng dẫn đặt lại mật khẩu

### Tùy chỉnh nâng cao:
Để tùy chỉnh hoàn toàn, bạn có thể:
1. Sử dụng Firebase Custom Email Action URL
2. Tạo trang đặt lại mật khẩu tùy chỉnh
3. Xử lý action code trong ứng dụng

## Bảo mật

- Firebase tự động giới hạn số lượng yêu cầu reset password
- Link reset chỉ có hiệu lực trong 1 giờ
- Mỗi link chỉ sử dụng được 1 lần
- Email phải tồn tại trong hệ thống mới gửi được

## Troubleshooting

### Email không được gửi:
1. Kiểm tra Email/Password authentication đã được kích hoạt
2. Kiểm tra email có tồn tại trong Firebase Authentication
3. Kiểm tra thư mục spam
4. Kiểm tra cấu hình Firebase trong `.env.local`

### Lỗi "too-many-requests":
- Đợi vài phút trước khi thử lại
- Đây là cơ chế bảo mật của Firebase để chống spam

### Link hết hạn:
- Yêu cầu gửi lại email mới
- Link chỉ có hiệu lực trong 1 giờ

## Lưu ý

- Chức năng này hoàn toàn miễn phí với Firebase
- Firebase xử lý tất cả việc gửi email, bạn không cần cấu hình SMTP
- Email gửi từ `noreply@<your-project>.firebaseapp.com`
- Để sử dụng domain email riêng, cần nâng cấp Firebase plan

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ admin hoặc xem thêm tài liệu:
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Email/Password Authentication](https://firebase.google.com/docs/auth/web/password-auth)

