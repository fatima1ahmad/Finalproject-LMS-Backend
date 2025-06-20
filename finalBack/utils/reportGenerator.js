import PDFDocument from "pdfkit";
import excel from "exceljs";

export const generateReport = async (reportType, format, options = {}) => {
  try {
    let data;
    switch (reportType) {
      case "user_activity":
        data = await UserModel.getActivityReport(options.timeRange);
        break;
      case "course_popularity":
        data = await CourseModel.getPopularityReport();
        break;
      case "system_performance":
        data = await SystemModel.getPerformanceData();
        break;
      default:
        throw new Error("Invalid report type");
    }

    if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
      throw new Error("No data available for this report");
    }

    switch (format) {
      case "pdf":
        return await generatePdf(data, reportType);
      case "csv":
        return generateCsv(data, reportType);
      case "excel":
        return await generateExcel(data, reportType);
      default:
        throw new Error("Invalid format");
    }
  } catch (error) {
    console.error(`Error generating ${reportType} report:`, error);
    throw error;
  }
};

// Generate in requested format
switch (format) {
  case "pdf":
    return generatePdf(data, reportType);
  case "csv":
    return generateCsv(data, reportType);
  case "excel":
    return generateExcel(data, reportType);
}

const generatePdf = (data, reportType) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("error", reject);

      // Add title
      doc.fontSize(20).text(`${reportType} Report`, { align: "center" });
      doc.moveDown();

      // Add content based on report type
      if (reportType === "user_activity" && data.labels) {
        doc.fontSize(14).text("User Activity Summary", { underline: true });
        doc.moveDown();

        // Create a table
        const startX = 50;
        const startY = 150;
        let y = startY;

        // Table headers
        doc
          .font("Helvetica-Bold")
          .text("Time Period", startX, y)
          .text("Active Users", startX + 150, y)
          .text("New Signups", startX + 300, y);

        y += 30;
        doc.font("Helvetica");

        // Table rows
        data.labels.forEach((label, index) => {
          doc
            .text(label, startX, y)
            .text(String(data.activeUsers[index] || 0), startX + 150, y)
            .text(String(data.newSignups[index] || 0), startX + 300, y);
          y += 25;
        });
      } else if (reportType === "course_popularity" && data.labels) {
        // Similar implementation for course popularity
      }

      doc.end();

      doc.on("end", () => {
        try {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        } catch (err) {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
};
const generateCsv = (data, title) => {
  let csv = "";
  // Implement CSV generation
  return csv;
};

const generateExcel = async (data, title) => {
  const workbook = new excel.Workbook();
  const worksheet = workbook.addWorksheet("Report");

  // Implement Excel generation
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};
