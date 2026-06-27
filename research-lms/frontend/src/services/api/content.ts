import api from '@/lib/api'

export interface HelpCategoryDto {
  id: string
  name: string
  slug: string
  sortOrder: number
  parentCategoryId: string | null
}

export interface HelpArticleDto {
  id: string
  title: string
  slug: string
  content: string
  categoryId: string
  tags: string[]
  isPublished: boolean
  viewCount: number
  createdAt: string
}

export interface WalkthroughStepDto {
  id: string
  stepOrder: number
  title: string
  content: string
  elementSelector: string | null
  placement: string
  actionType: string
}

export interface WalkthroughDto {
  id: string
  name: string
  targetRoute: string
  trigger: string
  priority: number
  isActive: boolean
  steps: WalkthroughStepDto[]
}

export interface CreateHelpCategoryRequest {
  name: string
  slug: string
  sortOrder: number
  parentCategoryId: string | null
}

export interface CreateHelpArticleRequest {
  title: string
  content: string
  categoryId: string
  tags: string[]
  isPublished: boolean
}

export interface WalkthroughStepRequest {
  stepOrder: number
  title: string
  content: string
  elementSelector: string | null
  placement: string
  actionType: string
}

export interface CreateWalkthroughRequest {
  name: string
  targetRoute: string
  trigger: string
  priority: number
  isActive: boolean
  steps: WalkthroughStepRequest[]
}

export interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

const BASE = '/api/v1/content'

// Help Articles
export async function searchHelpArticles(params?: {
  searchTerm?: string
  categoryId?: string
  tags?: string
  publishedOnly?: boolean
}): Promise<HelpArticleDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<HelpArticleDto[]>>(`${BASE}/help-articles`, { params })
  return data.data
}

export async function getHelpArticleBySlug(slug: string): Promise<HelpArticleDto> {
  const { data } = await api.get<ApiResponseEnvelope<HelpArticleDto>>(`${BASE}/help-articles/${slug}`)
  return data.data
}

export async function createHelpArticle(request: CreateHelpArticleRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/help-articles`, request)
  return data.data
}

export async function updateHelpArticle(id: string, request: CreateHelpArticleRequest): Promise<void> {
  await api.put(`${BASE}/help-articles/${id}`, request)
}

export async function deleteHelpArticle(id: string): Promise<void> {
  await api.delete(`${BASE}/help-articles/${id}`)
}

// Help Categories
export async function getHelpCategories(): Promise<HelpCategoryDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<HelpCategoryDto[]>>(`${BASE}/help-categories`)
  return data.data
}

export async function createHelpCategory(request: CreateHelpCategoryRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/help-categories`, request)
  return data.data
}

export async function updateHelpCategory(id: string, request: CreateHelpCategoryRequest): Promise<void> {
  await api.put(`${BASE}/help-categories/${id}`, request)
}

export async function deleteHelpCategory(id: string): Promise<void> {
  await api.delete(`${BASE}/help-categories/${id}`)
}

// Walkthroughs
export async function getActiveWalkthroughs(route: string): Promise<WalkthroughDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<WalkthroughDto[]>>(`${BASE}/walkthroughs/active`, { params: { route } })
  return data.data
}

export async function createWalkthrough(request: CreateWalkthroughRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/walkthroughs`, request)
  return data.data
}

export async function updateWalkthrough(id: string, request: CreateWalkthroughRequest): Promise<void> {
  await api.put(`${BASE}/walkthroughs/${id}`, request)
}

export async function completeWalkthrough(id: string): Promise<void> {
  await api.post(`${BASE}/walkthroughs/${id}/complete`)
}

export async function skipWalkthrough(id: string): Promise<void> {
  await api.post(`${BASE}/walkthroughs/${id}/skip`)
}

export interface WalkthroughProgressDto {
  walkthroughId: string
  currentStepIndex: number | null
  status: string
}

export async function saveWalkthroughProgress(id: string, currentStepIndex: number): Promise<void> {
  await api.post(`${BASE}/walkthroughs/${id}/progress`, { currentStepIndex })
}

export async function getWalkthroughProgress(id: string): Promise<WalkthroughProgressDto> {
  const { data } = await api.get<ApiResponseEnvelope<WalkthroughProgressDto>>(`${BASE}/walkthroughs/${id}/progress`)
  return data.data
}

// Publications
export interface PublicationDto {
  id: string
  title: string
  authors: string[]
  journal: string | null
  doi: string | null
  pmId: string | null
  publicationDate: string | null
  type: string
  link: string | null
  abstract: string | null
  attachments: string[]
  isVerified: boolean
  createdAt: string
}

export interface CreatePublicationRequest {
  title: string
  authors: string[]
  journal: string | null
  doi: string | null
  pmId: string | null
  publicationDate: string | null
  type: string
  link: string | null
  abstract: string | null
  isVerified: boolean
  instrumentIds: string[] | null
}

export async function searchPublications(params?: {
  searchTerm?: string
  type?: string
  author?: string
  year?: number
  journal?: string
}): Promise<PublicationDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<PublicationDto[]>>(`${BASE}/publications`, { params })
  return data.data
}

export async function getPublicationById(id: string): Promise<PublicationDto> {
  const { data } = await api.get<ApiResponseEnvelope<PublicationDto>>(`${BASE}/publications/${id}`)
  return data.data
}

export async function createPublication(request: CreatePublicationRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/publications`, request)
  return data.data
}

export async function updatePublication(id: string, request: CreatePublicationRequest): Promise<void> {
  await api.put(`${BASE}/publications/${id}`, request)
}

export async function deletePublication(id: string): Promise<void> {
  await api.delete(`${BASE}/publications/${id}`)
}

export async function searchDoi(doi: string): Promise<CreatePublicationRequest | null> {
  try {
    const { data } = await api.get<ApiResponseEnvelope<CreatePublicationRequest>>(`${BASE}/publications/search-doi`, { params: { doi } })
    return data.data
  } catch {
    return null
  }
}

// Homepage
export interface HomepageDto {
  id: string
  name: string
  isActive: boolean
  layoutJson: string
}

export interface SaveHomepageRequest {
  name: string
  isActive: boolean
  layoutJson: string
}

export async function getActiveHomepage(): Promise<HomepageDto> {
  const { data } = await api.get<ApiResponseEnvelope<HomepageDto>>(`${BASE}/homepage`)
  return data.data
}

export async function saveHomepage(request: SaveHomepageRequest): Promise<void> {
  await api.put(`${BASE}/homepage`, request)
}
