export const formatDate = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "Chưa có thông tin";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("vi-VN");
  } catch {
    return String(dateString);
  }
};

export const formatDateShort = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "N/A";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return String(dateString);
  }
};

export const formatDateTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return "Chưa có thông tin";
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return date.toLocaleString("vi-VN");
  } catch {
    return String(dateString);
  }
};
