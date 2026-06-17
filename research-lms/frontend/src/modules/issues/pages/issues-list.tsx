import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { DataTable, type ColumnDef } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { IssueStatusBadge } from '../components/issue-status-badge'
import { IssueSeverityBadge } from '../components/issue-severity-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getIssues, syncIssueToExternal, type IssueDto, type IssueStatus, type IssueSeverity } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { Plus, ExternalLink, RefreshCw, Bug } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'

export default function IssuesListPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const { user } = useAuthStore()

  const [data, setData] = useState<IssueDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [severityFilter, setSeverityFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')
  const [syncId, setSyncId] = useState<string | null>(null)
  const [syncProvider, setSyncProvider] = useState('ServiceNow')
  const [syncing, setSyncing] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, any> = { page: 1, pageSize: 100 }
      if (statusFilter) params.status = statusFilter
      if (severityFilter) params.severity = severityFilter
      if (typeFilter) params.type = typeFilter
      if (activeTab === 'mine') params.assignedToId = user?.id
      if (activeTab === 'open') params.status = 'Open,InProgress,Reopened'
      if (activeTab === 'resolved') params.status = 'Resolved,Closed'
      const result = await getIssues(params)
      setData(result.items)
    } catch {
      setError('Failed to load issues.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, severityFilter, typeFilter, activeTab, user?.id])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Issues' }, { label: 'All Issues' }])
    fetchData()
  }, [fetchData, setBreadcrumbs])

  const handleSync = async () => {
    if (!syncId) return
    setSyncing(true)
    try {
      const result = await syncIssueToExternal(syncId, syncProvider)
      toast({ title: `Synced to ${syncProvider}`, description: `External ID: ${result.externalId}`, variant: 'success' })
      fetchData()
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' })
    } finally {
      setSyncing(false)
      setSyncId(null)
    }
  }

  const columns: ColumnDef<IssueDto>[] = [
    {
      id: 'title',
      header: 'Title',
      accessorKey: 'title',
      sortable: true,
      filterable: true,
      cell: (row) => (
        <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/issues/${row.id}`) }}>
          {row.title}
        </span>
      ),
    },
    {
      id: 'severity',
      header: 'Severity',
      cell: (row) => <IssueSeverityBadge severity={row.severity} />,
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => <Badge variant="outline">{row.type}</Badge>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => <IssueStatusBadge status={row.status} />,
    },
    { id: 'projectName', header: 'Project', accessorKey: 'projectName' },
    { id: 'assignedToName', header: 'Assignee', accessorKey: 'assignedToName' },
    {
      id: 'external',
      header: 'External',
      cell: (row) => row.externalId ? (
        <a href={row.externalUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}>
          <ExternalLink className="h-3 w-3" /> {row.externalProvider}
        </a>
      ) : <span className="text-xs text-gray-400">-</span>,
    },
    {
      id: 'dueDate',
      header: 'Due',
      accessorKey: 'dueDate',
      cell: (row) => row.dueDate ? (
        <span className={row.isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(row.dueDate)}</span>
      ) : '-',
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessorKey: 'createdAt',
      cell: (row) => formatDate(row.createdAt, 'short'),
    },
    {
      id: 'actions',
      header: '',
      className: 'w-[80px]',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm"
            onClick={(e) => { e.stopPropagation(); setSyncId(row.id) }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Issues"
      description="Track bugs, features, and support requests"
      status={error ? 'error' : loading ? 'loading' : data.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No issues found"
      emptyDescription="Create your first issue to get started."
      emptyAction={
        <Button size="sm" onClick={() => navigate('/issues/new')}>
          <Plus className="mr-1 h-4 w-4" /> Create Issue
        </Button>
      }
      actions={
        <Button size="sm" onClick={() => navigate('/issues/new')}>
          <Plus className="mr-1 h-4 w-4" /> Create Issue
        </Button>
      }
    >
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mine">My Issues</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Severities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="Major">Major</SelectItem>
              <SelectItem value="Minor">Minor</SelectItem>
              <SelectItem value="Enhancement">Enhancement</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Bug">Bug</SelectItem>
              <SelectItem value="Feature">Feature</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Documentation">Documentation</SelectItem>
            </SelectContent>
          </Select>
          {(severityFilter || typeFilter) && (
            <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter(''); setTypeFilter('') }}>
              Clear Filters
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          filterPlaceholder="Search issues..."
          onRowClick={(row) => navigate(`/issues/${row.id}`)}
        />
      </div>

      <ConfirmDialog
        open={!!syncId}
        onOpenChange={() => setSyncId(null)}
        title="Sync Issue"
        description={
          <div className="space-y-2">
            <p>Choose an external system to sync this issue with:</p>
            <Select value={syncProvider} onValueChange={setSyncProvider}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ServiceNow">ServiceNow</SelectItem>
                <SelectItem value="Jira">Jira</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
        confirmLabel="Sync Now"
        variant="default"
        onConfirm={handleSync}
        isLoading={syncing}
      />
    </PageContainer>
  )
}
