import api from '@/lib/api'

export interface AuditLogEntryDto {
  id: string
  entityType: string
  entityId: string
  operation: string
  previousValues: string | null
  newValues: string | null
  changedByUserId: string
  changedByUserName: string
  changeReason: string
  ipAddress: string | null
  userAgent: string | null
  previousHash: string | null
  currentHash: string
  hashIntegrityVerified: boolean
  timestamp: string
}

export interface HashChainVerificationDto {
  isIntact: boolean
  tamperedEntryId: string | null
  computedHash: string | null
  storedHash: string | null
}

export interface SignatureDto {
  id: string
  signedEntityType: string
  signedEntityId: string
  signerUserId: string
  signerName: string
  signerEmail: string
  signatureData: string
  documentHash: string
  signedAt: string
}

export async function getAuditLogs(params?: {
  entityType?: string
  entityId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  operation?: string
  page?: number
  pageSize?: number
}): Promise<{ items: AuditLogEntryDto[]; totalCount: number; page: number; pageSize: number }> {
  const { data } = await api.get('/compliance/audit-logs', { params })
  return data
}

export async function getAuditLogById(id: string): Promise<AuditLogEntryDto> {
  const { data } = await api.get(`/compliance/audit-logs/${id}`)
  return data
}

export async function verifyAuditChain(): Promise<HashChainVerificationDto> {
  const { data } = await api.get('/compliance/audit-logs/verify-chain')
  return data
}

export async function getChangeHistory(entityType: string, entityId: string): Promise<AuditLogEntryDto[]> {
  const { data } = await api.get('/compliance/audit-logs/change-history', { params: { entityType, entityId } })
  return data
}

export async function captureSignature(command: {
  signedEntityType: string
  signedEntityId: string
  signerName: string
  signerEmail: string
  signatureData: string
  documentContext: string
}): Promise<SignatureDto> {
  const { data } = await api.post('/compliance/signatures', command)
  return data
}

export async function verifySignature(id: string, documentContext: string): Promise<boolean> {
  const { data } = await api.get(`/compliance/signatures/${id}/verify`, { params: { documentContext } })
  return data
}

export async function getSignaturesByEntity(entityType: string, entityId: string): Promise<SignatureDto[]> {
  const { data } = await api.get('/compliance/signatures', { params: { entityType, entityId } })
  return data
}

export async function exportAuditLogsCsv(params?: {
  entityType?: string
  entityId?: string
  userId?: string
  dateFrom?: string
  dateTo?: string
  operation?: string
}): Promise<void> {
  const { data } = await api.get('/compliance/audit-logs/export', {
    params,
    responseType: 'blob'
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
