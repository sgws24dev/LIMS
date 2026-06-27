import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { getAuditLogs, verifyAuditChain, exportAuditLogsCsv, type AuditLogEntryDto, type HashChainVerificationDto } from '@/services/api/compliance'

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntryDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [entityTypeFilter, setEntityTypeFilter] = useState('')
  const [entityIdFilter, setEntityIdFilter] = useState('')
  const [userIdFilter, setUserIdFilter] = useState('')
  const [operationFilter, setOperationFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [chainResult, setChainResult] = useState<HashChainVerificationDto | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAuditLogs({
        entityType: entityTypeFilter || undefined,
        entityId: entityIdFilter || undefined,
        userId: userIdFilter || undefined,
        operation: operationFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page, pageSize
      })
      setLogs(result.items)
      setTotalCount(result.totalCount)
    } catch {
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [entityTypeFilter, entityIdFilter, userIdFilter, operationFilter, dateFrom, dateTo, page, pageSize])

  useEffect(() => { fetch() }, [fetch])

  const handleVerify = async () => {
    setVerifying(true)
    try {
      const result = await verifyAuditChain()
      setChainResult(result)
    } catch {
      setChainResult({ isIntact: false, tamperedEntryId: null, computedHash: null, storedHash: null })
    } finally {
      setVerifying(false)
    }
  }

  const operationColor = (op: string) => {
    switch (op) {
      case 'Create': return 'bg-green-100 text-green-800'
      case 'Update': return 'bg-amber-100 text-amber-800'
      case 'Delete': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    { id: 'timestamp', header: 'Timestamp', accessorKey: 'timestamp', cell: (r: AuditLogEntryDto) => new Date(r.timestamp).toLocaleString() },
    { id: 'changedByUserName', header: 'User', accessorKey: 'changedByUserName' },
    { id: 'operation', header: 'Operation', accessorKey: 'operation', cell: (r: AuditLogEntryDto) => <span className={`px-2 py-0.5 rounded text-xs font-medium ${operationColor(r.operation)}`}>{r.operation}</span> },
    { id: 'entityType', header: 'Entity Type', accessorKey: 'entityType' },
    { id: 'entityId', header: 'Entity ID', accessorKey: 'entityId', cell: (r: AuditLogEntryDto) => r.entityId.slice(0, 8) + '...' },
    { id: 'changeReason', header: 'Reason', accessorKey: 'changeReason', cell: (r: AuditLogEntryDto) => r.changeReason ? r.changeReason.slice(0, 40) + (r.changeReason.length > 40 ? '...' : '') : '' },
    { id: 'currentHash', header: 'Hash', accessorKey: 'currentHash', cell: (r: AuditLogEntryDto) => r.currentHash.slice(0, 16) + '...' },
  ]

  return (
    <PageContainer
      title="Audit Logs"
      status={loading ? 'loading' : error ? 'error' : logs.length === 0 ? 'empty' : 'success'}
      onRetry={fetch}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Audit Logs</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportAuditLogsCsv({ entityType: entityTypeFilter || undefined, entityId: entityIdFilter || undefined, userId: userIdFilter || undefined, operation: operationFilter || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })}>Export CSV</Button>
            <Button onClick={handleVerify} disabled={verifying}>
              {verifying ? 'Verifying...' : 'Verify Chain'}
            </Button>
          </div>
        </div>

        {chainResult && (
          <div className={`p-3 rounded-md text-sm ${chainResult.isIntact ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <strong>Chain Integrity: {chainResult.isIntact ? 'Valid' : 'Compromised'}</strong>
            {!chainResult.isIntact && chainResult.tamperedEntryId && (
              <div className="mt-1">
                Tampered entry: {chainResult.tamperedEntryId}
                <br />
                Computed: {chainResult.computedHash?.slice(0, 16)}...
                <br />
                Stored: {chainResult.storedHash?.slice(0, 16)}...
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Input placeholder="Entity type..." value={entityTypeFilter} onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1) }} className="max-w-[160px]" />
          <Input placeholder="Entity ID..." value={entityIdFilter} onChange={(e) => { setEntityIdFilter(e.target.value); setPage(1) }} className="max-w-[160px]" />
          <Input placeholder="User..." value={userIdFilter} onChange={(e) => { setUserIdFilter(e.target.value); setPage(1) }} className="max-w-[160px]" />
          <Input placeholder="Operation..." value={operationFilter} onChange={(e) => { setOperationFilter(e.target.value); setPage(1) }} className="max-w-[160px]" />
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="max-w-[160px]" />
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="max-w-[160px]" />
        </div>

        <DataTable
          columns={columns}
          data={logs}
          onRowClick={(r: AuditLogEntryDto) => setExpandedRow(expandedRow === r.id ? null : r.id)}
        />

        {expandedRow && (() => {
          const entry = logs.find(l => l.id === expandedRow)
          if (!entry) return null
          return (
            <div className="border rounded-md p-4 bg-muted/30 text-sm space-y-2">
              <div className="font-semibold">Entry Details</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">ID:</span> {entry.id}</div>
                <div><span className="text-muted-foreground">Previous Hash:</span> {entry.previousHash?.slice(0, 32) ?? 'N/A'}</div>
                <div><span className="text-muted-foreground">Current Hash:</span> {entry.currentHash.slice(0, 32)}</div>
                <div><span className="text-muted-foreground">IP:</span> {entry.ipAddress ?? 'N/A'}</div>
                <div><span className="text-muted-foreground">User Agent:</span> {entry.userAgent ?? 'N/A'}</div>
              </div>
              {entry.previousValues && (
                <div>
                  <div className="font-medium text-xs mt-2">Previous Values:</div>
                  <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(JSON.parse(entry.previousValues), null, 2)}</pre>
                </div>
              )}
              {entry.newValues && (
                <div>
                  <div className="font-medium text-xs mt-2">New Values:</div>
                  <pre className="bg-green-50 p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(JSON.parse(entry.newValues), null, 2)}</pre>
                </div>
              )}
            </div>
          )
        })()}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{totalCount} total entries</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="py-1">Page {page}</span>
            <Button variant="outline" size="sm" disabled={page * pageSize >= totalCount} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
