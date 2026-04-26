/**
 * Example of how to use the uploadScores API function
 */

import { uploadScores } from './score.api'

async function handleScoreUpload(file: File) {
    try {
        const uploadDate = new Date().toISOString().split("T")[0] // Replace with selected date from UI
        const classId = 1 // Replace with selected class ID from UI
        const response = await uploadScores(file, uploadDate)

        if (response.data.error_message) {
            throw new Error(response.data.error_message)
        }

        return response.data
    } catch (error: any) {
        if (error.response?.status === 422) {
            const detail = error.response.data.detail
            throw new Error(Array.isArray(detail) ? detail.map((item: any) => item?.msg || String(item)).join(", ") : "Validation errors")
        }

        throw new Error(error.response?.data?.detail || error.message || "Upload failed")
    }
}

// Example usage:
// const fileInput = document.getElementById('csvFile') as HTMLInputElement
// if (fileInput.files?.[0]) {
//   await handleScoreUpload(fileInput.files[0])
// }
