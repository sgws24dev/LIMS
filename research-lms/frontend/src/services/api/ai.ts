import api from '@/lib/api'

export interface ConversationDto {
  id: string
  userId: string
  topic: string
  status: string
  createdAt: string
  closedAt: string | null
  messages: MessageDto[]
}

export interface MessageDto {
  id: string
  role: string
  content: string
  tokensUsed: number | null
  createdAt: string
}

export interface TicketDto {
  id: string
  conversationId: string
  conversationSummary: string
  priority: string
  category: string
  assignedToUserId: string | null
  status: string
  createdAt: string
  resolvedAt: string | null
}

export interface HelpdeskMetricsDto {
  totalConversations: number
  openConversations: number
  totalTickets: number
  openTickets: number
  avgFirstResponseTimeHours: number
  avgResolutionTimeHours: number
  ticketsCreatedFromChat: number
  ticketsByStatus: Record<string, number>
  ticketsByPriority: Record<string, number>
}

export interface ApiResponseEnvelope<T> {
  success: boolean
  data: T
  error?: string
  totalCount?: number
}

const BASE = '/api/v1/ai/helpdesk'

export async function getConversations(): Promise<ConversationDto[]> {
  const { data } = await api.get<ConversationDto[]>(`${BASE}/conversations`)
  return data
}

export async function getConversation(id: string): Promise<ConversationDto | null> {
  try {
    const { data } = await api.get<ConversationDto>(`${BASE}/conversations/${id}`)
    return data
  } catch {
    return null
  }
}

export async function startConversation(topic: string): Promise<string> {
  const { data } = await api.post<string>(`${BASE}/conversations`, { topic })
  return data
}

export async function createTicketFromConversation(
  conversationId: string,
  conversationSummary: string,
  priority: string,
  category: string
): Promise<string> {
  const { data } = await api.post<string>(`${BASE}/conversations/${conversationId}/create-ticket`, {
    conversationSummary,
    priority,
    category
  })
  return data
}

export async function getTickets(): Promise<TicketDto[]> {
  const { data } = await api.get<TicketDto[]>(`${BASE}/tickets`)
  return data
}

export async function getHelpdeskMetrics(from?: string, to?: string): Promise<HelpdeskMetricsDto> {
  const { data } = await api.get<HelpdeskMetricsDto>(`${BASE}/metrics`, { params: { from, to } })
  return data
}

export interface ActionPlanDto {
  intent: string
  parametersJson: string
  confidence: number
  suggestedTool: string | null
  dryRunPreview: string
  requiresApproval: boolean
  guardrail: {
    isAllowed: boolean
    blockedReason: string | null
    requiresApproval: boolean
    approverRoles: string[]
  }
}

export interface ActionLogEntryDto {
  id: string
  userId: string
  utterance: string
  intent: string
  status: string
  guardrailResult: string | null
  executionResult: string | null
  durationMs: number
  createdAt: string
}

export interface RagResultDto {
  chunkContent: string
  score: number
  source: string
  metadata: string
}

const TALK_TO_ACTION_BASE = '/api/v1/ai/talk-to-action'
const FAQ_BASE = '/api/v1/ai/faq'

export async function dryRunAction(utterance: string): Promise<ActionPlanDto> {
  const { data } = await api.post<ActionPlanDto>(`${TALK_TO_ACTION_BASE}/dry-run`, { utterance })
  return data
}

export async function executeAction(utterance: string): Promise<ActionPlanDto> {
  const { data } = await api.post<ActionPlanDto>(`${TALK_TO_ACTION_BASE}/execute`, { utterance })
  return data
}

export async function getActionHistory(): Promise<ActionLogEntryDto[]> {
  const { data } = await api.get<ActionLogEntryDto[]>(`${TALK_TO_ACTION_BASE}/history`)
  return data
}

export async function searchFaq(q: string, instrumentId?: string): Promise<RagResultDto[]> {
  const { data } = await api.get<RagResultDto[]>(`${FAQ_BASE}/search`, { params: { q, instrumentId } })
  return data
}

export async function indexSop(title: string, content: string, instrumentId: string): Promise<void> {
  await api.post(`${FAQ_BASE}/index`, { title, content, instrumentId })
}

export interface IoTTelemetryDto {
  id: string
  instrumentId: string
  timestamp: string
  metricName: string
  metricValue: number
  unit: string
  tags: string | null
}

export interface IoTAlertDto {
  id: string
  instrumentId: string
  ruleId: string | null
  metricName: string
  actualValue: number
  thresholdValue: number
  severity: string
  status: string
  openedAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  resolvedByUserId: string | null
}

export interface AlertRuleDto {
  id: string
  instrumentId: string
  metricName: string
  conditionType: string
  thresholdValue: number
  evaluationWindowMinutes: number
  severity: string
  cooldownMinutes: number
  isEnabled: boolean
}

export interface AutomationRuleDto {
  id: string
  name: string
  triggerType: string
  triggerConfig: string
  actionType: string
  actionConfig: string
  requiresApproval: boolean
  isEnabled: boolean
}

export interface InstrumentStatusDto {
  instrumentId: string
  status: string
  latestTelemetry: IoTTelemetryDto | null
  activeAlert: IoTAlertDto | null
}

export interface PendingActionDto {
  id: string
  ruleId: string
  ruleName: string
  triggerEvent: string
  actionExecuted: string
  executedAt: string
}

export interface CreateAlertRuleRequest {
  instrumentId: string
  metricName: string
  conditionType: string
  thresholdValue: number
  evaluationWindowMinutes: number
  severity: string
  cooldownMinutes: number
}

export interface CreateAutomationRuleRequest {
  name: string
  triggerType: string
  triggerConfig: string
  actionType: string
  actionConfig: string
  requiresApproval: boolean
}

export interface IngestTelemetryRequest {
  instrumentId: string
  timestamp: string
  metricName: string
  metricValue: number
  unit: string
  tags: string | null
}

const IOT_BASE = '/api/v1/ai/iot'

export async function ingestTelemetry(request: IngestTelemetryRequest): Promise<void> {
  await api.post(`${IOT_BASE}/telemetry`, request)
}

export async function getTelemetry(
  instrumentId: string, metricName?: string, from?: string, to?: string
): Promise<IoTTelemetryDto[]> {
  const { data } = await api.get<IoTTelemetryDto[]>(`${IOT_BASE}/telemetry`, {
    params: { instrumentId, metricName, from, to }
  })
  return data
}

export async function getInstrumentStatus(instrumentId: string): Promise<InstrumentStatusDto> {
  const { data } = await api.get<InstrumentStatusDto>(`${IOT_BASE}/instruments/${instrumentId}/status`)
  return data
}

export async function getAlerts(instrumentId?: string, status?: string): Promise<IoTAlertDto[]> {
  const { data } = await api.get<IoTAlertDto[]>(`${IOT_BASE}/alerts`, {
    params: { instrumentId, status }
  })
  return data
}

export async function acknowledgeAlert(id: string): Promise<void> {
  await api.put(`${IOT_BASE}/alerts/${id}/acknowledge`)
}

export async function resolveAlert(id: string): Promise<void> {
  await api.put(`${IOT_BASE}/alerts/${id}/resolve`)
}

export async function getAlertRules(instrumentId?: string): Promise<AlertRuleDto[]> {
  const { data } = await api.get<AlertRuleDto[]>(`${IOT_BASE}/alert-rules`, {
    params: { instrumentId }
  })
  return data
}

export async function createAlertRule(request: CreateAlertRuleRequest): Promise<string> {
  const { data } = await api.post<string>(`${IOT_BASE}/alert-rules`, request)
  return data
}

export async function updateAlertRule(id: string, request: CreateAlertRuleRequest): Promise<void> {
  await api.put(`${IOT_BASE}/alert-rules/${id}`, request)
}

export async function deleteAlertRule(id: string): Promise<void> {
  await api.delete(`${IOT_BASE}/alert-rules/${id}`)
}

export async function toggleAlertRule(id: string, isEnabled: boolean): Promise<void> {
  await api.patch(`${IOT_BASE}/alert-rules/${id}/toggle`, isEnabled)
}

export async function getAutomationRules(): Promise<AutomationRuleDto[]> {
  const { data } = await api.get<AutomationRuleDto[]>(`${IOT_BASE}/automation-rules`)
  return data
}

export async function createAutomationRule(request: CreateAutomationRuleRequest): Promise<string> {
  const { data } = await api.post<string>(`${IOT_BASE}/automation-rules`, request)
  return data
}

export async function updateAutomationRule(id: string, request: CreateAutomationRuleRequest): Promise<void> {
  await api.put(`${IOT_BASE}/automation-rules/${id}`, request)
}

export async function deleteAutomationRule(id: string): Promise<void> {
  await api.delete(`${IOT_BASE}/automation-rules/${id}`)
}

export async function toggleAutomationRule(id: string, isEnabled: boolean): Promise<void> {
  await api.patch(`${IOT_BASE}/automation-rules/${id}/toggle`, isEnabled)
}

export async function getPendingActions(): Promise<PendingActionDto[]> {
  const { data } = await api.get<PendingActionDto[]>(`${IOT_BASE}/automation-rules/pending-actions`)
  return data
}

export async function approveAction(id: string): Promise<void> {
  await api.put(`${IOT_BASE}/automation-rules/pending-actions/${id}/approve`)
}

export async function rejectAction(id: string): Promise<void> {
  await api.put(`${IOT_BASE}/automation-rules/pending-actions/${id}/reject`)
}
