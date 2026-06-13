import api from '@/lib/api'
import type { User, PagedResult } from '@/types'

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  phone?: string
  roleIds: string[]
}

export interface UpdateUserRequest {
  firstName: string
  lastName: string
  phone?: string
  roleIds: string[]
  isActive?: boolean
}

export async function getUsers(params?: { page?: number; pageSize?: number; search?: string }): Promise<PagedResult<User>> {
  const { data } = await api.get('/users', { params })
  return data
}

export async function getUserById(id: string): Promise<User> {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function createUser(request: CreateUserRequest): Promise<User> {
  const { data } = await api.post('/users', request)
  return data
}

export async function updateUser(id: string, request: UpdateUserRequest): Promise<User> {
  const { data } = await api.put(`/users/${id}`, request)
  return data
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/users/${id}`)
}
