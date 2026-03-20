/**
 * Example of how to use the uploadScores API function
 */

import { uploadScores } from './score.api'

async function handleScoreUpload(file: File) {
    try {
        const response = await uploadScores(file)

        if (response.data.error_message) {
            console.error('Error:', response.data.error_message)
        }

        return response.data
    } catch (error: any) {
        if (error.response?.status === 422) {
            console.error('Validation errors:', error.response.data.detail)
        } else {
            console.error('Upload failed:', error.message)
        }
        throw error
    }
}

// Example usage:
// const fileInput = document.getElementById('csvFile') as HTMLInputElement
// if (fileInput.files?.[0]) {
//   await handleScoreUpload(fileInput.files[0])
// }
