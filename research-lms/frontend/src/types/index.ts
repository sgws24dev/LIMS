export type UserRole = "institution_admin" | "facility_admin" | "lab_admin" | "principal_investigator" | "trainer" | "researcher" | "student" | "technician" | "billing_admin"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string
  avatarUrl?: string
  role: UserRole[]
  isActive: boolean
  isMfaEnabled: boolean
  lastLoginAt?: string
  tenantId: string
  createdAt: string
}

export interface Role {
  id: string
  name: string
  description: string
  permissions: Permission[]
  isSystem: boolean
  userCount?: number
}

export interface Permission {
  module: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export interface Tenant {
  id: string
  name: string
  code: string
  domain?: string
  logoUrl?: string
  subscriptionPlan: string
  isActive: boolean
  contactEmail?: string
  createdAt: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}
