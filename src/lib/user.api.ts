import { api } from "@/lib/api"

export interface Role {
    role_id: number
    name: string
    is_superuser: boolean
}

export interface User {
  user_id: number
  username: string
  email: string
  role: Role
  is_active: boolean
}

export interface UserCreateRequest {
  username: string
  email: string
  password: string
  role_id?: number
  //assignedClasses?: string[]
}

export interface UserUpdateRequest {
  username?: string
  email?: string
  password?: string
  role_id?: number
  is_active?: boolean
}

export interface UserStatusUpdateRequest {
  is_active: boolean
}

/**
 * Get list of users
 */
export async function getUsers(params?: {
  skip?: number
  limit?: number
  search?: string
  role?: string
}) {
  return api.get<User[]>("/api/v1/users", { params })
}

export async function getUserMe() {
  return api.get<User>("/api/v1/users/me")
}

/**
 * Get user detail by ID
 */
export async function getUserDetail(userId: number) {
  return api.get<User>(`/api/v1/users/${userId}`)
}

/**
 * Create new user
 */
export async function createUser(data: UserCreateRequest) {
  return api.post<User>("/api/v1/users", data)
}

export async function updateUserMe(data: UserUpdateRequest) {
  return api.put<User>("/api/v1/users/me", data)
}

export async function updateUserMePassword(data: { current_password: string; new_password: string }) {
  return api.post("/api/v1/users/me/password", data)
}

/**
 * Update user
 */
export async function updateUser(userId: number, data: UserUpdateRequest) {
  return api.put<User>(`/api/v1/users/${userId}`, data)
}

/**
 * Update user status
 */
export async function updateUserStatus(
  userId: number,
  data: UserStatusUpdateRequest
) {
  return api.patch<User>(`/api/v1/users/${userId}/status`, data)
}

/**
 * Delete user
 */
export async function deleteUser(userId: number) {
  return api.delete<{ message: string }>(`/api/v1/users/${userId}`)
}
