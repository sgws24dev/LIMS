import { useState, useEffect } from 'react'
import { Activity, AlertTriangle, Thermometer, Gauge, Power, PowerOff, Loader2, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { getAlerts, getAlertRules, type IoTAlertDto, type AlertRuleDto } from '@/services/api/ai'

interface InstrumentStatus {
  id: string
  name: string
  status: 'online' | 'offline' | 'warning' | 'critical'
  temperature: number
  pressure: number
  rpm: number
  power: number
}

const mockInstruments: InstrumentStatus[] = [
  { id: 'inst-1', name: 'Mass Spectrometer Q-TOF', status: 'online', temperature: 24.5, pressure: 1.2, rpm: 0, power: 450 },
  { id: 'inst-2', name: 'HPLC System', status: 'online', temperature: 28.1, pressure: 85.3, rpm: 0, power: 320 },
  { id: 'inst-3', name: 'Centrifuge X-22', status: 'warning', temperature: 32.7, pressure: 0, rpm: 3500, power: 780 },
  { id: 'inst-4', name: 'Autoclave ST-200', status: 'offline', temperature: 22.0, pressure: 0, rpm: 0, power: 0 },
  { id: 'inst-5', name: 'PCR Thermocycler', status: 'critical', temperature: 95.3, pressure: 0, rpm: 0, power: 210 },
]

const statusColors: Record<string, string> = {
  online: 'text-green-500 bg-green-500/10',
  offline: 'text-gray-500 bg-gray-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  critical: 'text-red-500 bg-red-500/10',
}

const statusIcons: Record<string, React.ElementType> = {
  online: Power,
  offline: PowerOff,
  warning: AlertTriangle,
  critical: AlertTriangle,
}

function TelemetryGauge({ label, value, unit, min, max, color }: {
  label: string; value: number; unit: string; min: number; max: number; color: string
}) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-end gap-2">
        <span className={`text-xl font-bold ${color}`}>{value.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground mb-1">{unit}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function IoTDashboard() {
  const [instruments] = useState<InstrumentStatus[]>(mockInstruments)
  const [alerts, setAlerts] = useState<IoTAlertDto[]>([])
  const [alertRules, setAlertRules] = useState<AlertRuleDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInst, setSelectedInst] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [alertData, rulesData] = await Promise.all([
        getAlerts(undefined, 'Open'),
        getAlertRules(),
      ])
      setAlerts(alertData)
      setAlertRules(rulesData)
    } catch {
      // use mock data
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title="IoT Dashboard" description="Real-time instrument telemetry and monitoring">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {alerts.filter(a => a.severity === 'Critical').length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {alerts.filter(a => a.severity === 'Critical').length} Critical Alerts
              </Badge>
            )}
            {alerts.filter(a => a.severity === 'Warning').length > 0 && (
              <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">
                {alerts.filter(a => a.severity === 'Warning').length} Warnings
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instruments.map(inst => {
            const Icon = statusIcons[inst.status]
            const color = statusColors[inst.status]
            return (
              <Card
                key={inst.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedInst === inst.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedInst(selectedInst === inst.id ? null : inst.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {inst.id}</p>
                  </div>
                  <Badge className={color}>
                    {Icon && <Icon className="h-3 w-3 mr-1" />}
                    {inst.status.charAt(0).toUpperCase() + inst.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <TelemetryGauge label="Temperature" value={inst.temperature} unit="°C" min={0} max={100} color="text-red-500" />
                  <TelemetryGauge label="Pressure" value={inst.pressure} unit="bar" min={0} max={150} color="text-blue-500" />
                  <TelemetryGauge label="RPM" value={inst.rpm} unit="rpm" min={0} max={10000} color="text-green-500" />
                  <TelemetryGauge label="Power" value={inst.power} unit="W" min={0} max={1000} color="text-purple-500" />
                </div>
              </Card>
            )
          })}
        </div>

        {selectedInst && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Alerts for {instruments.find(i => i.id === selectedInst)?.name}
            </h3>
            {alerts.filter(a => a.instrumentId === selectedInst).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No active alerts.</p>
            ) : (
              <div className="space-y-2">
                {alerts.filter(a => a.instrumentId === selectedInst).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-destructive/5 rounded-md text-sm">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${alert.severity === 'Critical' ? 'text-destructive' : 'text-amber-500'}`} />
                      <span>{alert.metricName}</span>
                      <span className="text-muted-foreground">{alert.actualValue} (threshold: {alert.thresholdValue})</span>
                    </div>
                    <Badge variant={alert.severity === 'Critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {!selectedInst && !loading && (
          <Card className="p-6 text-center">
            <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Click an instrument card to view its active alerts and detailed telemetry.</p>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
