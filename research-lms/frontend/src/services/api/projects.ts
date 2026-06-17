import api from '@/lib/api'

export type ProjectStatus = 'Planning' | 'Active' | 'OnHold' | 'Completed' | 'Cancelled'
export type WorkOrderStatus = 'Open' | 'InProgress' | 'Completed' | 'Cancelled'
export type IssueStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed' | 'Reopened'
export type IssueSeverity = 'Critical' | 'Major' | 'Minor' | 'Enhancement'
export type IssueType = 'Bug' | 'Feature' | 'Support' | 'Documentation'
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface ProjectDto {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  priority: Priority
  startDate?: string
  endDate?: string
  budget: number
  spent: number
  budgetUtilizationPercent: number
  isOverBudget: boolean
  isOverdue: boolean
  projectManagerName?: string
  workOrderCount: number
  openWorkOrderCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectActivityDto {
  eventType: string
  description: string
  occurredAt: string
  actorName?: string
}

export interface ProjectDetailDto extends ProjectDto {
  workOrders: WorkOrderDto[]
  recentActivity: ProjectActivityDto[]
}

export interface WorkOrderDto {
  id: string
  projectId: string
  projectName: string
  title: string
  status: WorkOrderStatus
  priority: Priority
  assignedToName?: string
  estimatedHours: number
  actualHours: number
  dueDate?: string
  isOverdue: boolean
  tags?: string
  createdAt: string
}

export interface WorkOrderDetailDto extends WorkOrderDto {
  description?: string
  costCenterId?: string
  costCenterName?: string
  billedAmount: number
  startDate?: string
  completedAt?: string
  linkedIssues: IssueDto[]
}

export interface IssueDto {
  id: string
  title: string
  status: IssueStatus
  severity: IssueSeverity
  type: IssueType
  priority: Priority
  assignedToName?: string
  reportedByName: string
  projectName?: string
  workOrderTitle?: string
  externalId?: string
  externalUrl?: string
  externalProvider?: string
  dueDate?: string
  isOverdue: boolean
  tags?: string
  createdAt: string
}

export interface IssueDetailDto extends IssueDto {
  description?: string
  projectId?: string
  workOrderId?: string
  resolvedAt?: string
  closedAt?: string
  updatedAt?: string
}

export interface CostCenterDto {
  id: string
  code: string
  name: string
  description?: string
  budgetAmount: number
  spentAmount: number
  remainingBudget: number
  utilizationPercent: number
  isOverBudget: boolean
  managerName?: string
  isActive: boolean
  fiscalYear: number
}

export interface WorkOrderSpendItemDto {
  workOrderId: string
  workOrderTitle: string
  projectName: string
  billedAmount: number
  completedAt?: string
}

export interface CostCenterSpendSummaryDto extends CostCenterDto {
  workOrders: WorkOrderSpendItemDto[]
}

export interface ProjectDashboardStatsDto {
  totalActive: number
  totalOnHold: number
  totalCompleted: number
  overdueCount: number
  overBudgetCount: number
  totalBudget: number
  totalSpent: number
  overallUtilizationPercent: number
}

export interface MonthlyBudgetDataPoint {
  monthLabel: string
  budget: number
  actual: number
}

export interface ExternalIssueRefDto {
  externalId: string
  externalUrl: string
  provider: string
}

export interface IssueSyncResultDto {
  pushed: number
  pulled: number
  failed: number
  errors: string[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getProjects(params?: {
  status?: ProjectStatus
  projectManagerId?: string
  includeArchived?: boolean
  page?: number
  pageSize?: number
}): Promise<PagedResult<ProjectDto>> {
  const { data } = await api.get('/projects', { params })
  return data
}

export async function getProjectById(id: string): Promise<ProjectDetailDto> {
  const { data } = await api.get(`/projects/${id}`)
  return data
}

export async function getProjectDashboardStats(): Promise<ProjectDashboardStatsDto> {
  const { data } = await api.get('/projects/dashboard')
  return data
}

export async function getBudgetChart(monthsBack = 6): Promise<MonthlyBudgetDataPoint[]> {
  const { data } = await api.get('/projects/budget-chart', { params: { monthsBack } })
  return data
}

export async function createProject(request: {
  name: string
  description?: string
  priority: Priority
  startDate?: string
  endDate?: string
  budget: number
  projectManagerId?: string
  projectManagerName?: string
}): Promise<string> {
  const { data } = await api.post('/projects', request)
  return data
}

export async function updateProject(id: string, request: {
  name: string
  description?: string
  priority: Priority
  startDate?: string
  endDate?: string
  budget: number
  projectManagerId?: string
  projectManagerName?: string
}): Promise<void> {
  await api.put(`/projects/${id}`, request)
}

export async function updateProjectStatus(id: string, newStatus: ProjectStatus): Promise<void> {
  await api.put(`/projects/${id}/status`, { newStatus })
}

export async function archiveProject(id: string): Promise<void> {
  await api.post(`/projects/${id}/archive`)
}

export async function getWorkOrdersByProject(projectId: string, params?: {
  status?: WorkOrderStatus
  assignedToId?: string
}): Promise<WorkOrderDto[]> {
  const { data } = await api.get(`/projects/${projectId}/work-orders`, { params })
  return data
}

export async function getWorkOrders(params?: {
  projectId?: string
  status?: WorkOrderStatus
  assignedToId?: string
  priority?: Priority
  page?: number
  pageSize?: number
}): Promise<PagedResult<WorkOrderDto>> {
  const { data } = await api.get('/projects/work-orders', { params })
  return data
}

export async function getWorkOrderById(id: string): Promise<WorkOrderDetailDto> {
  const { data } = await api.get(`/projects/work-orders/${id}`)
  return data
}

export async function createWorkOrder(request: {
  projectId: string
  costCenterId?: string
  title: string
  description?: string
  priority: Priority
  assignedToId?: string
  assignedToName?: string
  estimatedHours: number
  startDate?: string
  dueDate?: string
  tags?: string
}): Promise<string> {
  const { data } = await api.post('/projects/work-orders', request)
  return data
}

export async function updateWorkOrder(id: string, request: {
  costCenterId?: string
  title: string
  description?: string
  priority: Priority
  assignedToId?: string
  assignedToName?: string
  estimatedHours: number
  actualHours: number
  startDate?: string
  dueDate?: string
  tags?: string
}): Promise<void> {
  await api.put(`/projects/work-orders/${id}`, request)
}

export async function updateWorkOrderStatus(id: string, newStatus: WorkOrderStatus): Promise<void> {
  await api.put(`/projects/work-orders/${id}/status`, { newStatus })
}

export async function getCostCenters(params?: {
  activeOnly?: boolean
  fiscalYear?: number
}): Promise<CostCenterDto[]> {
  const { data } = await api.get('/projects/cost-centers', { params })
  return data
}

export async function getCostCenterById(id: string): Promise<CostCenterDto> {
  const { data } = await api.get(`/projects/cost-centers/${id}`)
  return data
}

export async function getCostCenterSpend(id: string): Promise<CostCenterSpendSummaryDto> {
  const { data } = await api.get(`/projects/cost-centers/${id}/spend`)
  return data
}

export async function createCostCenter(request: {
  code: string
  name: string
  description?: string
  budgetAmount: number
  managerId?: string
  managerName?: string
  fiscalYear?: number
}): Promise<string> {
  const { data } = await api.post('/projects/cost-centers', request)
  return data
}

export async function updateCostCenter(id: string, request: {
  name: string
  description?: string
  budgetAmount: number
  managerId?: string
  managerName?: string
  isActive: boolean
}): Promise<void> {
  await api.put(`/projects/cost-centers/${id}`, request)
}

export async function getIssues(params?: {
  status?: IssueStatus
  severity?: IssueSeverity
  type?: IssueType
  projectId?: string
  workOrderId?: string
  assignedToId?: string
  reportedById?: string
  page?: number
  pageSize?: number
}): Promise<PagedResult<IssueDto>> {
  const { data } = await api.get('/issues', { params })
  return data
}

export async function getIssueById(id: string): Promise<IssueDetailDto> {
  const { data } = await api.get(`/issues/${id}`)
  return data
}

export async function createIssue(request: {
  title: string
  description?: string
  severity: IssueSeverity
  type: IssueType
  priority: Priority
  projectId?: string
  workOrderId?: string
  assignedToId?: string
  assignedToName?: string
  reportedById: string
  reportedByName: string
  dueDate?: string
  tags?: string
}): Promise<string> {
  const { data } = await api.post('/issues', request)
  return data
}

export async function updateIssue(id: string, request: {
  title: string
  description?: string
  severity: IssueSeverity
  type: IssueType
  priority: Priority
  projectId?: string
  workOrderId?: string
  assignedToId?: string
  assignedToName?: string
  dueDate?: string
  tags?: string
}): Promise<void> {
  await api.put(`/issues/${id}`, request)
}

export async function updateIssueStatus(id: string, newStatus: IssueStatus): Promise<void> {
  await api.put(`/issues/${id}/status`, { newStatus })
}

export async function syncIssueToExternal(id: string, provider: string): Promise<ExternalIssueRefDto> {
  const { data } = await api.post(`/issues/${id}/sync`, { provider })
  return data
}

export async function syncProjectIssues(projectId: string, provider: string): Promise<IssueSyncResultDto> {
  const { data } = await api.post('/issues/sync-project', { projectId, provider })
  return data
}
