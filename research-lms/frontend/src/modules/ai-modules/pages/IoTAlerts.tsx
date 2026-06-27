import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Eye, Loader2, Bell, Filter } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/hooks/use-toast'
import {
  getAlerts, acknowledgeAlert, resolveAlert,
  type IoTAlertDto
} from '@/services/api/ai'

export default function IoTAlerts() {
  const { toast } = useToast()
  const [alerts, setAlerts] = useState<IoTAlertDto[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [selectedAlert, setSelectedAlert] = useState<IoTAlertDto | null>(null)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const data = await getAlerts(undefined, filterStatus || undefined)
      setAlerts(data)
    } catch {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id)
      toast({ title: 'Alert acknowledged' })
      loadAlerts()
    } catch {
      toast({ title: 'Error', description: 'Failed to acknowledge alert.', variant: 'destructive' })
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id)
      toast({ title: 'Alert resolved' })
      setSelectedAlert(null)
      loadAlerts()
    } catch {
      toast({ title: 'Error', description: 'Failed to resolve alert.', variant: 'destructive' })
    }
  }

  const severityColors: Record<string, string> = {
    Critical: 'bg-red-500/10 text-red-600 border-red-200',
    Warning: 'bg-amber-500/10 text-amber-600 border-amber-200',
  }

  const statusColors: Record<string, string> = {
    Open: 'bg-blue-500/10 text-blue-600',
    Acknowledged: 'bg-purple-500/10 text-purple-600',
    Resolved: 'bg-green-500/10 text-green-600',
    Snoozed: 'bg-gray-500/10 text-gray-600',
  }

  if (loading) return <PageContainer title="IoT Alerts"><div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div></PageContainer>

  return (
    <PageContainer title="IoT Alerts" description="Monitor and manage instrument alerts">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-xs">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); }}
              className="pl-8 h-9 w-full rounded-md border border-input bg-background text-sm"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Acknowledged">Acknowledged</option>
              <option value="Resolved">Resolved</option>
              <option value="Snoozed">Snoozed</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={loadAlerts}>
            <Loader2 className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>

        {alerts.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No alerts found.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {alerts.map(alert => (
              <Card
                key={alert.id}
                className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedAlert?.id === alert.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'Critical' ? 'text-destructive' : 'text-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={severityColors[alert.severity] || ''}>{alert.severity}</Badge>
                        <Badge className={statusColors[alert.status] || ''}>{alert.status}</Badge>
                        <span className="text-xs text-muted-foreground">{alert.metricName}</span>
                      </div>
                      <p className="text-sm">
                        Actual: <span className="font-medium">{alert.actualValue}</span>
                        {' '}vs Threshold: <span className="font-medium">{alert.thresholdValue}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Instrument: {alert.instrumentId} | Opened: {new Date(alert.openedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
                    {alert.status === 'Open' && (
                      <Button variant="outline" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleAcknowledge(alert.id) }}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {(alert.status === 'Open' || alert.status === 'Acknowledged') && (
                      <Button variant="outline" size="icon-sm" onClick={(e) => { e.stopPropagation(); handleResolve(alert.id) }}>
                        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
