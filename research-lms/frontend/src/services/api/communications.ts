import api from '@/lib/api'

interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

export interface NotificationDto {
  id: string
  userId: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
}

export interface NotificationPreferenceDto {
  id: string
  notificationType: string
  channels: string[]
  isOptedOut: boolean
}

export interface NotificationTemplateDto {
  id: string
  name: string
  channel: string
  subject: string
  body: string
  isDefault: boolean
  createdAt: string
}

export interface AnnouncementDto {
  id: string
  title: string
  body: string
  priority: string
  targetAudience: string | null
  validFrom: string
  validTo: string
  createdAt: string
}

export interface UpdateNotificationPreferencesRequest {
  notificationType: string
  channels: string[]
  isOptedOut: boolean
}

export interface UpdateTemplateRequest {
  name: string
  channel: string
  subject: string
  body: string
  isDefault: boolean
}

export interface CreateAnnouncementRequest {
  title: string
  body: string
  priority: string
  targetAudience: string | null
  validFrom: string
  validTo: string
}

export interface SendTestTemplateRequest {
  email?: string
  phoneNumber?: string
  webhookUrl?: string
}

const BASE = '/api/v1/communications'

// Notifications
export async function getNotifications(params?: { unreadOnly?: boolean; type?: string; page?: number; pageSize?: number }): Promise<{ items: NotificationDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<NotificationDto[]>>(`${BASE}/notifications`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await api.get<ApiResponseEnvelope<number>>(`${BASE}/notifications/unread-count`)
  return data.data
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.put(`${BASE}/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post(`${BASE}/notifications/read-all`)
}

// Preferences
export async function getNotificationPreferences(): Promise<{ items: NotificationPreferenceDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<NotificationPreferenceDto[]>>(`${BASE}/notifications/preferences`)
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function updateNotificationPreferences(request: UpdateNotificationPreferencesRequest): Promise<void> {
  await api.put(`${BASE}/notifications/preferences`, request)
}

// Templates
export async function getNotificationTemplates(): Promise<{ items: NotificationTemplateDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<NotificationTemplateDto[]>>(`${BASE}/notifications/templates`)
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function updateNotificationTemplate(id: string, request: UpdateTemplateRequest): Promise<void> {
  await api.put(`${BASE}/notifications/templates/${id}`, request)
}

export async function sendTestNotification(id: string, request: SendTestTemplateRequest): Promise<void> {
  await api.post(`${BASE}/notifications/templates/${id}/test`, request)
}

// Announcements
export async function getAnnouncements(params?: { audience?: string; minPriority?: string; from?: string; to?: string }): Promise<{ items: AnnouncementDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<AnnouncementDto[]>>(`${BASE}/announcements`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function createAnnouncement(request: CreateAnnouncementRequest): Promise<string> {
  const { data } = await api.post<ApiResponseEnvelope<string>>(`${BASE}/announcements`, request)
  return data.data
}

export async function updateAnnouncement(id: string, request: CreateAnnouncementRequest): Promise<void> {
  await api.put(`${BASE}/announcements/${id}`, request)
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await api.delete(`${BASE}/announcements/${id}`)
}
