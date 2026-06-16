import { useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getResourceConflicts, getUserConflicts, getResources,
  type ConflictDto, type BookingResourceDto,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/shared/ui/select'
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { AlertTriangle, Calendar, RotateCw, User } from 'lucide-react'

const TYPE_COLORS: Record<string, string> = {
  Overlap: 'border-red-300 bg-red-50',
  'User Conflict': 'border-orange-300 bg-orange-50',
  'Maintenance': 'border-amber-300 bg-amber-50',
  'Outside Hours': 'border-gray-300 bg-gray-50',
}

export default function SchedulerConflicts() {
  const { setBreadcrumbs } = useUIStore()
  const [pageStatus, setPageStatus] = useState<PageStatus>('success')
  const [conflicts, setConflicts] = useState<ConflictDto[]>([])
  const [resources, setResources] = useState<BookingResourceDto[]>([])
  const [resourceId, setResourceId] = useState('')
  const [userId, setUserId] = useState('')
  const [from, setFrom] = useState(moment().startOf('week').format('YYYY-MM-DDTHH:mm'))
  const [to, setTo] = useState(moment().endOf('week').format('YYYY-MM-DDTHH:mm'))

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Conflicts' }])
    getResources().then(setResources).catch(() => {})
  }, [setBreadcrumbs])

  const fetchResourceConflicts = useCallback(async () => {
    setPageStatus('loading')
    try {
      const data = await getResourceConflicts(
        new Date(from).toISOString(),
        new Date(to).toISOString(),
        resourceId || undefined,
      )
      setConflicts(data)
      setPageStatus(data.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [resourceId, from, to])

  const fetchUserConflicts = useCallback(async () => {
    if (!userId) { setConflicts([]); setPageStatus('success'); return }
    setPageStatus('loading')
    try {
      const data = await getUserConflicts(
        userId,
        new Date(from).toISOString(),
        new Date(to).toISOString(),
      )
      setConflicts(data)
      setPageStatus(data.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [userId, from, to])

  return (
    <PageContainer
      title="Booking Conflicts"
      description="Detect scheduling conflicts across resources and users"
      status={pageStatus}
      onRetry={fetchResourceConflicts}
      emptyTitle="No conflicts detected"
      emptyDescription="The selected time range has no overlapping bookings."
      actions={
        <Button variant="outline" size="icon" onClick={fetchResourceConflicts}>
          <RotateCw className="h-4 w-4" />
        </Button>
      }
    >
      <Tabs defaultValue="resource" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resource"><Calendar className="mr-2 h-4 w-4" />Resource Conflicts</TabsTrigger>
          <TabsTrigger value="user"><User className="mr-2 h-4 w-4" />User Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="resource" className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label>Resource</Label>
              <Select value={resourceId} onValueChange={setResourceId}>
                <SelectTrigger className="w-[220px]"><SelectValue placeholder="All Resources" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Resources</SelectItem>
                  {resources.map((r) => (
                    <SelectItem key={r.resourceId} value={r.resourceId}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>From</Label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <Button onClick={fetchResourceConflicts}>Check</Button>
          </div>

          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <Card key={i} className={TYPE_COLORS[c.type] || ''}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{c.type}</Badge>
                        {c.resourceName && <span className="font-medium">{c.resourceName}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {moment(c.startTime).format('MMM D, YYYY h:mm A')} &ndash;{' '}
                        {moment(c.endTime).format('MMM D, YYYY h:mm A')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label>User ID</Label>
              <Input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user UUID"
                className="w-[280px]"
              />
            </div>
            <div className="space-y-1">
              <Label>From</Label>
              <Input
                type="datetime-local"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <div className="space-y-1">
              <Label>To</Label>
              <Input
                type="datetime-local"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-[200px]"
              />
            </div>
            <Button onClick={fetchUserConflicts} disabled={!userId}>Check</Button>
          </div>

          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <Card key={i} className={TYPE_COLORS[c.type] || ''}>
                <CardContent className="py-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{c.type}</Badge>
                        {c.userName && <span className="font-medium">{c.userName}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.details}</p>
                      <p className="text-xs text-muted-foreground">
                        {moment(c.startTime).format('MMM D, YYYY h:mm A')} &ndash;{' '}
                        {moment(c.endTime).format('MMM D, YYYY h:mm A')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
