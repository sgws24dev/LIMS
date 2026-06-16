import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getConstraints, createConstraint, updateConstraint, deleteConstraint, getResources,
  type ConstraintDto, type BookingResourceDto, type CreateConstraintRequest,
  type UpdateConstraintRequest, ConstraintType, ResourceType,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/shared/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui/table'
import { Switch } from '@/shared/ui/switch'
import { Plus, Pencil, Trash2, ShieldAlert } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const CONSTRAINT_LABELS: Record<ConstraintType, string> = {
  MaxBookingDuration: 'Max Booking Duration',
  MinBookingDuration: 'Min Booking Duration',
  MaxAdvanceBooking: 'Max Advance Booking',
  MinAdvanceBooking: 'Min Advance Booking',
  MaxDailyBookings: 'Max Daily Bookings',
  MaxWeeklyBookings: 'Max Weekly Bookings',
  RequiredCompetency: 'Required Competency',
  RequiredRole: 'Required Role',
  TimeOfDayRestriction: 'Time of Day Restriction',
}

const CONSTRAINT_FORMATS: Record<ConstraintType, string> = {
  MaxBookingDuration: 'minutes (e.g. 120)',
  MinBookingDuration: 'minutes (e.g. 15)',
  MaxAdvanceBooking: 'days (e.g. 90)',
  MinAdvanceBooking: 'days (e.g. 1)',
  MaxDailyBookings: 'count (e.g. 3)',
  MaxWeeklyBookings: 'count (e.g. 10)',
  RequiredCompetency: 'competency ID',
  RequiredRole: 'role name',
  TimeOfDayRestriction: 'HH:mm-HH:mm',
}

export default function SchedulerConstraints() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [constraints, setConstraints] = useState<ConstraintDto[]>([])
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [filterType, setFilterType] = useState<string>('')
  const [filterResource, setFilterResource] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ConstraintDto | null>(null)
  const [form, setForm] = useState<CreateConstraintRequest>({
    type: ConstraintType.MaxBookingDuration,
    value: '',
    description: '',
    errorMessage: '',
  })
  const [formResourceId, setFormResourceId] = useState('')
  const [formResourceType, setFormResourceType] = useState('')

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Constraints' }])
    getResources().then(setResources).catch(() => {})
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const params: { resourceId?: string; type?: ConstraintType } = {}
      if (filterResource) params.resourceId = filterResource
      if (filterType) params.type = filterType as ConstraintType
      const data = await getConstraints(params)
      setConstraints(data)
      setPageStatus(data.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [filterResource, filterType])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ type: ConstraintType.MaxBookingDuration, value: '', description: '', errorMessage: '' })
    setFormResourceId('')
    setFormResourceType('')
    setDialogOpen(true)
  }

  const openEdit = (c: ConstraintDto) => {
    setEditing(c)
    setForm({
      type: c.type,
      value: c.value,
      description: c.description,
      errorMessage: c.errorMessage,
    })
    setFormResourceId(c.resourceId || '')
    setFormResourceType(c.resourceType || '')
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        const updateReq: UpdateConstraintRequest = {
          value: form.value,
          description: form.description,
          errorMessage: form.errorMessage,
          isActive: editing.isActive,
        }
        await updateConstraint(editing.id, updateReq)
        toast({ title: 'Constraint updated', variant: 'success' })
      } else {
        await createConstraint({
          ...form,
          resourceId: formResourceId || undefined,
          resourceType: formResourceType ? formResourceType as ResourceType : undefined,
        })
        toast({ title: 'Constraint created', variant: 'success' })
      }
      setDialogOpen(false)
      fetchData()
    } catch {
      toast({ title: 'Failed to save constraint', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteConstraint(id)
      toast({ title: 'Constraint deleted', variant: 'success' })
      fetchData()
    } catch {
      toast({ title: 'Failed to delete constraint', variant: 'destructive' })
    }
  }

  return (
    <PageContainer
      title="Booking Constraints"
      description="Define rules for resource booking eligibility"
      status={pageStatus}
      onRetry={fetchData}
      actions={
        <div className="flex items-center gap-2">
          <Select value={filterResource} onValueChange={setFilterResource}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Resources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              {resources.map((r) => (
                <SelectItem key={r.resourceId} value={r.resourceId}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {Object.entries(CONSTRAINT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Constraint</Button>
        </div>
      }
      emptyTitle="No constraints defined"
      emptyDescription="Create booking rules to control resource eligibility."
      emptyAction={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Constraint</Button>}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {constraints.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Badge variant="outline">{CONSTRAINT_LABELS[c.type] || c.type}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {c.resourceId
                  ? <span className="font-medium">{resources.find(r => r.resourceId === c.resourceId)?.name || c.resourceId.slice(0, 8)}</span>
                  : <span className="text-muted-foreground">Global</span>}
              </TableCell>
              <TableCell className="font-mono text-sm">{c.value}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {c.description || '-'}
              </TableCell>
              <TableCell>
                <Switch checked={c.isActive} onCheckedChange={async (v) => {
                  await updateConstraint(c.id, {
                    value: c.value, description: c.description, errorMessage: c.errorMessage, isActive: v
                  })
                  fetchData()
                }} />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Constraint' : 'Add Constraint'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Resource</Label>
              <Select value={formResourceId} onValueChange={setFormResourceId}>
                <SelectTrigger><SelectValue placeholder="Global (all resources)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Global</SelectItem>
                  {resources.map((r) => (
                    <SelectItem key={r.resourceId} value={r.resourceId}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Resource Type</Label>
              <Select value={formResourceType} onValueChange={setFormResourceType}>
                <SelectTrigger><SelectValue placeholder="Any type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {Object.values(ResourceType).map((rt) => (
                    <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as ConstraintType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONSTRAINT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Value ({CONSTRAINT_FORMATS[form.type] || 'text'})</Label>
              <Input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={CONSTRAINT_FORMATS[form.type]}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Input
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Error Message</Label>
              <Input
                value={form.errorMessage || ''}
                onChange={(e) => setForm({ ...form, errorMessage: e.target.value })}
                placeholder="Shown to user when constraint is violated"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.value}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
