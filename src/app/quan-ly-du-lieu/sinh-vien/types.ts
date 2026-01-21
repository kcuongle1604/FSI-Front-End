export type Student = {
  id: number
  mssv: string
  hoTen: string
  lop: string
  ngaySinh: string
  ghiChu: string
  chuyenNganh?: string 
}

export type FileImport = {
  id: number
  fileName: string
  status: string
  success: number
  failed: number
  total: number
  createdAt: string
  createdBy: string
}