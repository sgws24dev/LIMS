import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/shared/ui/tabs'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/shared/ui/alert-dialog'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/shared/ui/table'
import { RefreshCw, Link2, Link2Off, History, Cloud, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import moment from 'moment'
import {
  getCalendarSyncStatus, getSyncLogs, disconnectCalendar, triggerManualSync,
  type CalendarSyncStatusDto, type SyncLogDto,
} from '@/services/api/scheduling'

const PROVIDER_LABELS: Record<string, string> = {
  Outlook365: 'Outlook 365',
  GoogleCalendar: 'Google Calendar',
}

const PROVIDER_ICONS: Record<string, typeof Cloud> = {
  Outlook365: Calendar,
  GoogleCalendar: Cloud,
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Success: 'default',
  Partial: 'secondary',
  Failed: 'destructive',
}

export default function CalendarSyncSettings() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [status, setStatus] = useState<CalendarSyncStatusDto | null>(null)
  const [logs, setLogs] = useState<SyncLogDto[]>([])
  const [disconnectProvider, setDisconnectProvider] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Calendar Sync' }])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const [statusData, logsData] = await Promise.all([
        getCalendarSyncStatus(),
        getSyncLogs(),
      ])
      setStatus(statusData)
      setLogs(logsData)
      setPageStatus('success')
    } catch {
      setPageStatus('error')
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleConnect = (provider: string) => {
    const redirectUri = `${window.location.origin}/scheduler/calendar-sync/callback`
    const state = JSON.stringify({ provider, redirectUri })
    window.location.href = `${import.meta.env.VITE_API_URL || ''}/api/v1/scheduling/calendar-sync/auth-url?provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`
  }

  const handleDisconnect = async () => {
    if (!disconnectProvider) return
    try {
      await disconnectCalendar(disconnectProvider)
      toast({ title: 'Calendar disconnected', variant: 'success' })
      setDisconnectProvider(null)
      fetchData()
    } catch {
      toast({ title: 'Failed to disconnect', variant: 'destructive' })
    }
  }

  const handleSync = async (provider: string) => {
    setSyncing(provider)
    try {
      await triggerManualSync(provider)
      toast({ title: 'Sync triggered', variant: 'success' })
      setTimeout(fetchData, 2000)
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' })
    } finally {
      setSyncing(null)
    }
  }

  return (
    <PageContainer
      title="Calendar Sync Settings"
      description="Connect your Outlook or Google Calendar to sync bookings"
      status={pageStatus}
      onRetry={fetchData}
    >
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections"><Link2 className="mr-2 h-4 w-4" />Connections</TabsTrigger>
          <TabsTrigger value="logs"><History className="mr-2 h-4 w-4" />Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Outlook365', 'GoogleCalendar'].map((provider) => {
              const Icon = PROVIDER_ICONS[provider]
              const conn = status?.connections?.find((c) => c.provider === provider)
              return (
                <Card key={provider}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{PROVIDER_LABELS[provider]}</CardTitle>
                    </div>
                    <Badge variant={conn?.isConnected ? 'default' : 'secondary'}>
                      {conn?.isConnected ? 'Connected' : 'Not Connected'}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conn?.lastSyncAt && (
                      <p className="text-xs text-muted-foreground">
                        Last synced: {moment(conn.lastSyncAt).format('MMM D, YYYY h:mm A')}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {conn?.isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSync(provider)}
                            disabled={syncing === provider}
                          >
                            <RefreshCw className={`mr-1 h-4 w-4 ${syncing === provider ? 'animate-spin' : ''}`} />
                            Sync Now
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDisconnectProvider(provider)}
                          >
                            <Link2Off className="mr-1 h-4 w-4" />
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button variant="default" size="sm" onClick={() => handleConnect(provider)}>
                          <Link2 className="mr-1 h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="logs">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Deleted</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No sync logs yet
                    </TableCell>
                  </TableRow>
                )}
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">{moment(log.syncedAt).format('MMM D h:mm A')}</TableCell>
                    <TableCell>{PROVIDER_LABELS[log.provider] || log.provider}</TableCell>
                    <TableCell className="capitalize">{log.direction.toLowerCase()}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[log.status] || 'outline'}>{log.status}</Badge>
                    </TableCell>
                    <TableCell>{log.eventsCreated}</TableCell>
                    <TableCell>{log.eventsUpdated}</TableCell>
                    <TableCell>{log.eventsDeleted}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-red-500" title={log.errorMessage}>
                      {log.errorMessage || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!disconnectProvider} onOpenChange={() => setDisconnectProvider(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Calendar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect {disconnectProvider ? PROVIDER_LABELS[disconnectProvider] : ''}?
              Existing sync mappings will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect}>Disconnect</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
