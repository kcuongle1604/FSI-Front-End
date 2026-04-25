import { api } from "@/lib/api"

export interface Subject {
  program_subject_id?: string | number
  programSubjectId?: string | number
  id?: string | number
  subject_id: string
  name: string
  credits: number
  is_required: boolean
  course_display_name: string
}

export interface SubjectListItem {
  subject_id?: string
  id?: string
  code?: string
  name?: string
  course_display_name?: string
  credits?: number
  is_required?: boolean
}

export interface SubjectsResponse {
  data?: Subject[]
  items?: Subject[]
  results?: Subject[]
  total?: number
  page?: number
  size?: number
}

function toSortableProgramSubjectId(value: Subject["program_subject_id"] | Subject["programSubjectId"] | Subject["id"]) {
  const raw = String(value ?? "").trim()
  if (!raw) return Number.POSITIVE_INFINITY

  const normalized = Number(raw)
  return Number.isFinite(normalized) ? normalized : Number.POSITIVE_INFINITY
}

function sortSubjectsByProgramSubjectId(subjects: Subject[]) {
  return [...subjects].sort((a, b) => {
    const aId = toSortableProgramSubjectId(a.program_subject_id ?? a.programSubjectId ?? a.id)
    const bId = toSortableProgramSubjectId(b.program_subject_id ?? b.programSubjectId ?? b.id)
    return aId - bId
  })
}

/**
 * Get list of subjects for a training program by program name (paginated)
 * @param programName - Name of the training program
 * @param page - Page number (starts from 1)
 * @param size - Page size (max 100)
 * @returns Paginated list of subjects in the program
 */
export async function getSubjectsByProgramName(programName: string, page = 1, size = 20) {
  return api.get<SubjectsResponse | Subject[]>(
    `/api/v1/training-programs/by-name/${encodeURIComponent(programName)}/subjects`,
    {
      params: {
        page,
        size,
      },
    }
  )
}

/**
 * Get list of subjects for a training program by ID (paginated)
 * @param trainingProgramId - ID of the training program
 * @param page - Page number (starts from 1)
 * @param size - Page size (max 100)
 * @returns Paginated list of subjects in the program
 */
export async function getSubjectsByProgramId(trainingProgramId: number, page = 1, size = 20) {
  const response = await api.get<SubjectsResponse | Subject[]>(
    `/api/v1/training-programs/${trainingProgramId}/subjects`,
    {
      params: {
        page,
        size,
      },
    }
  )

  const payload = response.data
  if (Array.isArray(payload)) {
    response.data = sortSubjectsByProgramSubjectId(payload)
    return response
  }

  if (payload?.data && Array.isArray(payload.data)) {
    response.data = {
      ...payload,
      data: sortSubjectsByProgramSubjectId(payload.data),
    }
  }

  return response
}

/**
 * Get all subjects
 */
export async function getAllSubjects(page = 1, size = 20) {
  return api.get<SubjectListItem[] | SubjectsResponse>("/api/v1/subjects", {
    params: {
      page,
      size,
    },
  })
}

/**
 * Get list of all training programs
 * @returns List of available training programs
 */
export async function getTrainingPrograms() {
  return api.get("/api/v1/training-programs")
}

export interface TrainingProgramPayload {
  major_id: number
  description?: string
  cohort_ids: number[]
}

export interface ProgramSubjectPayload {
  program_subject_id: number
  training_program_id: number
  subject_id: string
  subject_name: string
  credits: number
  is_required: boolean
}

export interface UpdateSubjectPayload {
  name: string
  credits: number
}

export interface SubjectTrainingProgramItem {
  training_program_id: number
  major_id: number
  major_name: string
  description?: string
  cohort_ids?: number[]
}

export async function createTrainingProgram(payload: TrainingProgramPayload) {
  return api.post("/api/v1/training-programs", payload)
}

export async function updateTrainingProgram(trainingProgramId: number, payload: TrainingProgramPayload) {
  return api.put(`/api/v1/training-programs/${trainingProgramId}`, payload)
}

export async function deleteTrainingProgram(trainingProgramId: number) {
  return api.delete(`/api/v1/training-programs/${trainingProgramId}`)
}

export async function addSubjectToTrainingProgram(payload: ProgramSubjectPayload) {
  try {
    return await api.post("/api/v1/training-programs/subjects", payload)
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return api.post(
        `/api/v1/training-programs/${payload.training_program_id}/subjects`,
        payload
      )
    }
    throw error
  }
}

export async function updateTrainingProgramSubject(
  programSubjectId: string | number,
  payload: { is_required: boolean }
) {
  return api.put(
    `/api/v1/training-programs/subjects/${encodeURIComponent(String(programSubjectId))}`,
    payload
  )
}

export async function deleteSubjectFromTrainingProgram(trainingProgramId: number, subjectId: string) {
  return api.delete(
    `/api/v1/training-programs/${trainingProgramId}/subjects/${encodeURIComponent(subjectId)}`
  )
}

export async function updateSubject(subjectId: string, payload: UpdateSubjectPayload) {
  return api.put(`/api/v1/subjects/${encodeURIComponent(subjectId)}`, payload)
}

export async function deleteSubject(subjectId: string) {
  return api.delete(`/api/v1/subjects/${encodeURIComponent(subjectId)}`)
}

export async function getSubjectTrainingPrograms(subjectId: string) {
  return api.get<SubjectTrainingProgramItem[]>(
    `/api/v1/subjects/${encodeURIComponent(subjectId)}/training-programs`
  )
}

export interface Cohort {
  cohort_id: number
  name: string
  year_start: number
  year_end: number
}

/**
 * Get list of cohorts for a specific training program
 * @param trainingProgramId - ID of the training program
 * @returns List of cohorts associated with the program
 */
export async function getProgramCohorts(trainingProgramId: number) {
  return api.get<Cohort[]>(`/api/v1/training-programs/${trainingProgramId}/cohorts`)
}

/**
 * Import subjects for a training program by program name
 * @param programName - Name of the training program
 * @param file - CSV file containing subjects
 */
export async function importProgramSubjects(programName: string, file: File) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("file_type", "program")

  return api.post(
    `/api/v1/training-programs/${encodeURIComponent(programName)}/subjects/import`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
}
