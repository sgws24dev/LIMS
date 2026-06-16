import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getRecurringRuleById, updateRecurringRule, deleteRecurringRule,
  type RecurringRuleDetailDto, type RecurringFrequency, RecurringRuleStatus, BookingStatus,
} from '@/services/api/scheduling'
import { BookingStatusBadge } from '../components/booking-status-badge'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { Repeat, Pause, Play, XCircle, ArrowLeft, CalendarDays, Clock } from 'lucide-react'

const FREQ_LABELS: Record<RecurringFrequency, string> = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  BiWeekly: 'Bi-Weekly',
  Monthly: 'Monthly',
  Custom: 'Custom',
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function RecurringRuleDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [rule, setRule] = useState<RecurringRuleDetailDto | null>(null)
  const [showCancel, setShowCancel] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    if (!id) return
    setPageStatus('loading')
    try {
      const data = await getRecurringRuleById(id)
      setRule(data)
      setPageStatus('success')
    } catch {
      setPageStatus('error')
    }
  }, [id])

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Scheduling', href: '/scheduler/calendar' },
      { label: 'Recurring Rules', href: '/scheduler/recurring-rules' },
      { label: 'Rule Detail' },
    ])
    load()
  }, [load, setBreadcrumbs])

  const handlePauseResume = async () => {
    if (!rule) return
    setActionLoading(true)
    try {
      await updateRecurringRule(rule.id, {
        status: rule.status === RecurringRuleStatus.Active ? RecurringRuleStatus.Paused : RecurringRuleStatus.Active,
      })
      toast({ title: `Rule ${rule.status === RecurringRuleStatus.Active ? 'paused' : 'resumed'}`, variant: 'success' })
      load()
    } catch {
      toast({ title: 'Failed to update rule', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!rule) return
    setActionLoading(true)
    try {
      await deleteRecurringRule(rule.id)
      toast({ title: 'Rule cancelled', variant: 'success' })
      setShowCancel(false)
      navigate('/scheduler/recurring-rules')
    } catch {
      toast({ title: 'Failed to cancel rule', variant: 'destructive' })
    } finally {
      setActionLoading(false)
    }
  }

  if (pageStatus === 'error' || (pageStatus !== 'loading' && !rule)) {
    return <PageContainer title="Recurring Rule" status="error" onRetry={load} />
  }

  if (!rule) {
    return <PageContainer title="Recurring Rule" status="loading" loadingType="detail" />
  }

  const activeDays = DAY_NAMES.filter((_, i) => rule.dayOfWeekMask ? (rule.dayOfWeekMask & (1 << i)) : false)

  return (
    <PageContainer
      title={rule.title}
      description={`${FREQ_LABELS[rule.frequency]} rule`}
      actions={
        <div className="flex gap-2">
          {(rule.status === RecurringRuleStatus.Active || rule.status === RecurringRuleStatus.Paused) && (
            <Button variant="outline" size="sm" onClick={handlePauseResume} disabled={actionLoading}>
              {rule.status === RecurringRuleStatus.Active ? <Pause className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {rule.status === RecurringRuleStatus.Active ? 'Pause' : 'Resume'}
            </Button>
          )}
          {(rule.status === RecurringRuleStatus.Active || rule.status === RecurringRuleStatus.Paused) && (
            <Button variant="destructive" size="sm" onClick={() => setShowCancel(true)} disabled={actionLoading}>
              <XCircle className="mr-1 h-4 w-4" /> Cancel Rule
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => navigate('/scheduler/recurring-rules')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rule Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Repeat className="h-3 w-3" /> Frequency</p>
                  <p className="font-medium"><Badge variant="outline">{FREQ_LABELS[rule.frequency]}</Badge></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium"><Badge variant={rule.status === RecurringRuleStatus.Active ? 'success' : rule.status === RecurringRuleStatus.Paused ? 'warning' : 'secondary'}>{rule.status}</Badge></p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> Time</p>
                  <p className="font-medium">{moment(rule.timeOfDay, 'HH:mm:ss').format('h:mm A')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{rule.durationMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-muted-foreground flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Effective From</p>
                  <p className="font-medium">{rule.effectiveFrom ? moment(rule.effectiveFrom).format('MMM D, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Effective To</p>
                  <p className="font-medium">{rule.effectiveTo ? moment(rule.effectiveTo).format('MMM D, YYYY') : 'Ongoing'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Generated</p>
                  <p className="font-medium">{rule.generatedCount} / {rule.maxInstances}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Generated</p>
                  <p className="font-medium">{rule.lastGeneratedDate ? moment(rule.lastGeneratedDate).format('MMM D, YYYY') : 'Never'}</p>
                </div>
              </div>
              {activeDays.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Active Days: </span>
                  <div className="flex gap-1 mt-1">
                    {DAY_NAMES.map((d, i) => (
                      <span key={d} className={`flex h-7 w-10 items-center justify-center rounded-md text-xs font-medium border ${
                        rule.dayOfWeekMask && (rule.dayOfWeekMask & (1 << i))
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-transparent'
                      }`}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {rule.purpose && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Purpose:</span>
                  <p>{rule.purpose}</p>
                </div>
              )}
              {rule.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p>{rule.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Instances</CardTitle>
            </CardHeader>
            <CardContent>
              {rule.upcomingInstances.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming instances.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rule.upcomingInstances.map((b, i) => (
                      <TableRow key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/scheduler/bookings/${b.id}`)}>
                        <TableCell>{moment(b.startTime).format('ddd, MMM D, YYYY')}</TableCell>
                        <TableCell>{moment(b.startTime).format('h:mm A')} - {moment(b.endTime).format('h:mm A')}</TableCell>
                        <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="text-muted-foreground">Name:</span> {rule.resourceName}</p>
              <p><span className="text-muted-foreground">Type:</span> {rule.resourceType}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p><span className="text-muted-foreground">Name:</span> {rule.userName}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showCancel}
        onOpenChange={setShowCancel}
        title="Cancel Recurring Rule"
        description="Cancel this recurring rule? All future instances will also be cancelled."
        variant="destructive"
        confirmLabel="Cancel Rule"
        onConfirm={handleCancel}
        isLoading={actionLoading}
      />
    </PageContainer>
  )
}
