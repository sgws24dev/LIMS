import api from '@/lib/api'

export interface Facility {
  id: string
  tenantId: string
  name: string
  type: string
  location?: string
  isActive: boolean
  createdAt: string
}

export interface CreateFacilityRequest {
  name: string
  type: string
  location?: string
}

export interface UpdateFacilityRequest {
  name: string
  type: string
  location?: string
  isActive: boolean
}

export interface Room {
  id: string
  facilityId: string
  name: string
  roomNumber?: string
  capacity: number
  roomType?: string
  utilization: number
  createdAt: string
}

export interface PagedResponse<T> {
  items: T[]
  totalCount: number
}

export async function getFacilities(params?: { search?: string; type?: string; page?: number; pageSize?: number }): Promise<PagedResponse<Facility>> {
  const { data } = await api.get('/facilities', { params })
  return data
}

export async function getFacilityById(id: string): Promise<Facility> {
  const { data } = await api.get(`/facilities/${id}`)
  return data
}

export async function createFacility(request: CreateFacilityRequest): Promise<Facility> {
  const { data } = await api.post('/facilities', request)
  return data
}

export async function updateFacility(id: string, request: UpdateFacilityRequest): Promise<Facility> {
  const { data } = await api.put(`/facilities/${id}`, request)
  return data
}

export async function deleteFacility(id: string): Promise<void> {
  await api.delete(`/facilities/${id}`)
}

export async function getRoomsByFacility(facilityId: string): Promise<Room[]> {
  const { data } = await api.get(`/facilities/${facilityId}/rooms`)
  return data
}

// --- Asset Types ---

export interface Asset {
  id: string
  name: string
  identifier: string
  category: string
  assetType: string
  status: string
  facilityId: string
  facilityName?: string
  location?: string
  currentValue?: number
  qrCode?: string
}

export interface AssetDetail extends Asset {
  tenantId: string
  model?: string
  manufacturer?: string
  acquisitionDate?: string
  acquisitionCost?: number
  salvageValue?: number
  usefulLifeYears?: number
  depreciationMethod?: string
  customFields: Record<string, string>
  rfidTag?: string
  createdAt: string
  updatedAt?: string
  ipAddress?: string
  port?: number
  connectionProtocol?: string
  firmware?: string
  lastCalibrationDate?: string
  nextCalibrationDate?: string
  maintenanceIntervalDays?: number
  iotEnabled: boolean
}

export interface CreateAssetRequest {
  name: string
  identifier: string
  category: string
  facilityId: string
  model?: string
  manufacturer?: string
  acquisitionDate?: string
  acquisitionCost?: number
  salvageValue?: number
  usefulLifeYears?: number
  depreciationMethod?: string
  location?: string
  customFields?: Record<string, string>
  qrCode?: string
  rfidTag?: string
  ipAddress?: string
  port?: number
  connectionProtocol?: string
  firmware?: string
  lastCalibrationDate?: string
  nextCalibrationDate?: string
  maintenanceIntervalDays?: number
  iotEnabled?: boolean
}

export interface UpdateAssetRequest {
  name: string
  model?: string
  manufacturer?: string
  acquisitionDate?: string
  acquisitionCost?: number
  salvageValue?: number
  usefulLifeYears?: number
  depreciationMethod?: string
  location?: string
  customFields?: Record<string, string>
  qrCode?: string
  rfidTag?: string
  ipAddress?: string
  port?: number
  connectionProtocol?: string
  firmware?: string
  lastCalibrationDate?: string
  nextCalibrationDate?: string
  maintenanceIntervalDays?: number
  iotEnabled?: boolean
}

interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

// --- Asset API ---

export async function getAssets(params?: {
  search?: string; category?: string; status?: string;
  facilityId?: string; page?: number; pageSize?: number
}): Promise<PagedResponse<Asset>> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: Asset[]; totalCount: number }>>('/assets', { params })
  return { items: data.data.items, totalCount: data.totalCount ?? data.data.totalCount }
}

export async function getAssetById(id: string): Promise<AssetDetail> {
  const { data } = await api.get<ApiResponseEnvelope<AssetDetail>>(`/assets/${id}`)
  return data.data
}

export async function createAsset(request: CreateAssetRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>('/assets', request)
  return data.data
}

export async function updateAsset(id: string, request: UpdateAssetRequest): Promise<void> {
  await api.put(`/assets/${id}`, request)
}

export async function decommissionAsset(id: string, reason?: string): Promise<void> {
  await api.patch(`/assets/${id}/decommission`, reason)
}

export async function deleteAsset(id: string): Promise<void> {
  await api.delete(`/assets/${id}`)
}

export async function searchAssets(params?: {
  q?: string; category?: string; status?: string;
  facilityId?: string; location?: string;
  customFieldKey?: string; customFieldValue?: string;
  page?: number; pageSize?: number
}): Promise<PagedResponse<Asset>> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: Asset[]; totalCount: number }>>('/assets/search', { params })
  return { items: data.data.items, totalCount: data.totalCount ?? data.data.totalCount }
}

// --- Depreciation ---

export interface DepreciationEntry {
  year: number
  bookValue: number
  depreciationAmount: number
  periodEnd: string
}

export async function getDepreciationSchedule(id: string): Promise<DepreciationEntry[]> {
  const { data } = await api.get<ApiResponseEnvelope<DepreciationEntry[]>>(`/assets/${id}/depreciation-schedule`)
  return data.data
}

export async function recalculateDepreciation(id: string): Promise<void> {
  await api.patch(`/assets/${id}/recalculate-depreciation`)
}

// --- Instrument Config ---

export interface InstrumentConfigResponse {
  ipAddress?: string
  port?: number
  connectionProtocol?: string
  firmware?: string
  maintenanceIntervalDays?: number
  iotEnabled: boolean
  metricKeys: string[]
}

export interface InstrumentConfigRequest {
  ipAddress?: string
  port?: number
  connectionProtocol?: string
  firmware?: string
  maintenanceIntervalDays?: number
  iotEnabled: boolean
  metricKeys?: string[]
}

export async function getInstrumentConfig(id: string): Promise<InstrumentConfigResponse> {
  const { data } = await api.get<ApiResponseEnvelope<InstrumentConfigResponse>>(`/assets/${id}/instrument-config`)
  return data.data
}

export async function updateInstrumentConfig(id: string, request: InstrumentConfigRequest): Promise<void> {
  await api.put(`/assets/${id}/instrument-config`, request)
}

// --- Maintenance ---

export interface MaintenanceRecord {
  id: string
  assetId: string
  assetName: string
  type: string
  scheduledDate: string
  completedDate?: string
  status: string
  technicianName?: string
  cost?: number
}

export interface MaintenanceCalendarEvent {
  id: string
  title: string
  scheduledDate: string
  status: string
  assetId: string
  color: string
}

export interface WorkOrder {
  id: string
  maintenanceRecordId: string
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  priority: string
  status: string
  dueDate?: string
  resolvedDate?: string
  resolutionNotes?: string
}

export interface CreateMaintenanceRequest {
  assetId: string
  type: string
  scheduledDate: string
  description?: string
  notes?: string
  cost?: number
  technicianName?: string
}

export interface CreateWorkOrderRequest {
  title: string
  description?: string
  assigneeId?: string
  assigneeName?: string
  priority: string
  dueDate?: string
}

export async function getMaintenanceRecords(params?: {
  assetId?: string; status?: string; dateFrom?: string; dateTo?: string;
  page?: number; pageSize?: number
}): Promise<PagedResponse<MaintenanceRecord>> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: MaintenanceRecord[]; totalCount: number }>>('/maintenance', { params })
  return { items: data.data.items, totalCount: data.totalCount ?? data.data.totalCount }
}

export async function getMaintenanceCalendar(month: number, year: number, facilityId?: string): Promise<MaintenanceCalendarEvent[]> {
  const { data } = await api.get<ApiResponseEnvelope<MaintenanceCalendarEvent[]>>('/maintenance/calendar', { params: { month, year, facilityId } })
  return data.data
}

export async function getMaintenanceById(id: string): Promise<MaintenanceRecord> {
  const { data } = await api.get<ApiResponseEnvelope<MaintenanceRecord>>(`/maintenance/${id}`)
  return data.data
}

export async function createMaintenance(request: CreateMaintenanceRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>('/maintenance', request)
  return data.data
}

export async function updateMaintenance(id: string, request: Partial<CreateMaintenanceRequest>): Promise<void> {
  await api.put(`/maintenance/${id}`, request)
}

export async function completeMaintenance(id: string, request: { completedDate: string; notes?: string; cost?: number }): Promise<void> {
  await api.patch(`/maintenance/${id}/complete`, request)
}

export async function getWorkOrders(maintenanceRecordId: string): Promise<WorkOrder[]> {
  const { data } = await api.get<ApiResponseEnvelope<WorkOrder[]>>(`/maintenance/${maintenanceRecordId}/work-orders`)
  return data.data
}

export async function createWorkOrder(maintenanceRecordId: string, request: CreateWorkOrderRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>(`/maintenance/${maintenanceRecordId}/work-orders`, request)
  return data.data
}

export async function updateWorkOrder(workOrderId: string, request: Partial<CreateWorkOrderRequest>): Promise<void> {
  await api.put(`/maintenance/work-orders/${workOrderId}`, request)
}

export async function resolveWorkOrder(workOrderId: string, resolutionNotes?: string): Promise<void> {
  await api.patch(`/maintenance/work-orders/${workOrderId}/resolve`, { resolutionNotes })
}

// --- Calibration ---

export interface CalibrationRecord {
  id: string
  instrumentId: string
  instrumentName?: string
  calibrationDate: string
  nextDueDate: string
  performedBy: string
  performedByOrganization?: string
  certificateRef?: string
  status: string
  notes?: string
}

export interface CalibrationSummary {
  dueSoonCount: number
  expiredCount: number
  validCount: number
  totalCount: number
}

export interface CreateCalibrationRequest {
  instrumentId: string
  calibrationDate: string
  nextDueDate: string
  performedBy: string
  performedByOrganization?: string
  certificateRef?: string
  notes?: string
}

export async function getCalibrationRecords(params?: {
  instrumentId?: string; status?: string; page?: number; pageSize?: number
}): Promise<PagedResponse<CalibrationRecord>> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: CalibrationRecord[]; totalCount: number }>>('/calibration', { params })
  return { items: data.data.items, totalCount: data.totalCount ?? data.data.totalCount }
}

export async function getCalibrationSummary(): Promise<CalibrationSummary> {
  const { data } = await api.get<ApiResponseEnvelope<CalibrationSummary>>('/calibration/summary')
  return data.data
}

export async function getCalibrationById(id: string): Promise<CalibrationRecord> {
  const { data } = await api.get<ApiResponseEnvelope<CalibrationRecord>>(`/calibration/${id}`)
  return data.data
}

export async function createCalibrationRecord(request: CreateCalibrationRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>('/calibration', request)
  return data.data
}

export async function updateCalibrationRecord(id: string, request: Partial<CreateCalibrationRequest>): Promise<void> {
  await api.put(`/calibration/${id}`, request)
}

// --- Custody ---

export interface CustodyEvent {
  id: string
  assetId: string
  assetName?: string
  fromUserName?: string
  toUserName: string
  fromLocation?: string
  toLocation: string
  transferredAt: string
  reason?: string
  hasSignature: boolean
  notes?: string
}

export interface TransferCustodyRequest {
  assetId: string
  toUserId: string
  toUserName: string
  toLocation: string
  reason?: string
  signatureData?: string
  notes?: string
}

export async function getCustodyChain(assetId: string, page = 1, pageSize = 20): Promise<PagedResponse<CustodyEvent>> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: CustodyEvent[]; totalCount: number }>>(`/custody/assets/${assetId}`, { params: { page, pageSize } })
  return { items: data.data.items, totalCount: data.totalCount ?? data.data.totalCount }
}

export async function getCurrentCustodian(assetId: string): Promise<CustodyEvent | null> {
  const { data } = await api.get<ApiResponseEnvelope<CustodyEvent | null>>(`/custody/assets/${assetId}/current`)
  return data.data
}

export async function transferCustody(request: TransferCustodyRequest): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>('/custody/transfer', request)
  return data.data
}

// --- QR Code ---

export async function getAssetQrCode(assetId: string, label = false): Promise<Blob> {
  const { data } = await api.get<Blob>(`/assets/${assetId}/qr`, {
    params: { label },
    responseType: 'blob',
  })
  return data
}

// --- Telemetry ---

export interface TelemetryRecord {
  id: string
  instrumentId: string
  timestamp: string
  metrics: Record<string, number>
  source?: string
  isValid: boolean
}

export interface TelemetrySummary {
  instrumentId: string
  latestTimestamp?: string
  isOnline: boolean
  metricLatestValues: Record<string, number>
}

export async function getLatestTelemetry(instrumentId: string, count = 100): Promise<TelemetryRecord[]> {
  const { data } = await api.get<ApiResponseEnvelope<{ items: TelemetryRecord[] }>>(`/telemetry/${instrumentId}/latest`, { params: { count } })
  return data.data.items
}

export async function getTelemetrySummary(instrumentId: string): Promise<TelemetrySummary> {
  const { data } = await api.get<ApiResponseEnvelope<TelemetrySummary>>(`/telemetry/${instrumentId}/summary`)
  return data.data
}

export async function ingestTelemetry(request: { instrumentId: string; timestamp: string; metrics: Record<string, number>; source?: string }): Promise<{ id: string }> {
  const { data } = await api.post<ApiResponseEnvelope<{ id: string }>>('/telemetry', request)
  return data.data
}

export async function ingestTelemetryBatch(records: Array<{ instrumentId: string; timestamp: string; metrics: Record<string, number>; source?: string }>): Promise<{ accepted: number; rejected: number; errors: string[] }> {
  const { data } = await api.post<ApiResponseEnvelope<{ accepted: number; rejected: number; errors: string[] }>>('/telemetry/batch', { records })
  return data.data
}
