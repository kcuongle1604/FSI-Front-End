import { api } from "@/lib/api"
import { getClasses as getClassesFromStudent } from "../sinh-vien/student.api"
import type { ScoreImportResponse, ScoreMatrixResponse } from "./types"

/**
 * Upload scores from CSV file
 * @param file - CSV file containing score data
 * @returns Upload job information
 */
export async function uploadScores(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    console.log('🚀 Uploading scores to:', api.defaults.baseURL + '/api/v1/upload-scores')
    console.log('📁 File:', file.name, 'Size:', file.size, 'bytes')

    try {
        const response = await api.post<ScoreImportResponse>("/api/v1/upload-scores", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        console.log('✅ Upload successful:', response.data)
        return response
    } catch (error: any) {
        console.error('❌ Upload failed:')
        console.error('- Error message:', error.message)
        console.error('- Error code:', error.code)
        console.error('- Response status:', error.response?.status)
        console.error('- Response data:', error.response?.data)
        console.error('- Request URL:', error.config?.url)
        console.error('- Base URL:', error.config?.baseURL)
        throw error
    }
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
