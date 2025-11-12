import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Xuất Excel
export const exportToExcel = (
  data: any[],
  filename: string,
  sheetName: string = "Sheet1"
) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Không thể xuất file Excel");
  }
};

// Xuất Excel với nhiều sheet
export const exportToExcelMultiSheet = (
  sheets: { name: string; data: any[] }[],
  filename: string
) => {
  try {
    const workbook = XLSX.utils.book_new();
    sheets.forEach((sheet) => {
      const worksheet = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw new Error("Không thể xuất file Excel");
  }
};

// Xuất PDF từ HTML element
export const exportToPDF = (
  title: string,
  content: HTMLElement | string,
  filename: string
) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Thêm tiêu đề
    pdf.setFontSize(18);
    pdf.text(title, 105, 20, { align: "center" });

    // Thêm ngày xuất
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Xuất ngày: ${dateStr}`, 105, 30, { align: "center" });
    pdf.setTextColor(0, 0, 0);

    // Nếu content là string, thêm text
    if (typeof content === "string") {
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(content, 180);
      pdf.text(lines, 15, 40);
    } else {
      // Nếu content là HTML element, sử dụng html2canvas hoặc autoTable
      // Tạm thời chỉ hỗ trợ text
      pdf.setFontSize(12);
      pdf.text("Nội dung báo cáo", 15, 40);
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw new Error("Không thể xuất file PDF");
  }
};

// Xuất PDF với bảng dữ liệu
export const exportTableToPDF = (
  title: string,
  headers: string[],
  rows: any[][],
  filename: string,
  additionalInfo?: string
) => {
  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Thêm tiêu đề
    pdf.setFontSize(18);
    pdf.text(title, 105, 15, { align: "center" });

    // Thêm thông tin bổ sung nếu có
    if (additionalInfo) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(additionalInfo, 105, 22, { align: "center" });
      pdf.setTextColor(0, 0, 0);
    }

    // Thêm ngày xuất
    const now = new Date();
    const dateStr = now.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Xuất ngày: ${dateStr}`, 105, additionalInfo ? 28 : 22, {
      align: "center",
    });
    pdf.setTextColor(0, 0, 0);

    // Thêm bảng
    autoTable(pdf, {
      head: [headers],
      body: rows,
      startY: additionalInfo ? 35 : 28,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting table to PDF:", error);
    throw new Error("Không thể xuất file PDF");
  }
};

// Xuất PDF từ HTML element sử dụng html2canvas (cần cài thêm)
export const exportHTMLToPDF = async (
  elementId: string,
  title: string,
  filename: string
) => {
  try {
    // Dynamic import để tránh lỗi SSR
    const html2canvas = (await import("html2canvas")).default;
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Không tìm thấy element để xuất PDF");
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error exporting HTML to PDF:", error);
    throw new Error("Không thể xuất file PDF");
  }
};

