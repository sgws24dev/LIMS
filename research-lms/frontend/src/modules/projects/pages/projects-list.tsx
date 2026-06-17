import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { DataTable, type ColumnDef } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'
import { ProjectStatusBadge } from '../components/project-status-badge'
import { BudgetProgressBar } from '../components/budget-progress-bar'
import { Badge } from '@/shared/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getProjects, archiveProject, updateProjectStatus, type ProjectDto, type ProjectStatus } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Archive, Power, Eye } from 'lucide-react'

export default function ProjectsListPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [data, setData] = useState<ProjectDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archiveId, setArchiveId] = useState<string | null>(null)
  const [archiving, setArchiving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getProjects({ page: 1, pageSize: 100 })
      setData(result.items)
    } catch {
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Projects' }, { label: 'All Projects' }])
    fetchData()
  }, [fetchData, setBreadcrumbs])

  const handleArchive = async () => {
    if (!archiveId) return
    setArchiving(true)
    try {
      await archiveProject(archiveId)
      toast({ title: 'Project archived', variant: 'success' })
      setData((prev) => prev.filter((p) => p.id !== archiveId))
    } catch {
      toast({ title: 'Failed to archive', variant: 'destructive' })
    } finally {
      setArchiving(false)
      setArchiveId(null)
    }
  }

  const columns: ColumnDef<ProjectDto>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      filterable: true,
      cell: (row) => (
        <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          onClick={(e) => { e.stopPropagation(); navigate(`/projects/${row.id}`) }}>
          {row.name}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: (row) => <ProjectStatusBadge status={row.status} />,
    },
    {
      id: 'priority',
      header: 'Priority',
      cell: (row) => (
        <Badge variant="outline">
          {row.priority}
        </Badge>
      ),
    },
    { id: 'projectManagerName', header: 'Manager', accessorKey: 'projectManagerName' },
    {
      id: 'budget',
      header: 'Budget',
      accessorKey: 'budget',
      cell: (row) => formatCurrency(row.budget),
    },
    {
      id: 'spent',
      header: 'Spent',
      cell: (row) => (
        <div className="min-w-[140px]">
          <span className="text-xs text-gray-500">{formatCurrency(row.spent)}</span>
          <BudgetProgressBar budget={row.budget} spent={row.spent} />
        </div>
      ),
    },
    {
      id: 'workOrders',
      header: 'Work Orders',
      cell: (row) => (
        <span className="text-sm">
          {row.openWorkOrderCount} / {row.workOrderCount}
        </span>
      ),
    },
    {
      id: 'endDate',
      header: 'Due',
      accessorKey: 'endDate',
      cell: (row) => row.endDate ? (
        <span className={row.isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(row.endDate)}</span>
      ) : '-',
    },
    {
      id: 'actions',
      header: '',
      className: 'w-[100px]',
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/projects/${row.id}`) }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm"
            onClick={(e) => { e.stopPropagation(); setArchiveId(row.id) }}>
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="All Projects"
      description="Manage research projects"
      status={error ? 'error' : loading ? 'loading' : data.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No projects found"
      emptyDescription="Create your first project to get started."
      emptyAction={
        <Button size="sm" onClick={() => navigate('/projects')}>
          <Plus className="mr-1 h-4 w-4" /> Create Project
        </Button>
      }
      actions={
        <Button size="sm" onClick={() => navigate('/projects')}>
          <Plus className="mr-1 h-4 w-4" /> Create Project
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        isLoading={loading}
        filterPlaceholder="Search projects..."
        onRowClick={(row) => navigate(`/projects/${row.id}`)}
      />
      <ConfirmDialog
        open={!!archiveId}
        onOpenChange={() => setArchiveId(null)}
        title="Archive Project"
        description="Are you sure you want to archive this project? It will be hidden from the default view."
        confirmLabel="Archive"
        variant="warning"
        onConfirm={handleArchive}
        isLoading={archiving}
      />
    </PageContainer>
  )
}
