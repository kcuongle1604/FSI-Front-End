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
export interface StudentScore {
    student_id: number
    full_name: string
    dob: string
    class_name: string
    scores: Record<string, number | null> // key = subject name, value = score
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
