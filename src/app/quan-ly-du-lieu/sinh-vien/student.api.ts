import { api } from "@/lib/api"
import type { 
  StudentListResponse, 
  ImportResponse, 
  ImportAnalysisResponse,
  ImportExecutionResponse,
  ColumnMapping, 
  UpdateStudentRequest 
} from "./types"

export async function getStudents(params?: {
  cohort_id?: number
  class_id?: number
  class_name?: string
  search?: string
}) {
  return api.get<StudentListResponse>("/api/v1/students", { params })
}

export async function getStudentDetail(studentId: number) {
  return api.get(`/api/v1/students/${studentId}`)
}

export async function createStudent(data: any) {
  return api.post("/api/v1/students", data)
}

export async function updateStudent(studentId: number, data: UpdateStudentRequest) {
  return api.put(`/api/v1/students/${studentId}`, data)
}

export async function deleteStudent(studentId: number) {
  return api.delete(`/api/v1/students/${studentId}`)
}

export async function getClasses() {
  return api.get("/api/v1/classes")
}

export async function getCohorts() {
  return api.get("/api/v1/cohorts")
}

export async function importStudents(
  file: File,
  dryRun: boolean,
  columnMapping: ColumnMapping
) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("dry_run", dryRun.toString())
  formData.append("column_mapping", JSON.stringify(columnMapping))

  // Return type depends on dry_run value
  if (dryRun) {
    return api.post<ImportAnalysisResponse>("/api/v1/students/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  } else {
    return api.post<ImportExecutionResponse>("/api/v1/students/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  }
}
