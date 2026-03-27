import { api } from "@/lib/api"
import { getClasses as getClassesFromStudent } from "../sinh-vien/student.api"
import type { ScoreImportResponse, ScoreMatrixResponse } from "./types"

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
