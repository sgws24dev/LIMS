import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { DataTable, type ColumnDef } from '@/shared/ui/data-table'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { WorkOrderKanban } from '../components/work-order-kanban'
import { ProjectStatusBadge } from '../components/project-status-badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrderStatus, type WorkOrderDto, type WorkOrderDetailDto, type WorkOrderStatus } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { Plus, Eye, Columns, List } from 'lucide-react'

export default function WorkOrdersPage() {
  const { projectId } = useParams<{ projectId?: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const [data, setData] = useState<WorkOrderDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedWo, setSelectedWo] = useState<WorkOrderDetailDto | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getWorkOrders({ projectId, page: 1, pageSize: 100 })
      setData(result.items)
    } catch {
      setError('Failed to load work orders.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Projects' },
      ...(projectId ? [{ label: 'Project', href: `/projects/${projectId}` }] : []),
      { label: 'Work Orders' },
    ])
    fetchData()
  }, [fetchData, setBreadcrumbs, projectId])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      await createWorkOrder({
        projectId: projectId || (form.get('projectId') as string),
        title: form.get('title') as string,
        description: form.get('description') as string || undefined,
        priority: (form.get('priority') as string) as any || 'Medium',
        assignedToName: (form.get('assignedToName') as string) || undefined,
        estimatedHours: Number(form.get('estimatedHours')) || 0,
        startDate: (form.get('startDate') as string) || undefined,
        dueDate: (form.get('dueDate') as string) || undefined,
        tags: (form.get('tags') as string) || undefined,
        costCenterId: (form.get('costCenterId') as string) || undefined,
      })
      toast({ title: 'Work order created', variant: 'success' })
      setShowCreate(false)
      fetchData()
    } catch {
      toast({ title: 'Failed to create work order', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: WorkOrderStatus) => {
    setUpdating(true)
    try {
      await updateWorkOrderStatus(id, newStatus)
      toast({ title: `Status updated to ${newStatus}`, variant: 'success' })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
      fetchData()
    } finally {
      setUpdating(false)
    }
  }

  const handleCardClick = async (id: string) => {
    setDetailLoading(true)
    try {
      const detail = await getWorkOrderById(id)
      setSelectedWo(detail)
    } catch {
      toast({ title: 'Failed to load details', variant: 'destructive' })
    } finally {
      setDetailLoading(false)
    }
  }

  const columns: ColumnDef<WorkOrderDto>[] = [
    { id: 'title', header: 'Title', accessorKey: 'title', sortable: true, filterable: true },
    { id: 'status', header: 'Status', cell: (row) => <ProjectStatusBadge status={row.status as any} /> },
    { id: 'priority', header: 'Priority', cell: (row) => <Badge variant="outline">{row.priority}</Badge> },
    { id: 'assignedToName', header: 'Assignee', accessorKey: 'assignedToName' },
    {
      id: 'estimatedHours', header: 'Est. Hours', accessorKey: 'estimatedHours',
      cell: (row) => `${row.estimatedHours}h`,
    },
    {
      id: 'actualHours', header: 'Act. Hours', accessorKey: 'actualHours',
      cell: (row) => `${row.actualHours}h`,
    },
    {
      id: 'dueDate', header: 'Due', accessorKey: 'dueDate',
      cell: (row) => row.dueDate ? (
        <span className={row.isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(row.dueDate)}</span>
      ) : '-',
    },
    {
      id: 'actions', header: '', className: 'w-[60px]',
      cell: (row) => (
        <Button variant="ghost" size="icon-sm"
          onClick={(e) => { e.stopPropagation(); handleCardClick(row.id) }}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  return (
    <PageContainer
      title={projectId ? 'Project Work Orders' : 'All Work Orders'}
      description="Manage work orders"
      status={error ? 'error' : loading ? 'loading' : data.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No work orders found"
      emptyDescription="Create your first work order."
      emptyAction={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Work Order
        </Button>
      }
      actions={
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden text-xs mr-2">
            <button
              className={`px-3 py-1.5 flex items-center gap-1 ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setView('kanban')}
            >
              <Columns className="h-3 w-3" /> Kanban
            </button>
            <button
              className={`px-3 py-1.5 flex items-center gap-1 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              onClick={() => setView('list')}
            >
              <List className="h-3 w-3" /> List
            </button>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create
          </Button>
        </div>
      }
    >
      {view === 'kanban' ? (
        <WorkOrderKanban
          workOrders={data}
          onStatusChange={handleStatusChange}
          onCardClick={handleCardClick}
          isUpdating={updating}
        />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          filterPlaceholder="Search work orders..."
          onRowClick={(row) => handleCardClick(row.id)}
        />
      )}

      <Sheet open={!!selectedWo} onOpenChange={() => setSelectedWo(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedWo && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedWo.title}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <ProjectStatusBadge status={selectedWo.status as any} />
                  <Badge variant="outline">{selectedWo.priority}</Badge>
                </div>
                {selectedWo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedWo.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Assignee:</span> {selectedWo.assignedToName || 'Unassigned'}</div>
                  <div><span className="text-gray-500">Project:</span> {selectedWo.projectName}</div>
                  <div><span className="text-gray-500">Est. Hours:</span> {selectedWo.estimatedHours}h</div>
                  <div><span className="text-gray-500">Actual Hours:</span> {selectedWo.actualHours}h</div>
                  {selectedWo.startDate && <div><span className="text-gray-500">Start:</span> {formatDate(selectedWo.startDate)}</div>}
                  {selectedWo.dueDate && <div><span className="text-gray-500">Due:</span> {formatDate(selectedWo.dueDate)}</div>}
                  {selectedWo.costCenterName && <div><span className="text-gray-500">Cost Center:</span> {selectedWo.costCenterName}</div>}
                  <div><span className="text-gray-500">Billed:</span> {formatCurrency(selectedWo.billedAmount)}</div>
                </div>
                {selectedWo.tags && (
                  <div className="flex flex-wrap gap-1">
                    {selectedWo.tags.split(',').map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">{tag.trim()}</Badge>
                    ))}
                  </div>
                )}
                {selectedWo.linkedIssues && selectedWo.linkedIssues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Linked Issues ({selectedWo.linkedIssues.length})</h4>
                    <div className="space-y-1">
                      {selectedWo.linkedIssues.map((iss) => (
                        <div key={iss.id}
                          className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                          onClick={() => navigate(`/issues/${iss.id}`)}>
                          {iss.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 italic pt-4">Comments coming in Phase 7</p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader><DialogTitle>Create Work Order</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" required maxLength={300} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="Medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input id="estimatedHours" name="estimatedHours" type="number" min="0" step="0.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedToName">Assignee</Label>
                  <Input id="assignedToName" name="assignedToName" />
                </div>
                <div>
                  <Label htmlFor="costCenterId">Cost Center ID</Label>
                  <Input id="costCenterId" name="costCenterId" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" name="dueDate" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" name="tags" placeholder="e.g. maintenance, lab-a" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                          <Button type="submit" disabled={creating}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
