import { api } from "@/lib/api"
import { getClasses as getClassesFromStudent } from "../sinh-vien/student.api"
import type {
    ScoreCreateRequest,
    ScoreCreateResponse,
    ScoreDeleteRequest,
    ScoreImportResponse,
    ScoreMatrixResponse,
    ScoreUpdateRequest,
} from "./types"

/**
 * Upload scores from CSV file
 * @param file - CSV file containing score data
 * @param semesterId - Semester ID for imported scores
 * @param classId - Class ID for imported scores
 * @returns Upload job information
 */
export async function uploadScores(file: File, semesterId: number, classId?: number) {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("file_type", "score")
    formData.append("semester_id", String(semesterId))
    if (typeof classId === "number" && Number.isFinite(classId)) {
        formData.append("class_id", String(classId))
    }

    return api.post<ScoreImportResponse>("/api/v1/upload-scores", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })
}

/**
 * Get score matrix (students x subjects)
 * @param params - Filter parameters (class_id, class_name, semester_id)
 * @returns Score matrix data
 */
export async function getScoreMatrix(params?: {
    class_id?: number
    class_name?: string
    semester_id?: number
}) {
    return api.get<ScoreMatrixResponse>("/api/v1/score-matrix", { params })
}

/**
 * Create a score for a student
 * @param payload - Score payload
 * @returns Created score data
 */
export async function createScore(payload: ScoreCreateRequest) {
    return api.post<ScoreCreateResponse>("/api/v1/scores", payload)
}

/**
 * Update score by student_id + subject_id
 */
export async function updateScore(payload: ScoreUpdateRequest) {
    return api.patch<ScoreCreateResponse>(
        "/api/v1/scores",
        { score_4: payload.score_4 },
        {
            params: {
                student_id: payload.student_id,
                subject_id: payload.subject_id,
            },
        }
    )
}

/**
 * Delete score by student_id + subject_id
 */
export async function deleteScore(payload: ScoreDeleteRequest) {
    return api.delete<{ success?: boolean; message?: string }>("/api/v1/scores", {
        params: {
            student_id: payload.student_id,
            subject_id: payload.subject_id,
        },
    })
}

/**
 * Get list of classes (re-exported from student.api)
 */
export const getClasses = getClassesFromStudent

/**
 * Semester item from API
 */
export interface Semester {
    id?: number
    semester_id?: number
    name?: string
    semester_name?: string
    code?: string
    term?: string
    academic_year?: string
}

/**
 * Get list of semesters
 */
export async function getSemesters(params?: { skip?: number; limit?: number }) {
    return api.get<Semester[] | { data?: Semester[]; items?: Semester[] }>("/api/v1/semesters", {
        params: {
            skip: params?.skip ?? 0,
            limit: params?.limit ?? 100,
        },
    })
}

/**
 * Get list of semesters by cohort
 */
export async function getSemestersByCohort(cohortId: number) {
    return api.get<Semester[] | { data?: Semester[]; items?: Semester[] }>(`/api/v1/cohorts/${cohortId}/semesters`)
}

export interface StudentProgramScoreSubject {
    subject_id?: number | string
    id?: number | string
    subject_name?: string
    name?: string
    code?: string
}

/**
 * Get available program subjects by class id
 */
export async function getProgramSubjectsByClass(classId: number) {
    return api.get<StudentProgramScoreSubject[] | { data?: StudentProgramScoreSubject[]; items?: StudentProgramScoreSubject[] }>(
        `/api/v1/classes/${classId}/program-subjects`
    )
}

/**
 * Get list of subjects for a training program
 * @param trainingProgramName - Name of the training program
 * @returns List of subjects in the program
 */
export async function getSubjectsByProgram(trainingProgramName: string) {
    return api.get("/api/v1/subjects", { 
        params: { training_program_name: trainingProgramName } 
    })
}

/**
 * Get list of all training programs
 * @returns List of available training programs
 */
export async function getTrainingPrograms() {
    return api.get("/api/v1/training-programs")
}
