import api from '@/lib/api'

export type InvoiceStatus = 'Draft' | 'Pending' | 'Approved' | 'Sent' | 'Paid' | 'Overdue' | 'Voided' | 'CreditNote'
export type BilledToEntityType = 'ServiceRequest' | 'Booking' | 'Project' | 'Monthly'
export type ErpSyncStatus = 'Pending' | 'Sent' | 'Acknowledged' | 'Failed'

export interface InvoiceLineItemDto {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  lineTotal: number
  referenceType?: string
  referenceId?: string
}

export interface InvoiceDto {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  billedToEntityType: BilledToEntityType
  billedToEntityId?: string
  billToName: string
  billToAddress: string
  billToEmail: string
  currency: string
  subtotal: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  invoiceDate: string
  dueDate: string
  paidAt?: string
  voidedAt?: string
  voidReason?: string
  erpSyncStatus: ErpSyncStatus
  creditNoteForInvoiceId?: string
  createdAt: string
  lineItems: InvoiceLineItemDto[]
}

export interface CreateInvoiceLineItemDto {
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  referenceType?: string
  referenceId?: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export async function getInvoices(params?: {
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page?: number
  pageSize?: number
}): Promise<PaginatedResult<InvoiceDto>> {
  const { data } = await api.get('/billing/invoices', { params })
  return data
}

export async function getInvoiceById(id: string): Promise<InvoiceDto> {
  const { data } = await api.get(`/billing/invoices/${id}`)
  return data
}

export async function createInvoice(command: {
  billedToEntityType: string
  billedToEntityId?: string
  billToName: string
  billToAddress: string
  billToEmail: string
  currency: string
  invoiceDate: string
  dueDate: string
  lineItems: CreateInvoiceLineItemDto[]
  saveAsDraft: boolean
}): Promise<InvoiceDto> {
  const { data } = await api.post('/billing/invoices', command)
  return data
}

export async function updateInvoice(id: string, command: {
  billToName: string
  billToAddress: string
  billToEmail: string
  invoiceDate: string
  dueDate: string
  lineItems: CreateInvoiceLineItemDto[]
}): Promise<InvoiceDto> {
  const { data } = await api.put(`/billing/invoices/${id}`, { id, ...command })
  return data
}

export async function sendInvoice(id: string): Promise<void> {
  await api.post(`/billing/invoices/${id}/send`)
}

export async function voidInvoice(id: string, reason: string): Promise<void> {
  await api.post(`/billing/invoices/${id}/void`, { id, reason })
}

export async function recordPayment(id: string, amount: number): Promise<void> {
  await api.post(`/billing/invoices/${id}/pay`, { id, amount })
}

export async function getInvoicePdf(id: string): Promise<Blob> {
  const { data } = await api.get(`/billing/invoices/${id}/pdf`, { responseType: 'blob' })
  return data
}

export async function generateInvoice(command: {
  sourceType: string
  sourceId: string
  previewOnly: boolean
}): Promise<InvoiceDto> {
  const { data } = await api.post('/billing/invoices/generate', command)
  return data
}

export interface PricingModelDto {
  id: string
  name: string
  description?: string
  modelType: string
  effectiveFrom: string
  effectiveTo?: string
  isActive: boolean
  rateTables?: RateTableDto[]
}

export interface RateTableDto {
  id: string
  customerType: string
  rate: number
  minQuantity?: number
  maxQuantity?: number
  effectiveFrom: string
  effectiveTo?: string
}

export interface RebateDto {
  id: string
  name: string
  description?: string
  rebateType: string
  value: number
  minSpendAmount?: number
  maxDiscountAmount?: number
  isActive: boolean
  validFrom: string
  validTo?: string
}

export interface CreditDto {
  id: string
  institutionId: string
  balance: number
  currency: string
}

export interface TaxCodeDto {
  id: string
  name: string
  description?: string
  country: string
  region?: string
  rate: number
  isDefault: boolean
  isCompound: boolean
  effectiveFrom: string
  effectiveTo?: string
}

export interface PriceBreakdownDto {
  subtotal: number
  discountAmount: number
  taxAmount: number
  total: number
  lineItems: PriceLineItemDto[]
}

export interface PriceLineItemDto {
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
  lineTotal: number
}

export interface ErpSyncLogDto {
  id: string
  invoiceId: string
  direction: string
  status: string
  errorMessage?: string
  attemptCount: number
  lastAttemptedAt?: string
  createdAt: string
}

export async function getPricingModels(isActive?: boolean): Promise<PricingModelDto[]> {
  const { data } = await api.get('/billing/pricing-models', { params: { isActive: isActive ?? undefined } })
  return data
}

export async function createPricingModel(command: {
  name: string
  description?: string
  modelType: string
  effectiveFrom: string
  effectiveTo?: string
}): Promise<PricingModelDto> {
  const { data } = await api.post('/billing/pricing-models', command)
  return data
}

export async function updatePricingModel(id: string, command: {
  id: string
  name: string
  description?: string
  modelType: string
  effectiveFrom: string
  effectiveTo?: string
}): Promise<PricingModelDto> {
  const { data } = await api.put(`/billing/pricing-models/${id}`, command)
  return data
}

export async function calculatePrice(query: {
  pricingModelId: string
  quantity: number
  duration?: number
  customerType: string
}): Promise<PriceBreakdownDto> {
  const { data } = await api.post('/billing/pricing-models/calculate', query)
  return data
}

export async function getRateTables(pricingModelId: string): Promise<RateTableDto[]> {
  const { data } = await api.get('/billing/rate-tables', { params: { pricingModelId } })
  return data
}

export async function setRateTable(command: {
  pricingModelId: string
  customerType: string
  rate: number
  minQuantity?: number
  maxQuantity?: number
  effectiveFrom: string
  effectiveTo?: string
}): Promise<RateTableDto> {
  const { data } = await api.post('/billing/rate-tables', command)
  return data
}

export async function updateRateTable(id: string, command: {
  pricingModelId: string
  customerType: string
  rate: number
  minQuantity?: number
  maxQuantity?: number
  effectiveFrom: string
  effectiveTo?: string
}): Promise<RateTableDto> {
  const { data } = await api.put(`/billing/rate-tables/${id}`, command)
  return data
}

export async function getRebates(): Promise<RebateDto[]> {
  const { data } = await api.get('/billing/rebates')
  return data
}

export async function getRebateById(id: string): Promise<RebateDto> {
  const { data } = await api.get(`/billing/rebates/${id}`)
  return data
}

export async function createRebate(dto: Omit<RebateDto, 'id'>): Promise<RebateDto> {
  const { data } = await api.post('/billing/rebates', dto)
  return data
}

export async function updateRebate(id: string, dto: RebateDto): Promise<RebateDto> {
  const { data } = await api.put(`/billing/rebates/${id}`, dto)
  return data
}

export async function getCredits(): Promise<CreditDto[]> {
  const { data } = await api.get('/billing/credits')
  return data
}

export async function adjustCredit(institutionId: string, amount: number, currency?: string): Promise<CreditDto> {
  const { data } = await api.post('/billing/credits/adjust', { institutionId, amount, currency })
  return data
}

export async function getTaxCodes(country?: string): Promise<TaxCodeDto[]> {
  const { data } = await api.get('/billing/tax-codes', { params: { country } })
  return data
}

export async function createTaxCode(dto: Omit<TaxCodeDto, 'id'>): Promise<TaxCodeDto> {
  const { data } = await api.post('/billing/tax-codes', dto)
  return data
}

export async function updateTaxCode(id: string, dto: TaxCodeDto): Promise<TaxCodeDto> {
  const { data } = await api.put(`/billing/tax-codes/${id}`, dto)
  return data
}

export async function getErpSyncLogs(): Promise<ErpSyncLogDto[]> {
  const { data } = await api.get('/billing/erp-sync')
  return data
}

export async function getErpSyncLogsByInvoice(invoiceId: string): Promise<ErpSyncLogDto[]> {
  const { data } = await api.get(`/billing/erp-sync/${invoiceId}`)
  return data
}

export async function retryErpSync(invoiceId: string): Promise<void> {
  await api.post(`/billing/invoices/${invoiceId}/resync-erp`)
}

export interface ExchangeRateDto {
  id: string
  fromCurrency: string
  toCurrency: string
  rate: number
  validFrom: string
  validTo?: string
}

export interface ReconciliationDto {
  id: string
  invoiceId: string
  referenceNumber: string
  amount: number
  currency: string
  status: string
  transactionDate: string
  matchedAt?: string
  notes?: string
}

export async function getExchangeRates(fromCurrency?: string, toCurrency?: string): Promise<ExchangeRateDto[]> {
  const { data } = await api.get('/billing/exchange-rates', { params: { fromCurrency, toCurrency } })
  return data
}

export async function createExchangeRate(command: {
  fromCurrency: string
  toCurrency: string
  rate: number
  validFrom: string
  validTo?: string
}): Promise<void> {
  await api.post('/billing/exchange-rates', command)
}

export async function getReconciliations(status?: string): Promise<ReconciliationDto[]> {
  const { data } = await api.get('/billing/reconciliation', { params: { status } })
  return data
}

export async function createReconciliation(command: {
  invoiceId: string
  referenceNumber: string
  amount: number
  currency: string
  transactionDate: string
}): Promise<void> {
  await api.post('/billing/reconciliation', command)
}

export async function matchReconciliation(id: string): Promise<void> {
  await api.post(`/billing/reconciliation/${id}/match`)
}

export async function disputeReconciliation(id: string, notes: string): Promise<void> {
  await api.post(`/billing/reconciliation/${id}/dispute`, { notes })
}

export interface FinancialDashboardDto {
  totalRevenueMonth: number
  outstandingReceivables: number
  overdueAmount: number
  avgDaysToPay: number
  revenueByMonth: MonthlyRevenueDto[]
  revenueByCategory: CategoryRevenueDto[]
  outstandingByAging: AgingBucketDto[]
  recentTransactions: InvoiceDto[]
}

export interface MonthlyRevenueDto {
  month: string
  currentYear: number
  previousYear: number
}

export interface CategoryRevenueDto {
  category: string
  amount: number
}

export interface AgingBucketDto {
  bucket: string
  amount: number
}

export interface AssetDepreciationReportDto {
  totalAssetValue: number
  accumulatedDepreciation: number
  netBookValue: number
  byCategory: DepreciationByCategoryDto[]
  monthlyTrends: MonthlyDepreciationTrendDto[]
}

export interface DepreciationByCategoryDto {
  category: string
  totalValue: number
  accumulatedDepreciation: number
  netBookValue: number
}

export interface MonthlyDepreciationTrendDto {
  month: string
  depreciationAmount: number
}

export interface AssetValuationReportDto {
  totalReplacementValue: number
  totalInsuredValue: number
  totalWrittenDownValue: number
  byLocation: AssetValuationByLocationDto[]
}

export interface AssetValuationByLocationDto {
  location: string
  replacementValue: number
  insuredValue: number
  writtenDownValue: number
}

export async function getFinancialDashboard(): Promise<FinancialDashboardDto> {
  const { data } = await api.get('/billing/dashboard')
  return data
}

export async function getAssetDepreciationReport(params?: {
  dateFrom?: string
  dateTo?: string
  assetCategory?: string
  depreciationMethod?: string
}): Promise<AssetDepreciationReportDto> {
  const { data } = await api.get('/billing/reports/asset-depreciation', { params })
  return data
}

export async function getAssetValuationReport(): Promise<AssetValuationReportDto> {
  const { data } = await api.get('/billing/reports/asset-valuation')
  return data
}

// Dashboard types
export type WidgetType = 'Kpi' | 'LineChart' | 'BarChart' | 'PieChart' | 'AreaChart' | 'Table' | 'Instrument365'

export interface DashboardWidgetDto {
  id: string
  dashboardId: string
  widgetType: WidgetType
  config: string
  positionX: number
  positionY: number
  width: number
  height: number
  isVisible: boolean
  createdAt: string
}

export interface DashboardDefinitionDto {
  id: string
  name: string
  description?: string
  layout: string
  isDefault: boolean
  isShared: boolean
  sharedWith?: string
  createdByUserId: string
  createdAt: string
  updatedAt?: string
  widgets: DashboardWidgetDto[]
}

export interface WidgetDatasetDto {
  label: string
  data: number[]
  color: string
}

export interface WidgetDataDto {
  labels: string[]
  datasets: WidgetDatasetDto[]
  changePercent?: number
  trendDirection?: 'up' | 'down' | 'flat'
}

export interface CreateDashboardWidgetDto {
  widgetType: WidgetType
  config: string
  positionX: number
  positionY: number
  width: number
  height: number
}

export async function getDashboards(): Promise<DashboardDefinitionDto[]> {
  const { data } = await api.get('/billing/dashboards')
  return data
}

export async function getDashboardById(id: string): Promise<DashboardDefinitionDto> {
  const { data } = await api.get(`/billing/dashboards/${id}`)
  return data
}

export async function createDashboard(command: {
  name: string
  description?: string
  layout: string
  isDefault: boolean
  widgets: CreateDashboardWidgetDto[]
}): Promise<DashboardDefinitionDto> {
  const { data } = await api.post('/billing/dashboards', command)
  return data
}

export async function updateDashboard(id: string, command: {
  id: string
  name: string
  description?: string
  layout: string
  isDefault: boolean
}): Promise<DashboardDefinitionDto> {
  const { data } = await api.put(`/billing/dashboards/${id}`, command)
  return data
}

export async function deleteDashboard(id: string): Promise<void> {
  await api.delete(`/billing/dashboards/${id}`)
}

export async function cloneDashboard(id: string, name: string): Promise<DashboardDefinitionDto> {
  const { data } = await api.post(`/billing/dashboards/${id}/clone`, { id, name })
  return data
}

export async function getWidgetData(dashboardId: string, widgetId: string, from: string, to: string): Promise<WidgetDataDto> {
  const { data } = await api.get(`/billing/dashboards/${dashboardId}/widgets/${widgetId}/data`, {
    params: { from, to }
  })
  return data
}

export interface InstrumentDailyMetricDto {
  date: string
  totalBookings: number
  utilizedHours: number
  idleHours: number
  downtimeHours: number
  revenueGenerated: number
  serviceEventCount: number
  maintenanceHours: number
}

export interface Instrument365SummaryDto {
  totalRevenue: number
  utilizationPercent: number
  downtimePercent: number
  avgBookingsPerDay: number
  topServiceMonth: string
}

export interface Instrument365Dto {
  dailyMetrics: InstrumentDailyMetricDto[]
  summary: Instrument365SummaryDto
}

export async function getInstrument365Data(instrumentId: string, year: number): Promise<Instrument365Dto> {
  const { data } = await api.get(`/billing/instruments/${instrumentId}/365`, { params: { year } })
  return data
}

export interface ReportDefinitionDto {
  id: string
  name: string
  description?: string
  sourceEntity: string
  fieldsJson: string
  filtersJson: string
  tenantId: string
  createdBy: string
  createdAt: string
  updatedAt?: string
}

export interface ReportPreviewDto {
  columns: string[]
  rows: Record<string, unknown>[]
  totalCount: number
}

export interface ReportResultDto {
  columns: string[]
  rows: Record<string, unknown>[]
  totalCount: number
  page: number
  pageSize: number
}

export async function getReportDefinitions(): Promise<ReportDefinitionDto[]> {
  const { data } = await api.get('/billing/report-definitions')
  return data
}

export async function getReportDefinitionById(id: string): Promise<ReportDefinitionDto> {
  const { data } = await api.get(`/billing/report-definitions/${id}`)
  return data
}

export async function createReportDefinition(command: {
  name: string
  description?: string
  sourceEntity: string
  fieldsJson: string
  filtersJson: string
}): Promise<ReportDefinitionDto> {
  const { data } = await api.post('/billing/report-definitions', command)
  return data
}

export async function updateReportDefinition(id: string, command: {
  id: string
  name: string
  description?: string
  sourceEntity: string
  fieldsJson: string
  filtersJson: string
}): Promise<ReportDefinitionDto> {
  const { data } = await api.put(`/billing/report-definitions/${id}`, command)
  return data
}

export async function deleteReportDefinition(id: string): Promise<void> {
  await api.delete(`/billing/report-definitions/${id}`)
}

export async function previewReport(reportDefinitionId: string): Promise<ReportPreviewDto> {
  const { data } = await api.post('/billing/reports/preview', { reportDefinitionId })
  return data
}

export async function runReport(reportDefinitionId: string, page?: number, pageSize?: number): Promise<ReportResultDto> {
  const { data } = await api.post('/billing/reports/run', { reportDefinitionId, page, pageSize })
  return data
}

export async function updateWidgetConfig(dashboardId: string, widgetId: string, command: {
  dashboardId: string
  widgetId: string
  config: string
  positionX: number
  positionY: number
  width: number
  height: number
}): Promise<DashboardWidgetDto> {
  const { data } = await api.put(`/billing/dashboards/${dashboardId}/widgets/${widgetId}`, command)
  return data
}

export async function exportReport(reportDefinitionId: string, format: 'csv' | 'pdf' | 'xlsx'): Promise<Blob> {
  const { data } = await api.get(`/billing/reports/${reportDefinitionId}/export`, {
    params: { format },
    responseType: 'blob',
  })
  return data
}

export interface ReportScheduleDto {
  id: string
  reportDefinitionId: string
  reportDefinitionName?: string
  cronExpression: string
  timeZoneId: string
  format: string
  recipients: string
  subject: string
  isActive: boolean
  lastDeliveredAt?: string
  nextRunAt?: string
  createdAt: string
}

export async function getReportSchedules(): Promise<ReportScheduleDto[]> {
  const { data } = await api.get('/billing/report-schedules')
  return data
}

export async function getReportScheduleById(id: string): Promise<ReportScheduleDto> {
  const { data } = await api.get(`/billing/report-schedules/${id}`)
  return data
}

export async function createReportSchedule(command: {
  reportDefinitionId: string
  cronExpression: string
  timeZoneId: string
  format: string
  recipients: string
  subject: string
}): Promise<ReportScheduleDto> {
  const { data } = await api.post('/billing/report-schedules', command)
  return data
}

export async function updateReportSchedule(id: string, command: {
  id: string
  cronExpression: string
  timeZoneId: string
  format: string
  recipients: string
  subject: string
  isActive: boolean
}): Promise<ReportScheduleDto> {
  const { data } = await api.put(`/billing/report-schedules/${id}`, command)
  return data
}

export async function deleteReportSchedule(id: string): Promise<void> {
  await api.delete(`/billing/report-schedules/${id}`)
}

export async function updateDashboardSharing(id: string, sharedWith: string | null): Promise<DashboardDefinitionDto> {
  const { data } = await api.put(`/billing/dashboards/${id}/share`, { id, sharedWith })
  return data
}
