import { useState, useEffect, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { getErpSyncLogs, retryErpSync, type ErpSyncLogDto } from '@/services/api/billing'

export default function ErpSyncDashboardPage() {
  const [logs, setLogs] = useState<ErpSyncLogDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try { setLogs(await getErpSyncLogs()) }
    catch { setError('Failed to load ERP sync logs') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleRetry = async (invoiceId: string) => {
    try {
      await retryErpSync(invoiceId)
      fetch()
    } catch { setError('Failed to retry sync') }
  }

  const columns = [
    { id: 'createdAt', header: 'Time', accessorKey: 'createdAt', cell: (r: ErpSyncLogDto) => new Date(r.createdAt).toLocaleString() },
    { id: 'invoiceId', header: 'Invoice ID', accessorKey: 'invoiceId', cell: (r: ErpSyncLogDto) => r.invoiceId.slice(0, 8) + '...' },
    { id: 'direction', header: 'Direction', accessorKey: 'direction' },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (r: ErpSyncLogDto) => {
      const colors: Record<string, string> = { Acknowledged: 'text-green-600', Failed: 'text-red-600', Pending: 'text-yellow-600', Sent: 'text-blue-600' }
      return <span className={colors[r.status] ?? ''}>{r.status}</span>
    }},
    { id: 'attemptCount', header: 'Attempts', accessorKey: 'attemptCount' },
    { id: 'errorMessage', header: 'Error', accessorKey: 'errorMessage', cell: (r: ErpSyncLogDto) => r.errorMessage ?? '-' },
    { id: 'actions', header: '', cell: (r: ErpSyncLogDto) => (
      r.status === 'Failed' ? <Button variant="ghost" size="sm" onClick={() => handleRetry(r.invoiceId)}><RefreshCw className="h-4 w-4" /></Button> : null
    )},
  ]

  return (
    <PageContainer title="ERP Sync Dashboard" status={loading ? 'loading' : error ? 'error' : logs.length === 0 ? 'empty' : 'success'} onRetry={fetch}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">ERP Sync Dashboard</h1>
          <Button variant="outline" onClick={fetch}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>
        <p className="text-sm text-muted-foreground">Monitor and retry invoice synchronization with Oracle Fusion ERP.</p>
        <DataTable columns={columns} data={logs} />
      </div>
    </PageContainer>
  )
}
