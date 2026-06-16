import api from '@/lib/api'

const BASE = '/api/v1/service-workflow'

export interface FormDefinitionDto {
  id: string
  title: string
  description?: string
  schema: string
  version: number
  status: string
  category: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreateFormDefinitionRequest {
  title: string
  description?: string
  schema: string
  category: string
}

export interface UpdateFormDefinitionRequest {
  title: string
  description?: string
  schema: string
  category: string
}

export interface ServiceRequestDto {
  id: string
  formDefinitionId: string
  formDefinitionVersion: number
  formTitle: string
  title: string
  description?: string
  status: string
  formData: string
  assignedTo?: string
  submittedAt?: string
  submittedBy?: string
  completedAt?: string
  completedBy?: string
  approvalRouting: string
  createdAt: string
  createdBy: string
}

export interface CreateServiceRequestRequest {
  formDefinitionId: string
  title: string
  description?: string
  formData: string
  approvalRouting: string
}

export interface MilestoneDto {
  id: string
  serviceRequestId: string
  title: string
  description?: string
  order: number
  status: string
  completedAt?: string
  completedBy?: string
  assignedTo?: string
}

export interface ApprovalDto {
  id: string
  serviceRequestId: string
  stepOrder: number
  approverUserId: string
  approverName?: string
  status: string
  comment?: string
  decidedAt?: string
  requestTitle: string
}

export interface RequestStatusHistoryDto {
  id: string
  serviceRequestId: string
  fromStatus: string
  toStatus: string
  comment?: string
  changedBy: string
  changedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// --- Form Definitions ---

export async function getFormDefinitions(
  tenantId: string,
  publishedOnly?: boolean
): Promise<FormDefinitionDto[]> {
  const params = new URLSearchParams({ tenantId })
  if (publishedOnly) params.append('publishedOnly', 'true')
  const { data } = await api.get<ApiResponse<FormDefinitionDto[]>>(
    `${BASE}/form-definitions?${params}`
  )
  return data.data
}

export async function getFormDefinitionById(
  id: string
): Promise<FormDefinitionDto> {
  const { data } = await api.get<ApiResponse<FormDefinitionDto>>(
    `${BASE}/form-definitions/${id}`
  )
  return data.data
}

export async function createFormDefinition(
  request: CreateFormDefinitionRequest
): Promise<FormDefinitionDto> {
  const { data } = await api.post<ApiResponse<FormDefinitionDto>>(
    `${BASE}/form-definitions`,
    request
  )
  return data.data
}

export async function updateFormDefinition(
  id: string,
  request: UpdateFormDefinitionRequest
): Promise<FormDefinitionDto> {
  const { data } = await api.put<ApiResponse<FormDefinitionDto>>(
    `${BASE}/form-definitions/${id}`,
    request
  )
  return data.data
}

export async function deleteFormDefinition(id: string): Promise<void> {
  await api.delete(`${BASE}/form-definitions/${id}`)
}

export async function publishFormDefinition(id: string): Promise<FormDefinitionDto> {
  const { data } = await api.post<ApiResponse<FormDefinitionDto>>(
    `${BASE}/form-definitions/${id}/publish`
  )
  return data.data
}

// --- Service Requests ---

export async function getServiceRequests(params: {
  tenantId: string
  formDefinitionId?: string
  status?: string
  assignedTo?: string
  createdBy?: string
}): Promise<ServiceRequestDto[]> {
  const searchParams = new URLSearchParams({ tenantId: params.tenantId })
  if (params.formDefinitionId) searchParams.append('formDefinitionId', params.formDefinitionId)
  if (params.status) searchParams.append('status', params.status)
  if (params.assignedTo) searchParams.append('assignedTo', params.assignedTo)
  if (params.createdBy) searchParams.append('createdBy', params.createdBy)
  const { data } = await api.get<ApiResponse<ServiceRequestDto[]>>(
    `${BASE}/requests?${searchParams}`
  )
  return data.data
}

export async function getServiceRequestById(
  id: string
): Promise<ServiceRequestDto> {
  const { data } = await api.get<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests/${id}`
  )
  return data.data
}

export async function getServiceRequestHistory(
  id: string
): Promise<RequestStatusHistoryDto[]> {
  const { data } = await api.get<ApiResponse<RequestStatusHistoryDto[]>>(
    `${BASE}/requests/${id}/history`
  )
  return data.data
}

export async function createServiceRequest(
  request: CreateServiceRequestRequest
): Promise<ServiceRequestDto> {
  const { data } = await api.post<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests`,
    request
  )
  return data.data
}

export async function submitServiceRequest(
  id: string,
  comment?: string
): Promise<ServiceRequestDto> {
  const { data } = await api.post<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests/${id}/submit`,
    { comment }
  )
  return data.data
}

export async function assignServiceRequest(
  id: string,
  assignedTo: string
): Promise<ServiceRequestDto> {
  const { data } = await api.post<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests/${id}/assign`,
    { assignedTo }
  )
  return data.data
}

export async function cancelServiceRequest(
  id: string,
  comment?: string
): Promise<ServiceRequestDto> {
  const { data } = await api.post<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests/${id}/cancel`,
    { comment }
  )
  return data.data
}

export async function changeServiceRequestStatus(
  id: string,
  newStatus: string,
  comment?: string
): Promise<ServiceRequestDto> {
  const { data } = await api.patch<ApiResponse<ServiceRequestDto>>(
    `${BASE}/requests/${id}/status`,
    { newStatus, comment }
  )
  return data.data
}

// --- Milestones ---

export async function getMilestonesByRequest(
  requestId: string
): Promise<MilestoneDto[]> {
  const { data } = await api.get<ApiResponse<MilestoneDto[]>>(
    `${BASE}/requests/${requestId}/milestones`
  )
  return data.data
}

export async function createMilestone(request: {
  serviceRequestId: string
  title: string
  description?: string
  order: number
  assignedTo?: string
}): Promise<MilestoneDto> {
  const { data } = await api.post<ApiResponse<MilestoneDto>>(
    `${BASE}/requests/${request.serviceRequestId}/milestones`,
    request
  )
  return data.data
}

export async function updateMilestoneStatus(
  requestId: string,
  milestoneId: string,
  action: string
): Promise<MilestoneDto> {
  const { data } = await api.patch<ApiResponse<MilestoneDto>>(
    `${BASE}/requests/${requestId}/milestones/${milestoneId}`,
    { action }
  )
  return data.data
}

// --- Approvals ---

export async function getPendingApprovals(): Promise<ApprovalDto[]> {
  const { data } = await api.get<ApiResponse<ApprovalDto[]>>(
    `${BASE}/approvals/pending`
  )
  return data.data
}

export async function getApprovalsByRequest(
  requestId: string
): Promise<ApprovalDto[]> {
  const { data } = await api.get<ApiResponse<ApprovalDto[]>>(
    `${BASE}/approvals/request/${requestId}`
  )
  return data.data
}

export async function createApproval(request: {
  serviceRequestId: string
  stepOrder: number
  approverUserId: string
  approverName?: string
}): Promise<ApprovalDto> {
  const { data } = await api.post<ApiResponse<ApprovalDto>>(
    `${BASE}/approvals`,
    request
  )
  return data.data
}

// --- Workflow Definitions ---

export interface WorkflowStateDto {
  name: string
  label: string
  type: 'Initial' | 'Intermediate' | 'Final' | 'Terminal'
  allowedTriggers?: string[]
}

export interface WorkflowTransitionDto {
  fromState: string
  toState: string
  trigger: string
  label?: string
  guards: string[]
  actions: string[]
}

export interface WorkflowDefinitionDto {
  id: string
  name: string
  description?: string
  states: string
  transitions: string
  isPublished: boolean
  version: number
  entityTypeHint?: string
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface CreateWorkflowDefinitionRequest {
  name: string
  description?: string
  states: string
  transitions: string
  entityTypeHint?: string
  createdBy: string
}

export interface UpdateWorkflowDefinitionRequest {
  id: string
  name: string
  description?: string
  states: string
  transitions: string
  entityTypeHint?: string
  updatedBy: string
}

export interface NotificationRuleDto {
  id: string
  workflowDefinitionId: string
  trigger: string
  channel: string
  subject: string
  body: string
  recipients: string
  isActive: boolean
}

export interface AddNotificationRuleRequest {
  workflowDefinitionId: string
  trigger: string
  channel: string
  subject: string
  body: string
  recipients: string
  createdBy: string
}

export interface WorkflowInstanceDto {
  id: string
  workflowDefinitionId: string
  entityType: string
  entityId: string
  currentState: string
  status: string
  stateHistory: StateTransitionRecord[]
  createdAt: string
  createdBy: string
  updatedAt?: string
  updatedBy?: string
}

export interface StateTransitionRecord {
  fromState: string
  toState: string
  trigger: string
  triggeredBy: string
  triggeredAt: string
  comment?: string
}

export interface AvailableTriggerDto {
  trigger: string
  toState: string
}

export async function getWorkflowDefinitions(): Promise<WorkflowDefinitionDto[]> {
  const { data } = await api.get<ApiResponse<WorkflowDefinitionDto[]>>(
    `${BASE}/workflow-definitions`
  )
  return data.data
}

export async function getWorkflowDefinitionById(id: string): Promise<WorkflowDefinitionDto> {
  const { data } = await api.get<ApiResponse<WorkflowDefinitionDto>>(
    `${BASE}/workflow-definitions/${id}`
  )
  return data.data
}

export async function createWorkflowDefinition(
  request: CreateWorkflowDefinitionRequest
): Promise<WorkflowDefinitionDto> {
  const { data } = await api.post<ApiResponse<WorkflowDefinitionDto>>(
    `${BASE}/workflow-definitions`,
    request
  )
  return data.data
}

export async function updateWorkflowDefinition(
  id: string,
  request: UpdateWorkflowDefinitionRequest
): Promise<WorkflowDefinitionDto> {
  const { data } = await api.put<ApiResponse<WorkflowDefinitionDto>>(
    `${BASE}/workflow-definitions/${id}`,
    request
  )
  return data.data
}

export async function publishWorkflowDefinition(id: string, updatedBy: string): Promise<void> {
  await api.post(`${BASE}/workflow-definitions/${id}/publish`, { updatedBy })
}

export async function unpublishWorkflowDefinition(id: string, updatedBy: string): Promise<void> {
  await api.post(`${BASE}/workflow-definitions/${id}/unpublish`, { updatedBy })
}

export async function deleteWorkflowDefinition(id: string, deletedBy: string): Promise<void> {
  await api.delete(`${BASE}/workflow-definitions/${id}`, { params: { deletedBy } })
}

export async function getNotificationRules(definitionId: string): Promise<NotificationRuleDto[]> {
  const { data } = await api.get<ApiResponse<NotificationRuleDto[]>>(
    `${BASE}/workflow-definitions/${definitionId}/notification-rules`
  )
  return data.data
}

export async function addNotificationRule(
  request: AddNotificationRuleRequest
): Promise<NotificationRuleDto> {
  const { data } = await api.post<ApiResponse<NotificationRuleDto>>(
    `${BASE}/workflow-definitions/${request.workflowDefinitionId}/notification-rules`,
    request
  )
  return data.data
}

export async function deleteNotificationRule(definitionId: string, ruleId: string): Promise<void> {
  await api.delete(`${BASE}/workflow-definitions/${definitionId}/notification-rules/${ruleId}`)
}

// --- Workflow Instances ---

export async function getWorkflowInstanceByEntity(
  entityType: string,
  entityId: string
): Promise<WorkflowInstanceDto> {
  const { data } = await api.get<ApiResponse<WorkflowInstanceDto>>(
    `${BASE}/workflow-instances/by-entity`,
    { params: { entityType, entityId } }
  )
  return data.data
}

export async function getAvailableTriggers(instanceId: string): Promise<AvailableTriggerDto[]> {
  const { data } = await api.get<ApiResponse<AvailableTriggerDto[]>>(
    `${BASE}/workflow-instances/${instanceId}/triggers`
  )
  return data.data
}

export async function executeTransition(
  instanceId: string,
  trigger: string,
  triggeredBy?: string,
  comment?: string,
  additionalContext?: Record<string, unknown>
): Promise<TransitionResultDto> {
  const { data } = await api.post<ApiResponse<TransitionResultDto>>(
    `${BASE}/workflow-instances/${instanceId}/transition`,
    { trigger, triggeredBy, comment, additionalContext }
  )
  return data.data
}

export interface TransitionResultDto {
  success: boolean
  errorMessage?: string
  fromState?: string
  toState?: string
  trigger?: string
  availableTriggers?: AvailableTriggerDto[]
}

export async function decideApproval(
  id: string,
  approved: boolean,
  comment?: string
): Promise<ApprovalDto> {
  const { data } = await api.post<ApiResponse<ApprovalDto>>(
    `${BASE}/approvals/${id}/decide`,
    { approved, comment }
  )
  return data.data
}
