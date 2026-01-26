import { api } from "@/lib/api"
import type { StudentListResponse } from "./types"

export async function getStudents(params?: {
  cohort_id?: number
  class_id?: number
  search?: number
}) {
  return api.get<StudentListResponse>("/students", { params })
}

export async function getStudentDetail(studentId: number) {
  return api.get(`/students/${studentId}`)
}

export async function createStudent(data: any) {
  return api.post("/students", data)
}

export async function updateStudent(studentId: number, data: any) {
  return api.put(`/students/${studentId}`, data)
}

export async function deleteStudent(studentId: number) {
  return api.delete(`/students/${studentId}`)
}
