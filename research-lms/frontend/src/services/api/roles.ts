import api from '@/lib/api'
import type { Role } from '@/types'

export interface PermissionDto {
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: PermissionDto[]
}

export interface UpdateRoleRequest {
  name: string
  description?: string
  permissions: PermissionDto[]
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await api.get('/roles')
  return data
}

export async function getRoleById(id: string): Promise<Role> {
  const { data } = await api.get(`/roles/${id}`)
  return data
}

export async function createRole(request: CreateRoleRequest): Promise<Role> {
  const { data } = await api.post('/roles', request)
  return data
}

export async function updateRole(id: string, request: UpdateRoleRequest): Promise<Role> {
  const { data } = await api.put(`/roles/${id}`, request)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`)
}
