export const uploadUserAvatar = async (
  userId: string,
  file: File
): Promise<string> => {
  try {
    console.log("🔄 Bắt đầu xử lý avatar cho user:", userId);
    console.log("📁 File info:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Nén ảnh và chuyển thành base64
    const base64 = await compressAndConvertToBase64(file);
    console.log(
      "✅ Đã nén và chuyển thành base64, kích thước:",
      Math.round(base64.length / 1024),
      "KB"
    );

    return base64;
  } catch (error: any) {
    console.error("❌ Error processing avatar:", error);
    throw new Error(
      `Không thể xử lý ảnh: ${error.message || "Vui lòng thử lại."}`
    );
  }
};

// Nén ảnh và chuyển thành base64
const compressAndConvertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        // Tạo canvas để resize ảnh
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Giới hạn kích thước tối đa 200x200 pixel cho avatar
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Vẽ ảnh đã resize lên canvas
        ctx?.drawImage(img, 0, 0, width, height);

        // Chuyển thành base64 với chất lượng 80%
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        console.log("📐 Đã resize:", width, "x", height);

        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error("Không thể đọc file ảnh"));
      };
    };

    reader.onerror = () => {
      reject(new Error("Không thể đọc file"));
    };
  });
};

// Xóa ảnh đại diện - không cần làm gì vì base64 lưu trong Firestore
export const deleteUserAvatar = async (avatarUrl: string): Promise<void> => {
  // Không cần xóa vì base64 được lưu trực tiếp trong document
  console.log("Avatar sẽ được xóa khi cập nhật user document");
};
