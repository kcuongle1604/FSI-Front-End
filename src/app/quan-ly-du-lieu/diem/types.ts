/**
 * Response from score upload API
 */
export interface ScoreImportResponse {
    id: number
    file_name: string
    created_by_id: number
    status: string
    total_processed: number
    success_count: number
    failure_count: number
    error_message: string | null
    created_at: string
}

/**
 * Validation error response
 */
export interface ValidationError {
    loc: (string | number)[]
    msg: string
    type: string
}

export interface ValidationErrorResponse {
    detail: ValidationError[]
}

/**
 * Student score data in matrix format
 */
export interface ScoreCellObject {
    score_id?: number | string
    id?: number | string
    score_4?: number | string | null
    score?: number | string | null
    value?: number | string | null
}

export type ScoreCell = number | string | null | ScoreCellObject

export interface StudentScore {
    student_id: number
    full_name: string
    dob: string
    class_name: string
    scores: Record<string, ScoreCell> // key = subject name, value = score or score object
}

/**
 * Score matrix response from API
 */
export interface ScoreMatrixResponse {
    subjects: string[] // List of subject names
    students: StudentScore[] // List of students with their scores
    total_students: number
    total_subjects: number
}

/**
 * Request body for creating a score
 */
export interface ScoreCreateRequest {
    semester_id: number
    student_id: number
    subject_id: string
    score_4: string
}

/**
 * Response from create score API
 */
export interface ScoreCreateResponse {
    id?: number
    semester_id: number
    student_id: number
    subject_id: string
    score_4: string
    created_at?: string
    updated_at?: string
}

export interface ScoreUpdateRequest {
    student_id?: number
    subject_id?: string
    score_4?: string
}

export interface ScoreDeleteRequest {
    student_id: number
    subject_id: string
}
