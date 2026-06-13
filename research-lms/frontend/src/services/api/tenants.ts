import api from '@/lib/api'
import type { Tenant, PagedResult } from '@/types'

export interface CreateTenantRequest {
  name: string
  code: string
  domain?: string
  contactEmail?: string
  subscriptionPlan?: string
}

export interface UpdateTenantRequest {
  name: string
  code: string
  domain?: string
  contactEmail?: string
  subscriptionPlan?: string
  isActive?: boolean
}

export async function getTenants(): Promise<Tenant[]> {
  const { data } = await api.get('/tenants')
  return data
}

export async function getTenantById(id: string): Promise<Tenant> {
  const { data } = await api.get(`/tenants/${id}`)
  return data
}

export async function createTenant(request: CreateTenantRequest): Promise<Tenant> {
  const { data } = await api.post('/tenants', request)
  return data
}

export async function updateTenant(id: string, request: UpdateTenantRequest): Promise<Tenant> {
  const { data } = await api.put(`/tenants/${id}`, request)
  return data
}

export async function deleteTenant(id: string): Promise<void> {
  await api.delete(`/tenants/${id}`)
}
