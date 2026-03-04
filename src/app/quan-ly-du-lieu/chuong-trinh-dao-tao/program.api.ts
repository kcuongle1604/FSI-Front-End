import { api } from "@/lib/api"

export interface Subject {
  subject_id: string
  name: string
  credits: number
  is_required: boolean
  course_display_name: string
}

export interface SubjectsResponse {
  data: Subject[]
}

/**
 * Get list of subjects for a training program by project name
 * @param projectName - Name of the training program
 * @returns List of subjects in the program
 */
export async function getSubjectsByProgramName(projectName: string) {
  return api.get<Subject[]>(`/api/v1/training-programs/by-name/${encodeURIComponent(projectName)}/subjects`)
}

/**
 * Get list of all training programs
 * @returns List of available training programs
 */
export async function getTrainingPrograms() {
  return api.get("/api/v1/training-programs")
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
