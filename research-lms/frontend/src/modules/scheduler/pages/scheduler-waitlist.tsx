import { useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getWaitlist, leaveWaitlist, getResources,
  type WaitlistEntryDto, type BookingResourceDto, WaitlistStatus,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/shared/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/ui/dialog'
import { ListOrdered, X, Clock, User, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const STATUS_VARIANTS: Record<WaitlistStatus, 'outline' | 'secondary' | 'default' | 'destructive'> = {
  Waiting: 'secondary',
  Offered: 'default',
  Expired: 'destructive',
  Fulfilled: 'outline',
  Cancelled: 'outline',
}

export default function SchedulerWaitlist() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [entries, setEntries] = useState<WaitlistEntryDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [filterResource, setFilterResource] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<WaitlistEntryDto | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Waitlist' }])
    getResources().then(setResources).catch(() => {})
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const params: { resourceId?: string; status?: WaitlistStatus; page: number; pageSize: number } = {
        page, pageSize: 20,
      }
      if (filterResource) params.resourceId = filterResource
      if (filterStatus) params.status = filterStatus as WaitlistStatus
      const result = await getWaitlist(params)
      setEntries(result.items)
      setTotalCount(result.totalCount)
      setPageStatus(result.items.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [filterResource, filterStatus, page])

  useEffect(() => { fetchData() }, [fetchData])

  const handleLeave = async (id: string) => {
    try {
      await leaveWaitlist(id)
      toast({ title: 'Left waitlist', variant: 'success' })
      setDetailOpen(false)
      fetchData()
    } catch {
      toast({ title: 'Failed to leave waitlist', variant: 'destructive' })
    }
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <PageContainer
      title="Waitlist"
      description="Manage resource waitlist entries"
      status={pageStatus}
      onRetry={fetchData}
      actions={
        <div className="flex items-center gap-2">
          <Select value={filterResource} onValueChange={(v) => { setFilterResource(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Resources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              {resources.map((r) => (
                <SelectItem key={r.resourceId} value={r.resourceId}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              {Object.values(WaitlistStatus).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
      emptyTitle="No waitlist entries"
      emptyDescription="Users can join the waitlist when resources are fully booked."
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Resource</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow
              key={entry.id}
              className="cursor-pointer"
              onClick={() => { setSelected(entry); setDetailOpen(true) }}
            >
              <TableCell className="text-muted-foreground">{entry.position}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{entry.userName}</span>
                </div>
              </TableCell>
              <TableCell className="font-medium">{entry.resourceName}</TableCell>
              <TableCell>{moment(entry.requestedDate).format('MMM D, YYYY')}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {entry.requestedStartTime} &ndash; {entry.requestedEndTime}
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANTS[entry.status]}>{entry.status}</Badge>
              </TableCell>
              <TableCell>
                {entry.status === WaitlistStatus.Waiting && (
                  <Button
                    variant="ghost" size="icon-sm"
                    onClick={(e) => { e.stopPropagation(); handleLeave(entry.id) }}
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * 20 + 1}&ndash;{Math.min(page * 20, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Waitlist Entry</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANTS[selected.status]}>{selected.status}</Badge>
                <Badge variant="outline">#{selected.position}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{selected.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Resource</p>
                  <p className="font-medium">{selected.resourceName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{moment(selected.requestedDate).format('MMM D, YYYY')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{selected.requestedStartTime} &ndash; {selected.requestedEndTime}</p>
                </div>
              </div>
              {selected.notes && (
                <p className="text-sm"><span className="text-muted-foreground">Notes:</span> {selected.notes}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Requested {moment(selected.createdAt).format('MMM D, YYYY h:mm A')}
              </p>
            </div>
          )}
          <DialogFooter>
            {selected?.status === WaitlistStatus.Waiting && (
              <Button variant="destructive" onClick={() => handleLeave(selected.id)}>
                <X className="mr-2 h-4 w-4" /> Leave Waitlist
              </Button>
            )}
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
