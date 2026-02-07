// types.ts

export interface Student {
  id: number
  mssv: number
  hoTen: string
  lop: string | null
  ngaySinh: string | null
  ghiChu: string
}

export interface StudentPublic {
  student_id: number
  full_name: string
  dob: string | null
  class_name: string | null
  notes: string | null
}

export interface StudentListResponse {
  students: StudentPublic[]
  total: number
  message?: string | null
}

export interface ImportHistory {
  id: number
  fileName: string
  importedAt: string
  status: string
}

export interface ImportResponse {
  status: string
  success_count: number
  failure_count: number
  message: string
  errors?: ImportError[]
}

export interface ImportError {
  row: number
  column: string
  value: string
  error: string
}

export type ColumnMapping = Record<string, string>

export interface UpdateStudentRequest {
  student_id: number
  full_name: string
  dob: string
  class_name: string
  notes?: string
  status?: boolean
}
