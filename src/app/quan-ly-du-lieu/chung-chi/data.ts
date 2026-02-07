import { Certificate, FileImport } from "./types"

export const sampleCertificates: Certificate[] = [
  { id: 1, mssv: "221121521206", hoLot: "Nguyễn Văn", ten: "A", lop: "48K05", ngaySinh: "16/04/2004", donTN: true, kiemDiem: true, quanSu: true, theDuc: true, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 2, mssv: "221121521207", hoLot: "Trần Thị", ten: "B", lop: "48K05", ngaySinh: "20/05/2004", donTN: true, kiemDiem: false, quanSu: true, theDuc: true, ngoaiNgu: false, tinhHoc: true, ghiChu: "" },
  { id: 3, mssv: "221121521208", hoLot: "Lê Văn", ten: "C", lop: "48K05", ngaySinh: "12/03/2004", donTN: true, kiemDiem: true, quanSu: false, theDuc: true, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 4, mssv: "221121521209", hoLot: "Phạm Thị", ten: "D", lop: "48K05", ngaySinh: "08/07/2004", donTN: false, kiemDiem: true, quanSu: true, theDuc: false, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 5, mssv: "221121521210", hoLot: "Ngô Văn", ten: "E", lop: "48K14.1", ngaySinh: "25/02/2004", donTN: true, kiemDiem: true, quanSu: true, theDuc: true, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 6, mssv: "221121521211", hoLot: "Đỗ Thị", ten: "F", lop: "48K14.1", ngaySinh: "14/06/2004", donTN: true, kiemDiem: true, quanSu: false, theDuc: true, ngoaiNgu: true, tinhHoc: false, ghiChu: "" },
  { id: 7, mssv: "221121521212", hoLot: "Vũ Văn", ten: "G", lop: "48K14.1", ngaySinh: "30/01/2004", donTN: false, kiemDiem: true, quanSu: true, theDuc: true, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 8, mssv: "221121521213", hoLot: "Bùi Thị", ten: "H", lop: "48K14.2", ngaySinh: "11/09/2004", donTN: true, kiemDiem: true, quanSu: true, theDuc: false, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 9, mssv: "221121521214", hoLot: "Nguyễn Văn", ten: "I", lop: "48K21.2", ngaySinh: "19/08/2004", donTN: true, kiemDiem: false, quanSu: true, theDuc: true, ngoaiNgu: true, tinhHoc: true, ghiChu: "" },
  { id: 10, mssv: "221121521215", hoLot: "Trần Thị", ten: "K", lop: "48K21.2", ngaySinh: "07/11/2004", donTN: true, kiemDiem: true, quanSu: true, theDuc: true, ngoaiNgu: false, tinhHoc: true, ghiChu: "" },
];

export const certificateImportHistory: FileImport[] = [
  { 
    id: 1, 
    fileName: "Danh sách chứng chỉ 48K05.xlsx", 
    status: "Hoàn thành", 
    success: 131, 
    failed: 3, 
    total: 134, 
    createdAt: "11/02/2025 14:32:18", 
    createdBy: "Giáo vụ khoa" 
  },
  { 
    id: 2, 
    fileName: "Danh sách chứng chỉ 48K14.1.xlsx", 
    status: "Hoàn thành", 
    success: 120, 
    failed: 2, 
    total: 122, 
    createdAt: "12/02/2025 10:15:00", 
    createdBy: "Giáo vụ khoa" 
  },
  { 
    id: 3, 
    fileName: "Danh sách chứng chỉ 48K14.2.xlsx", 
    status: "Hoàn thành", 
    success: 125, 
    failed: 1, 
    total: 126, 
    createdAt: "13/02/2025 09:00:00", 
    createdBy: "Giáo vụ khoa" 
  },
]

export const batchesAndClasses: Record<string, string[]> = {
  "48K": ["48K05", "48K14.1", "48K14.2", "48K21.2"],
  "49K": ["49K01", "49K02", "49K03"],
  "50K": ["50K01", "50K02"],
}