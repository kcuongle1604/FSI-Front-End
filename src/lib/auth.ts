import { api } from "@/lib/api"

export interface LoginResponse {
  access_token: string
  token_type: string
}

/**
 * Login using OAuth2PasswordRequestForm (FastAPI)
 * BE expects:
 * - Content-Type: application/x-www-form-urlencoded
 * - username
 * - password
 * Returns:
 * - access_token: JWT token
 * - token_type: "bearer"
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const formData = new URLSearchParams()
  formData.append("username", email)   // ⚠️ PHẢI là username
  formData.append("password", password)

  const response = await api.post<LoginResponse>(
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


