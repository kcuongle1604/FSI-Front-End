// Chứa dữ liệu mẫu (sampleStudents, importHistory)
import { Student, FileImport } from "./types"

export const sampleStudents: Student[] = [
  { id: 1, mssv: "221121521206", hoTen: "Nguyễn Văn A", lop: "48K05", ngaySinh: "16/04/2004", ghiChu: "" },
  { id: 2, mssv: "221121521207", hoTen: "Trần Thị B", lop: "48K05", ngaySinh: "20/05/2004", ghiChu: "" },
  { id: 3, mssv: "221121521208", hoTen: "Lê Văn C", lop: "48K05", ngaySinh: "01/01/2004", ghiChu: "" },
  { id: 4, mssv: "221121521209", hoTen: "Phạm Thị D", lop: "48K05", ngaySinh: "12/12/2004", ghiChu: "" },
  { id: 5, mssv: "221121521210", hoTen: "Ngô Văn E", lop: "48K14.1", ngaySinh: "05/03/2004", ghiChu: "" },
  { id: 6, mssv: "221121521211", hoTen: "Đỗ Thị F", lop: "48K14.1", ngaySinh: "22/07/2004", ghiChu: "" },
  { id: 7, mssv: "221121521212", hoTen: "Bùi Văn G", lop: "48K14.1", ngaySinh: "30/09/2004", ghiChu: "" },
  { id: 8, mssv: "221121521213", hoTen: "Vũ Thị H", lop: "48K14.2", ngaySinh: "15/08/2004", ghiChu: "" },
  { id: 9, mssv: "221121521214", hoTen: "Hoàng Văn I", lop: "48K21.2", ngaySinh: "10/10/2004", ghiChu: "" },
  { id: 10, mssv: "221121521215", hoTen: "Phan Thị J", lop: "48K21.2", ngaySinh: "25/11/2004", ghiChu: "" },
  { id: 11, mssv: "221121521216", hoTen: "Nguyễn Văn K", lop: "48K05", ngaySinh: "02/02/2004", ghiChu: "" },
  { id: 12, mssv: "221121521217", hoTen: "Trần Thị L", lop: "48K05", ngaySinh: "03/03/2004", ghiChu: "" },
  { id: 13, mssv: "221121521218", hoTen: "Lê Văn M", lop: "48K05", ngaySinh: "04/04/2004", ghiChu: "" },
  { id: 14, mssv: "221121521219", hoTen: "Phạm Thị N", lop: "48K05", ngaySinh: "05/05/2004", ghiChu: "" },
  { id: 15, mssv: "221121521220", hoTen: "Ngô Văn O", lop: "48K14.1", ngaySinh: "06/06/2004", ghiChu: "" },
  { id: 16, mssv: "221121521221", hoTen: "Đỗ Thị P", lop: "48K14.1", ngaySinh: "07/07/2004", ghiChu: "" },
  { id: 17, mssv: "221121521222", hoTen: "Bùi Văn Q", lop: "48K14.1", ngaySinh: "08/08/2004", ghiChu: "" },
  { id: 18, mssv: "221121521223", hoTen: "Vũ Thị R", lop: "48K14.2", ngaySinh: "09/09/2004", ghiChu: "" },
  { id: 19, mssv: "221121521224", hoTen: "Hoàng Văn S", lop: "48K21.2", ngaySinh: "10/10/2004", ghiChu: "" },
  { id: 20, mssv: "221121521225", hoTen: "Phan Thị T", lop: "48K21.2", ngaySinh: "11/11/2004", ghiChu: "" },
]

export const importHistory: FileImport[] = [
  { id: 1, fileName: "Danh sách sinh viên lớp 48K21.2.xlsx", status: "Hoàn thành", success: 131, failed: 3, total: 134, createdAt: "11/02/2025 14:32:18", createdBy: "Giáo vụ khoa" },
  { id: 2, fileName: "Danh sách sinh viên lớp 48K21.2.xlsx", status: "Hoàn thành", success: 134, failed: 0, total: 134, createdAt: "11/02/2025 14:32:18", createdBy: "Giáo vụ khoa" },
  { id: 3, fileName: "Danh sách sinh viên lớp 48K21.2.xlsx", status: "Hoàn thành", success: 134, failed: 0, total: 134, createdAt: "11/02/2025 14:32:18", createdBy: "Giáo vụ khoa" },
  { id: 4, fileName: "Danh sách sinh viên lớp 48K21.2.xlsx", status: "Hoàn thành", success: 134, failed: 0, total: 134, createdAt: "11/02/2025 14:32:18", createdBy: "Giáo vụ khoa" },
  { id: 5, fileName: "Danh sách sinh viên lớp 48K21.2.xlsx", status: "Hoàn thành", success: 134, failed: 0, total: 134, createdAt: "11/02/2025 14:32:18", createdBy: "Giáo vụ khoa" },
  { id: 6, fileName: "Import sinh viên 48K05.xlsx", status: "Hoàn thành", success: 120, failed: 2, total: 122, createdAt: "12/02/2025 10:15:00", createdBy: "Giáo vụ khoa" },
  { id: 7, fileName: "Import sinh viên 48K14.1.xlsx", status: "Hoàn thành", success: 110, failed: 1, total: 111, createdAt: "13/02/2025 09:00:00", createdBy: "Giáo vụ khoa" },
  { id: 8, fileName: "Import sinh viên 48K14.2.xlsx", status: "Hoàn thành", success: 115, failed: 0, total: 115, createdAt: "14/02/2025 08:30:00", createdBy: "Giáo vụ khoa" },
  { id: 9, fileName: "Import sinh viên 48K21.2.xlsx", status: "Hoàn thành", success: 130, failed: 4, total: 134, createdAt: "15/02/2025 11:45:00", createdBy: "Giáo vụ khoa" },
  { id: 10, fileName: "Import sinh viên 49K01.xlsx", status: "Hoàn thành", success: 100, failed: 0, total: 100, createdAt: "16/02/2025 13:20:00", createdBy: "Giáo vụ khoa" },
  { id: 11, fileName: "Import sinh viên 49K02.xlsx", status: "Hoàn thành", success: 105, failed: 2, total: 107, createdAt: "17/02/2025 14:10:00", createdBy: "Giáo vụ khoa" },
  { id: 12, fileName: "Import sinh viên 49K03.xlsx", status: "Hoàn thành", success: 98, failed: 1, total: 99, createdAt: "18/02/2025 15:00:00", createdBy: "Giáo vụ khoa" },
  { id: 13, fileName: "Danh sách sinh viên lớp 48K.01.xlsx", status: "Hoàn thành", success: 90, failed: 0, total: 90, createdAt: "19/02/2025 16:30:00", createdBy: "Giáo vụ khoa" },
  { id: 14, fileName: "Danh sách sinh viên lớp 48K.02.xlsx", status: "Hoàn thành", success: 95, failed: 0, total: 95, createdAt: "20/02/2025 17:45:00", createdBy: "Giáo vụ khoa" },
  { id: 15, fileName: "Danh sách sinh viên lớp 48K.03.xlsx", status: "Hoàn thành", success: 92, failed: 0, total: 92, createdAt: "21/02/2025 18:00:00", createdBy: "Giáo vụ khoa" },
  { id: 16, fileName: "Danh sách sinh viên lớp 48K.04.xlsx", status: "Hoàn thành", success: 88, failed: 0, total: 88, createdAt: "22/02/2025 19:00:00", createdBy: "Giáo vụ khoa" },
  { id: 17, fileName: "Danh sách sinh viên lớp 48K.05.xlsx", status: "Hoàn thành", success: 85, failed: 0, total: 85, createdAt: "23/02/2025 20:00:00", createdBy: "Giáo vụ khoa" },
  { id: 18, fileName: "Danh sách sinh viên lớp 48K.06.xlsx", status: "Hoàn thành", success: 80, failed: 0, total: 80, createdAt: "24/02/2025 21:00:00", createdBy: "Giáo vụ khoa" },
  { id: 19, fileName: "Danh sách sinh viên lớp 48K.07.xlsx", status: "Hoàn thành", success: 78, failed: 0, total: 78, createdAt: "25/02/2025 22:00:00", createdBy: "Giáo vụ khoa" },
  { id: 20, fileName: "Danh sách sinh viên lớp 48K.08.xlsx", status: "Hoàn thành", success: 75, failed: 0, total: 75, createdAt: "26/02/2025 23:00:00", createdBy: "Giáo vụ khoa" },
]

export const classesByCourse: Record<string, string[]> = {
  "48K": ["48K05", "48K14.1", "48K14.2", "48K21.2"],
  "49K": ["49K01", "49K02", "49K03"],
  "50K": ["50K01", "50K02"],
}