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
