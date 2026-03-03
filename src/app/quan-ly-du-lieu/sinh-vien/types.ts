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

// Response for dry-run analysis (dry_run=true)
export interface ImportAnalysisResponse {
  total_rows: number
  valid_count: number
  invalid_count: number
  valid_rows: ImportPreviewRow[]
  invalid_rows: ImportRowError[]
  message: string
}

// Response for actual import execution (dry_run=false)
export interface ImportExecutionResponse {
  id: number
  file_name: string
  status: string
  total_processed: number
  success_count: number
  failure_count: number
  created_at: string
  message: string
}

// Preview row structure
export interface ImportPreviewRow {
  row_index: number
  student_id: string
  full_name: string
  class_name?: string
  dob?: string
  [key: string]: any
}

// Row error structure
export interface ImportRowError {
  row_index: number
  error_message: string
  row_data: Record<string, any>
}

// Legacy interface for backward compatibility
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
