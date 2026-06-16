import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getRecurringRules, updateRecurringRule, deleteRecurringRule,
  type RecurringRuleDto, RecurringRuleStatus, type RecurringFrequency,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Pagination } from '@/shared/ui/pagination'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { Repeat, Pause, Play, XCircle, Plus } from 'lucide-react'
import { RecurringBookingDialog, type RecurringConfig } from '../components/recurring-booking-dialog'
import { createRecurringRule } from '@/services/api/scheduling'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Paused', label: 'Paused' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const statusVariant: Record<RecurringRuleStatus, 'success' | 'warning' | 'secondary' | 'destructive'> = {
  Active: 'success',
  Paused: 'warning',
  Completed: 'secondary',
  Cancelled: 'destructive',
}

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  BiWeekly: 'Bi-Weekly',
  Monthly: 'Monthly',
  Custom: 'Custom',
}

export default function RecurringRulesPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [rules, setRules] = useState<RecurringRuleDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<RecurringRuleDto | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const pageSize = 20

  const load = useCallback(async () => {
    setPageStatus('loading')
    try {
      const result = await getRecurringRules({
        page,
        pageSize,
        status: statusFilter ? (statusFilter as RecurringRuleStatus) : undefined,
      })
      setRules(result.items)
      setTotalCount(result.totalCount)
      setPageStatus('success')
    } catch {
      setPageStatus('error')
    }
  }, [page, statusFilter])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Recurring Rules' }])
    load()
  }, [load, setBreadcrumbs])

  const handlePauseResume = async (rule: RecurringRuleDto) => {
    try {
      await updateRecurringRule(rule.id, {
        status: rule.status === RecurringRuleStatus.Active ? RecurringRuleStatus.Paused : RecurringRuleStatus.Active,
      })
      toast({ title: `Rule ${rule.status === RecurringRuleStatus.Active ? 'paused' : 'resumed'}`, variant: 'success' })
      load()
    } catch {
      toast({ title: 'Failed to update rule', variant: 'destructive' })
    }
  }

  const handleCancel = async () => {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await deleteRecurringRule(cancelTarget.id)
      toast({ title: 'Rule cancelled', variant: 'success' })
      setCancelTarget(null)
      load()
    } catch {
      toast({ title: 'Failed to cancel rule', variant: 'destructive' })
    } finally {
      setCancelling(false)
    }
  }

  const handleCreateRule = async (config: RecurringConfig) => {
    try {
      const result = await createRecurringRule({
        resourceId: '',
        title: 'Recurring Booking',
        frequency: config.frequency,
        dayOfWeekMask: config.dayOfWeekMask,
        timeOfDay: config.timeOfDay,
        durationMinutes: config.durationMinutes,
        effectiveFrom: config.effectiveFrom,
        effectiveTo: config.effectiveTo,
        maxInstances: config.maxInstances,
      })
      toast({ title: 'Recurring rule created', variant: 'success' })
      setShowCreate(false)
      navigate(`/scheduler/recurring-rules/${result.id}`)
    } catch {
      toast({ title: 'Failed to create rule', variant: 'destructive' })
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <PageContainer
      title="Recurring Rules"
      description="Manage recurring booking rules"
      status={pageStatus}
      onRetry={load}
      loadingType="table"
      actions={
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="h-9 w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" /> New Rule
          </Button>
        </div>
      }
    >
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No recurring rules found.
                </TableCell>
              </TableRow>
            ) : rules.map((r) => (
              <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/scheduler/recurring-rules/${r.id}`)}>
                <TableCell className="font-medium">{r.title}</TableCell>
                <TableCell><Badge variant="outline">{FREQ_LABELS[r.frequency]}</Badge></TableCell>
                <TableCell className="text-sm">{moment(r.timeOfDay, 'HH:mm:ss').format('h:mm A')}</TableCell>
                <TableCell className="text-sm">{r.durationMinutes} min</TableCell>
                <TableCell className="text-sm">{r.generatedCount} / {r.maxInstances}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    {(r.status === RecurringRuleStatus.Active || r.status === RecurringRuleStatus.Paused) && (
                      <Button variant="ghost" size="icon-sm" onClick={() => handlePauseResume(r)}>
                        {r.status === RecurringRuleStatus.Active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}
                    {(r.status === RecurringRuleStatus.Active || r.status === RecurringRuleStatus.Paused) && (
                      <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setCancelTarget(r)}>
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <RecurringBookingDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onConfirm={handleCreateRule}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={() => setCancelTarget(null)}
        title="Cancel Recurring Rule"
        description={`Cancel "${cancelTarget?.title}"? This will cancel all future instances.`}
        variant="destructive"
        confirmLabel="Cancel Rule"
        onConfirm={handleCancel}
        isLoading={cancelling}
      />
    </PageContainer>
  )
}
