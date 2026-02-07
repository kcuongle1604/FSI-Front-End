export interface Certificate {
  id: number
  mssv: string
  lop: string
  hoLot: string
  ten: string
  ngaySinh: string
  donTN?: boolean
  kiemDiem?: boolean
  quanSu?: boolean
  theDuc?: boolean
  ngoaiNgu?: boolean
  tinhHoc?: boolean
  ghiChu?: string
}

export interface FileImport {
  id: number
  fileName: string
  status: string
  success: number
  failed: number
  total: number
  createdAt: string
  createdBy: string
}

export type CertificateFormData = Omit<Certificate, 'id'>

export type { Certificate as default }
