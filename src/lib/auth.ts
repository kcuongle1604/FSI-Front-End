import { api } from "@/lib/api"

/**
 * Login using OAuth2PasswordRequestForm (FastAPI)
 * BE expects:
 * - Content-Type: application/x-www-form-urlencoded
 * - username
 * - password
 */
export async function login(email: string, password: string) {
  const formData = new URLSearchParams()
  formData.append("username", email)   // ⚠️ PHẢI là username
  formData.append("password", password)

  const response = await api.post(
    "/api/v1/login/access-token",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  return response.data
}


