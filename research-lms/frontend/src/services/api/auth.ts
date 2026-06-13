import api from '@/lib/api'

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await api.post('/auth/change-password', request)
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/auth/reset-password', { token, newPassword })
}
