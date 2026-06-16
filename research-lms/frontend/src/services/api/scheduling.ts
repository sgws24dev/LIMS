import api from '@/lib/api'

interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

export enum RecurringFrequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  BiWeekly = 'BiWeekly',
  Monthly = 'Monthly',
  Custom = 'Custom',
}

export enum RecurringRuleStatus {
  Active = 'Active',
  Paused = 'Paused',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShow = 'NoShow',
}

export enum ResourceType {
  Instrument = 'Instrument',
  Equipment = 'Equipment',
  Room = 'Room',
  Vehicle = 'Vehicle',
}

export enum WaitlistStatus {
  Waiting = 'Waiting',
  Offered = 'Offered',
  Expired = 'Expired',
  Fulfilled = 'Fulfilled',
  Cancelled = 'Cancelled',
}

export enum ConstraintType {
  MaxBookingDuration = 'MaxBookingDuration',
  MinBookingDuration = 'MinBookingDuration',
  MaxAdvanceBooking = 'MaxAdvanceBooking',
  MinAdvanceBooking = 'MinAdvanceBooking',
  MaxDailyBookings = 'MaxDailyBookings',
  MaxWeeklyBookings = 'MaxWeeklyBookings',
  RequiredCompetency = 'RequiredCompetency',
  RequiredRole = 'RequiredRole',
  TimeOfDayRestriction = 'TimeOfDayRestriction',
}

export enum SlotStatus {
  Available = 'Available',
  Booked = 'Booked',
  Maintenance = 'Maintenance',
  OutsideHours = 'OutsideHours',
}

export interface BookingDto {
  id: string
  resourceId: string
  resourceName: string
  resourceIdentifier: string
  resourceType: ResourceType
  userId: string
  userName: string
  title: string
  startTime: string
  endTime: string
  status: BookingStatus
  purpose?: string
  notes?: string
  cost?: number
  createdAt: string
}

export interface BookingDetailDto extends BookingDto {
  cancelledAt?: string
  cancellationReason?: string
  checkedInAt?: string
  recurringRuleId?: string
  resourceLocation?: string
  facilityName?: string
  statusHistory: Array<{ from: BookingStatus; to: BookingStatus; changedAt: string; reason?: string }>
}

export interface BookingResourceDto {
  resourceId: string
  name: string
  identifier: string
  resourceType: ResourceType
  location?: string
  facilityName?: string
  hourlyRate: number
  isActive: boolean
}

export interface CreateBookingRequest {
  resourceId: string
  resourceType: ResourceType
  title: string
  startTime: string
  endTime: string
  purpose?: string
  notes?: string
}

export interface UpdateBookingRequest {
  title: string
  startTime: string
  endTime: string
  purpose?: string
  notes?: string
}

export interface SlotAvailabilityDto {
  slotStart: string
  slotEnd: string
  status: SlotStatus
  reason?: string
}

export interface OperatingHoursDto {
  resourceId: string
  mondayStart?: string
  mondayEnd?: string
  tuesdayStart?: string
  tuesdayEnd?: string
  wednesdayStart?: string
  wednesdayEnd?: string
  thursdayStart?: string
  thursdayEnd?: string
  fridayStart?: string
  fridayEnd?: string
  saturdayStart?: string
  saturdayEnd?: string
  sundayStart?: string
  sundayEnd?: string
  timezone?: string
  lastSyncedAt?: string
}

export interface UpdateOperatingHoursRequest {
  mondayStart?: string
  mondayEnd?: string
  tuesdayStart?: string
  tuesdayEnd?: string
  wednesdayStart?: string
  wednesdayEnd?: string
  thursdayStart?: string
  thursdayEnd?: string
  fridayStart?: string
  fridayEnd?: string
  saturdayStart?: string
  saturdayEnd?: string
  sundayStart?: string
  sundayEnd?: string
  timezone?: string
}

export interface AddMaintenanceWindowRequest {
  resourceId: string
  startTime: string
  endTime: string
  reason: string
}

export interface ConstraintDto {
  id: string
  resourceId?: string
  resourceType?: ResourceType
  type: ConstraintType
  value: string
  description?: string
  errorMessage?: string
  isActive: boolean
}

export interface CreateConstraintRequest {
  resourceId?: string
  resourceType?: ResourceType
  type: ConstraintType
  value: string
  description?: string
  errorMessage?: string
}

export interface UpdateConstraintRequest {
  value: string
  description?: string
  errorMessage?: string
  isActive: boolean
}

export interface ConstraintEvaluationResult {
  isSatisfied: boolean
  violations: Array<{
    type: ConstraintType
    value: string
    message: string
  }>
}

export interface WaitlistEntryDto {
  id: string
  resourceId: string
  resourceName: string
  resourceType: ResourceType
  userId: string
  userName: string
  requestedDate: string
  requestedStartTime: string
  requestedEndTime: string
  status: WaitlistStatus
  notes?: string
  position: number
  createdAt: string
}

export interface JoinWaitlistRequest {
  resourceId: string
  resourceType: ResourceType
  requestedDate: string
  requestedStartTime: string
  requestedEndTime: string
  notes?: string
}

export interface ConflictDto {
  type: string
  resourceId?: string
  resourceName?: string
  userId?: string
  userName?: string
  startTime: string
  endTime: string
  existingBookingId?: string
  details: string
}

export interface RecurringRuleDto {
  id: string
  tenantId: string
  resourceId: string
  resourceName: string
  resourceType: ResourceType
  userId: string
  userName: string
  title: string
  purpose?: string
  notes?: string
  frequency: RecurringFrequency
  dayOfWeekMask?: number
  timeOfDay: string
  durationMinutes: number
  effectiveFrom: string
  effectiveTo?: string
  maxInstances: number
  status: RecurringRuleStatus
  lastGeneratedDate?: string
  generatedCount: number
  createdAt: string
}

export interface RecurringRuleDetailDto extends RecurringRuleDto {
  upcomingInstances: BookingDto[]
}

export interface RecurringInstancePreviewDto {
  startTime: string
  endTime: string
  hasConflict: boolean
  conflictReason?: string
}

export interface CostBreakdownDto {
  hourlyRate: number
  durationHours: number
  durationLabel: string
  baseAmount: number
  discount: number
  totalAmount: number
  discountReason?: string
  currencySymbol: string
}

export interface CreateRecurringRuleRequest {
  resourceId: string
  title: string
  purpose?: string
  notes?: string
  frequency: RecurringFrequency
  dayOfWeekMask?: number
  timeOfDay: string
  durationMinutes: number
  effectiveFrom: string
  effectiveTo?: string
  maxInstances?: number
}

export interface UpdateRecurringRuleRequest {
  title?: string
  purpose?: string
  notes?: string
  frequency?: RecurringFrequency
  dayOfWeekMask?: number
  timeOfDay?: string
  durationMinutes?: number
  effectiveFrom?: string
  effectiveTo?: string
  maxInstances?: number
  status?: RecurringRuleStatus
}

export interface PreviewRecurringRequest {
  ruleId?: string
  frequency?: RecurringFrequency
  dayOfWeekMask?: number
  timeOfDay?: string
  durationMinutes?: number
  effectiveFrom?: string
  effectiveTo?: string
  previewCount?: number
}

export interface CostEstimateRequest {
  resourceId: string
  startTime: string
  endTime: string
  isRecurring?: boolean
  recurringInstanceCount?: number
}

export interface CheckInRequest {
  bookingId: string
}

const BASE = '/api/v1/scheduling'

export async function getBookings(params?: {
  userId?: string
  resourceId?: string
  resourceType?: ResourceType
  status?: BookingStatus
  from?: string
  to?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<{ items: BookingDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<BookingDto[]>>(`${BASE}/bookings`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function getBookingById(id: string): Promise<BookingDetailDto> {
  const { data } = await api.get<ApiResponseEnvelope<BookingDetailDto>>(`${BASE}/bookings/${id}`)
  return data.data
}

export async function createBooking(request: CreateBookingRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/bookings`, request)
  return data.data
}

export async function updateBooking(id: string, request: UpdateBookingRequest): Promise<void> {
  await api.put(`${BASE}/bookings/${id}`, request)
}

export async function cancelBooking(id: string, reason?: string): Promise<void> {
  await api.post(`${BASE}/bookings/${id}/cancel`, { reason })
}

export async function getResources(params?: {
  query?: string
  type?: ResourceType
  tenantId?: string
}): Promise<BookingResourceDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<BookingResourceDto[]>>(`${BASE}/resources`, { params })
  return data.data
}

export async function getAvailability(resourceId: string, date: string): Promise<SlotAvailabilityDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<SlotAvailabilityDto[]>>(`${BASE}/availability`, {
    params: { resourceId, date }
  })
  return data.data
}

export async function getSlotGrid(
  resourceId: string,
  from: string,
  to: string
): Promise<SlotAvailabilityDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<SlotAvailabilityDto[]>>(`${BASE}/availability/grid`, {
    params: { resourceId, from, to }
  })
  return data.data
}

export async function getOperatingHours(resourceId: string): Promise<OperatingHoursDto> {
  const { data } = await api.get<ApiResponseEnvelope<OperatingHoursDto>>(`${BASE}/availability/operating-hours/${resourceId}`)
  return data.data
}

export async function updateOperatingHours(
  resourceId: string,
  request: UpdateOperatingHoursRequest
): Promise<void> {
  await api.put(`${BASE}/availability/operating-hours/${resourceId}`, request)
}

export async function addMaintenanceWindow(request: AddMaintenanceWindowRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/availability/maintenance-windows`, request)
  return data.data
}

export async function deleteMaintenanceWindow(id: string): Promise<void> {
  await api.delete(`${BASE}/availability/maintenance-windows/${id}`)
}

export async function getConstraints(params?: {
  resourceId?: string
  type?: ConstraintType
}): Promise<ConstraintDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<ConstraintDto[]>>(`${BASE}/constraints`, { params })
  return data.data
}

export async function evaluateConstraints(
  resourceId: string,
  userId: string,
  from: string,
  to: string
): Promise<ConstraintEvaluationResult> {
  const { data } = await api.get<ApiResponseEnvelope<ConstraintEvaluationResult>>(`${BASE}/constraints/evaluate`, {
    params: { resourceId, userId, from, to }
  })
  return data.data
}

export async function createConstraint(request: CreateConstraintRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/constraints`, request)
  return data.data
}

export async function updateConstraint(id: string, request: UpdateConstraintRequest): Promise<void> {
  await api.put(`${BASE}/constraints/${id}`, request)
}

export async function deleteConstraint(id: string): Promise<void> {
  await api.delete(`${BASE}/constraints/${id}`)
}

export async function getWaitlist(params?: {
  resourceId?: string
  status?: WaitlistStatus
  page?: number
  pageSize?: number
}): Promise<{ items: WaitlistEntryDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<WaitlistEntryDto[]>>(`${BASE}/waitlist`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function getWaitlistPosition(id: string): Promise<number> {
  const { data } = await api.get<ApiResponseEnvelope<{ position: number }>>(`${BASE}/waitlist/${id}/position`)
  return data.data.position
}

export async function joinWaitlist(request: JoinWaitlistRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/waitlist`, request)
  return data.data
}

export async function leaveWaitlist(id: string): Promise<void> {
  await api.delete(`${BASE}/waitlist/${id}`)
}

export async function getResourceConflicts(
  from: string,
  to: string,
  resourceId?: string
): Promise<ConflictDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<ConflictDto[]>>(`${BASE}/conflicts`, {
    params: { resourceId, from, to }
  })
  return data.data
}

export async function getUserConflicts(
  userId: string,
  from: string,
  to: string
): Promise<ConflictDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<ConflictDto[]>>(`${BASE}/conflicts/user`, {
    params: { userId, from, to }
  })
  return data.data
}

// ── Sprint 4: Calendar Sync ──

export enum SyncProvider {
  Outlook365 = 'Outlook365',
  GoogleCalendar = 'GoogleCalendar',
}

export interface CalendarConnectionDto {
  id: string
  provider: SyncProvider
  isConnected: boolean
  syncDirection: string
  lastSyncAt?: string
  externalCalendarId?: string
}

export interface CalendarSyncStatusDto {
  connections: CalendarConnectionDto[]
  hasOutlookConnection: boolean
  hasGoogleConnection: boolean
  outlookLastSync?: string
  googleLastSync?: string
}

export interface SyncLogDto {
  id: string
  provider: SyncProvider
  direction: string
  status: string
  eventsCreated: number
  eventsUpdated: number
  eventsDeleted: number
  errorMessage?: string
  syncedAt: string
}

export interface TrainerAvailabilityDto {
  id: string
  userId: string
  userName: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isAvailable: boolean
  effectiveFrom: string
  effectiveTo?: string
  source: string
  notes?: string
}

export interface AddTrainerAvailabilityRequest {
  dayOfWeek: string
  startTime: string
  endTime: string
  isAvailable: boolean
  effectiveFrom?: string
  effectiveTo?: string
  notes?: string
}

export interface UpdateTrainerAvailabilityRequest {
  startTime: string
  endTime: string
  isAvailable: boolean
  effectiveTo?: string
  notes?: string
}

export interface MyBookingStatsDto {
  upcomingCount: number
  monthlySpend: number
  monthlyHours: number
}

export async function getCalendarSyncStatus(): Promise<CalendarSyncStatusDto> {
  const { data } = await api.get<ApiResponseEnvelope<CalendarSyncStatusDto>>(`${BASE}/calendar-sync/status`)
  return data.data
}

export async function getSyncLogs(page = 1, pageSize = 20): Promise<SyncLogDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<SyncLogDto[]>>(`${BASE}/calendar-sync/logs`, { params: { page, pageSize } })
  return data.data
}

export async function connectCalendar(code: string, redirectUri: string): Promise<void> {
  await api.post(`${BASE}/calendar-sync/callback`, { code, redirectUri })
}

export async function disconnectCalendar(provider: string): Promise<void> {
  await api.delete(`${BASE}/calendar-sync/disconnect`, { params: { provider } })
}

export async function triggerManualSync(provider: string): Promise<void> {
  await api.post(`${BASE}/calendar-sync/sync`, null, { params: { provider } })
}

export async function getTrainerAvailability(weekStartDate?: string): Promise<TrainerAvailabilityDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<TrainerAvailabilityDto[]>>(`${BASE}/trainer-availability`, {
    params: weekStartDate ? { weekStartDate } : undefined,
  })
  return data.data
}

export async function addTrainerAvailability(request: AddTrainerAvailabilityRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/trainer-availability`, request)
  return data.data
}

export async function updateTrainerAvailability(id: string, request: UpdateTrainerAvailabilityRequest): Promise<void> {
  await api.put(`${BASE}/trainer-availability/${id}`, request)
}

export async function deleteTrainerAvailability(id: string): Promise<void> {
  await api.delete(`${BASE}/trainer-availability/${id}`)
}

export async function getMyBookingStats(): Promise<MyBookingStatsDto> {
  const { data } = await api.get<ApiResponseEnvelope<MyBookingStatsDto>>(`${BASE}/bookings/my-stats`)
  return data.data
}

export async function getCostEstimate(request: CostEstimateRequest): Promise<CostBreakdownDto> {
  const { data } = await api.get<ApiResponseEnvelope<CostBreakdownDto>>(`${BASE}/bookings/cost-estimate`, {
    params: {
      resourceId: request.resourceId,
      from: request.startTime,
      to: request.endTime,
      isRecurring: request.isRecurring ?? false,
      instanceCount: request.recurringInstanceCount,
    }
  })
  return data.data
}

export async function checkInBooking(bookingId: string): Promise<void> {
  await api.post(`${BASE}/bookings/${bookingId}/check-in`)
}

export async function getRecurringRules(params?: {
  status?: RecurringRuleStatus
  resourceId?: string
  page?: number
  pageSize?: number
}): Promise<{ items: RecurringRuleDto[]; totalCount: number }> {
  const { data } = await api.get<ApiResponseEnvelope<RecurringRuleDto[]>>(`${BASE}/recurring-rules`, { params })
  return { items: data.data, totalCount: data.totalCount ?? 0 }
}

export async function getRecurringRuleById(id: string): Promise<RecurringRuleDetailDto> {
  const { data } = await api.get<ApiResponseEnvelope<RecurringRuleDetailDto>>(`${BASE}/recurring-rules/${id}`)
  return data.data
}

export async function createRecurringRule(request: CreateRecurringRuleRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`${BASE}/recurring-rules`, request)
  return data.data
}

export async function updateRecurringRule(id: string, request: UpdateRecurringRuleRequest): Promise<void> {
  await api.put(`${BASE}/recurring-rules/${id}`, request)
}

export async function deleteRecurringRule(id: string): Promise<void> {
  await api.delete(`${BASE}/recurring-rules/${id}`)
}

export async function previewRecurringInstances(request: PreviewRecurringRequest): Promise<RecurringInstancePreviewDto[]> {
  const { data } = await api.post<ApiResponseEnvelope<RecurringInstancePreviewDto[]>>(`${BASE}/recurring-rules/preview`, request)
  return data.data
}

export async function getRecurringPreviewByRuleId(ruleId: string, previewCount?: number): Promise<RecurringInstancePreviewDto[]> {
  const { data } = await api.get<ApiResponseEnvelope<RecurringInstancePreviewDto[]>>(`${BASE}/recurring-rules/${ruleId}/preview`, {
    params: previewCount ? { previewCount } : undefined
  })
  return data.data
}
