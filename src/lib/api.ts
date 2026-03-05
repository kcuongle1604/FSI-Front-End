import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_URL,
})

// Log API configuration in development
if (process.env.NODE_ENV === "development") {
  console.log("🔧 API Configuration:", {
    baseURL: API_URL,
    env: process.env.NEXT_PUBLIC_API_URL ? "from .env.local" : "default",
  })
}

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status) {
      console.error(`API Error ${error.response.status}:`, error.config?.url)
    }
    return Promise.reject(error)
  }
)