export interface Certificate {
  id: number
  studentId?: number
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

export interface CertificateImportResponse {
  id: number
  file_name: string
  created_by_id: number
  type: string
  status: string
  total_processed: number
  success_count: number
  failure_count: number
  error_message: string
  created_at: string
}

export type CertificateFormData = Omit<Certificate, 'id'>

export interface StudentCertificateCreatePayload {
  student_id: number
  certificate_id: number
  note?: string
}

export type { Certificate as default }
