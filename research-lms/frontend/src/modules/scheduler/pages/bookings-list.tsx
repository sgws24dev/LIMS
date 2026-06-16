import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import { getBookings, type BookingDto, type BookingStatus } from '@/services/api/scheduling'
import { BookingStatusBadge } from '../components/booking-status-badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Pagination } from '@/shared/ui/pagination'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Search, Download, Repeat, XCircle, Eye } from 'lucide-react'
import { cancelBooking } from '@/services/api/scheduling'

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Confirmed', label: 'Confirmed' },
  { value: 'InProgress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'NoShow', label: 'No Show' },
]

export default function BookingsList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()

  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [bookings, setBookings] = useState<BookingDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState(moment().startOf('month').format('YYYY-MM-DD'))
  const [dateTo, setDateTo] = useState(moment().endOf('month').format('YYYY-MM-DD'))
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showBulkCancel, setShowBulkCancel] = useState(false)
  const [bulkCancelling, setBulkCancelling] = useState(false)
  const pageSize = 20

  const load = useCallback(async () => {
    setPageStatus('loading')
    try {
      const result = await getBookings({
        page,
        pageSize,
        status: statusFilter ? (statusFilter as BookingStatus) : undefined,
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
        search: searchQuery || undefined,
      })
      setBookings(result.items)
      setTotalCount(result.totalCount)
      setPageStatus('success')
    } catch {
      setPageStatus('error')
    }
  }, [page, statusFilter, dateFrom, dateTo, searchQuery])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'All Bookings' }])
    load()
  }, [load, setBreadcrumbs])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === bookings.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(bookings.map((b) => b.id)))
    }
  }

  const handleBulkCancel = async () => {
    setBulkCancelling(true)
    try {
      for (const id of selectedIds) {
        await cancelBooking(id)
      }
      toast({ title: `${selectedIds.size} bookings cancelled`, variant: 'success' })
      setSelectedIds(new Set())
      setShowBulkCancel(false)
      load()
    } catch {
      toast({ title: 'Failed to cancel some bookings', variant: 'destructive' })
    } finally {
      setBulkCancelling(false)
    }
  }

  const handleExport = () => {
    const headers = ['Title', 'Resource', 'User', 'Start', 'End', 'Status', 'Cost']
    const rows = bookings.map((b) => [
      b.title, b.resourceName, b.userName,
      moment(b.startTime).format('YYYY-MM-DD HH:mm'),
      moment(b.endTime).format('YYYY-MM-DD HH:mm'),
      b.status, b.cost ?? 0,
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `bookings-${moment().format('YYYY-MM-DD')}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <PageContainer
      title="Bookings"
      description="View and manage all resource bookings"
      status={pageStatus === 'error' ? 'error' : pageStatus === 'loading' ? 'loading' : 'success'}
      onRetry={load}
      actions={
        <div className="flex gap-2">
          {selectedIds.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setShowBulkCancel(true)}>
              <XCircle className="mr-1 h-4 w-4" /> Cancel {selectedIds.size}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} disabled={bookings.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button size="sm" onClick={() => navigate('/scheduler/book')}>
            New Booking
          </Button>
        </div>
      }
      loadingType="table"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="h-9" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="h-9" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                placeholder="Search title..."
                className="h-9 pl-8 w-56"
              />
            </div>
          </div>
        </div>

        {pageStatus === 'success' && bookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No bookings found.</div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <input type="checkbox" checked={selectedIds.size === bookings.length && bookings.length > 0} onChange={toggleAll} className="rounded" />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => (
                    <TableRow key={b.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/scheduler/bookings/${b.id}`)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(b.id)} onChange={() => toggleSelect(b.id)} className="rounded" />
                      </TableCell>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell><span className="text-sm">{b.resourceName}</span></TableCell>
                      <TableCell className="text-sm">
                        {moment(b.startTime).format('MMM D, h:mm A')}
                        <span className="text-muted-foreground"> - {moment(b.endTime).format('h:mm A')}</span>
                      </TableCell>
                      <TableCell><BookingStatusBadge status={b.status} /></TableCell>
                      <TableCell className="text-right">{b.cost != null ? `\u20B9${b.cost}` : '-'}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => navigate(`/scheduler/bookings/${b.id}`)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {(b.status === 'Pending' || b.status === 'Confirmed') && (
                            <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={async () => {
                              try {
                                await cancelBooking(b.id)
                                toast({ title: 'Booking cancelled', variant: 'success' })
                                load()
                              } catch {
                                toast({ title: 'Failed to cancel', variant: 'destructive' })
                              }
                            }}>
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
          </>
        )}
      </div>

      <ConfirmDialog
        open={showBulkCancel}
        onOpenChange={setShowBulkCancel}
        title="Bulk Cancel"
        description={`Are you sure you want to cancel ${selectedIds.size} booking(s)?`}
        variant="destructive"
        confirmLabel={`Cancel ${selectedIds.size} Booking(s)`}
        onConfirm={handleBulkCancel}
        isLoading={bulkCancelling}
      />
    </PageContainer>
  )
}
