import api from '@/lib/api'

interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

export type CompetencyCategory = 'Safety' | 'Technical' | 'Operational'
export type CompetencyStatus = 'Active' | 'Expired' | 'Revoked'

export interface CompetencyDto {
  id: string
  name: string
  description: string
  category: CompetencyCategory
  validityPeriodDays: number
  requiresRenewal: boolean
  createdAt: string
}

export interface UserCompetencyDto {
  id: string
  userId: string
  competencyId: string
  competencyName: string
  achievedAt: string
  expiresAt: string | null
  status: CompetencyStatus
  renewedAt: string | null
}

export interface PrerequisiteRuleDto {
  id: string
  instrumentId: string | null
  competencyId: string
  competencyName: string
}

export interface UnmetPrerequisite {
  competencyName: string
  expiresAt: string | null
  suggestedAction: string
}

export interface PrerequisiteResult {
  isAllowed: boolean
  unmetPrerequisites: UnmetPrerequisite[]
}

export interface CreateCompetencyRequest {
  name: string
  description: string
  category: CompetencyCategory
  validityPeriodDays: number
  requiresRenewal: boolean
}

export interface UpdateCompetencyRequest {
  name: string
  description: string
  category: CompetencyCategory
  validityPeriodDays: number
  requiresRenewal: boolean
}

export interface AssignCompetencyRequest {
  userId: string
  competencyId: string
  achievedAt: string
  expiresAt: string | null
}

export interface CreatePrerequisiteRuleRequest {
  instrumentId: string | null
  competencyId: string
}

export interface ValidatePrerequisitesRequest {
  userId: string
  instrumentId: string | null
}

const BASE = '/api/v1/training'

export async function getCompetencies(category?: CompetencyCategory): Promise<{ items: CompetencyDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<CompetencyDto[]>>(`${BASE}/competencies`, { params: { category } })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function createCompetency(request: CreateCompetencyRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/competencies`, request)
  return data.data
}

export async function updateCompetency(id: string, request: UpdateCompetencyRequest): Promise<void> {
  await api.put(`${BASE}/competencies/${id}`, request)
}

export async function deleteCompetency(id: string): Promise<void> {
  await api.delete(`${BASE}/competencies/${id}`)
}

export async function getUserCompetencies(params?: {
  userId?: string
  competencyId?: string
  status?: CompetencyStatus
}): Promise<{ items: UserCompetencyDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<UserCompetencyDto[]>>(`${BASE}/user-competencies`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function assignCompetency(request: AssignCompetencyRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/user-competencies`, request)
  return data.data
}

export async function renewCompetency(id: string): Promise<void> {
  await api.put(`${BASE}/user-competencies/${id}/renew`)
}

export async function getPrerequisiteRules(instrumentId?: string): Promise<{ items: PrerequisiteRuleDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<PrerequisiteRuleDto[]>>(`${BASE}/prerequisite-rules`, { params: { instrumentId } })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function createPrerequisiteRule(request: CreatePrerequisiteRuleRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/prerequisite-rules`, request)
  return data.data
}

export async function deletePrerequisiteRule(id: string): Promise<void> {
  await api.delete(`${BASE}/prerequisite-rules/${id}`)
}

export async function validatePrerequisites(request: ValidatePrerequisitesRequest): Promise<PrerequisiteResult> {
  const { data } = await api.post<ApiResponseEnvelope<PrerequisiteResult>>(`${BASE}/prerequisites/validate`, request)
  return data.data
}
