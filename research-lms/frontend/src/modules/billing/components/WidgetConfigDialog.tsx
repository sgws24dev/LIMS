import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { WidgetType } from '@/services/api/billing'

interface WidgetConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widgetType: WidgetType | null
  onSave: (config: string) => void
}

const KPI_METRICS = [
  { value: 'totalRevenue', label: 'Total Revenue' },
  { value: 'outstandingReceivables', label: 'Outstanding Receivables' },
  { value: 'overdueAmount', label: 'Overdue Amount' },
  { value: 'avgDaysToPay', label: 'Avg Days to Pay' },
  { value: 'utilizationRate', label: 'Utilization Rate' },
  { value: 'activeBookings', label: 'Active Bookings' },
]

const CHART_METRICS = [
  { value: 'revenueByMonth', label: 'Revenue by Month' },
  { value: 'revenueByCategory', label: 'Revenue by Category' },
  { value: 'bookingsByInstrument', label: 'Bookings by Instrument' },
  { value: 'utilizationByFacility', label: 'Utilization by Facility' },
  { value: 'overdueByAging', label: 'Overdue by Aging' },
]

const AGGREGATIONS = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'count', label: 'Count' },
]

const GRANULARITIES = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'quarter', label: 'Quarterly' },
]

export default function WidgetConfigDialog({
  open,
  onOpenChange,
  widgetType,
  onSave,
}: WidgetConfigDialogProps) {
  const [configStr, setConfigStr] = useState('')

  useEffect(() => {
    if (open) {
      setConfigStr(JSON.stringify(getDefaultConfig(widgetType), null, 2))
    }
  }, [open, widgetType])

  const handleSave = () => {
    onSave(configStr)
    onOpenChange(false)
  }

  if (!widgetType) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {widgetType} Widget</DialogTitle>
          <DialogDescription>
            Set the data source and display options
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {widgetType === 'Kpi' && (
            <>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select
                  value={JSON.parse(configStr).metric || ''}
                  onValueChange={(v) => {
                    const cfg = JSON.parse(configStr)
                    cfg.metric = v
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {KPI_METRICS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select
                  value={JSON.parse(configStr).format || 'number'}
                  onValueChange={(v) => {
                    const cfg = JSON.parse(configStr)
                    cfg.format = v
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {(widgetType === 'LineChart' || widgetType === 'BarChart' || widgetType === 'PieChart' || widgetType === 'AreaChart') && (
            <>
              <div className="space-y-2">
                <Label>Metric</Label>
                <Select
                  value={JSON.parse(configStr).metric || ''}
                  onValueChange={(v) => {
                    const cfg = JSON.parse(configStr)
                    cfg.metric = v
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_METRICS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Aggregation</Label>
                <Select
                  value={JSON.parse(configStr).aggregation || 'sum'}
                  onValueChange={(v) => {
                    const cfg = JSON.parse(configStr)
                    cfg.aggregation = v
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGGREGATIONS.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Granularity</Label>
                <Select
                  value={JSON.parse(configStr).granularity || 'month'}
                  onValueChange={(v) => {
                    const cfg = JSON.parse(configStr)
                    cfg.granularity = v
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRANULARITIES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={JSON.parse(configStr).color || '#3b82f6'}
                  onChange={(e) => {
                    const cfg = JSON.parse(configStr)
                    cfg.color = e.target.value
                    setConfigStr(JSON.stringify(cfg, null, 2))
                  }}
                />
              </div>
            </>
          )}
          {widgetType === 'Table' && (
            <div className="space-y-2">
              <Label>Columns (comma-separated field names)</Label>
              <Input
                placeholder="invoiceNumber, totalAmount, status"
                defaultValue={(JSON.parse(configStr).columns || []).join(', ')}
                onChange={(e) => {
                  const cfg = JSON.parse(configStr)
                  cfg.columns = e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
                  setConfigStr(JSON.stringify(cfg, null, 2))
                }}
              />
            </div>
          )}
          {widgetType === 'Instrument365' && (
            <div className="text-sm text-muted-foreground">
              Instrument 365 view shows a full-year heatmap of instrument metrics.
              Select an instrument from the dashboard to configure.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getDefaultConfig(widgetType: WidgetType | null): Record<string, unknown> {
  switch (widgetType) {
    case 'Kpi':
      return { metric: 'totalRevenue', format: 'currency', showComparison: true }
    case 'LineChart':
    case 'BarChart':
    case 'PieChart':
    case 'AreaChart':
      return { metric: 'revenueByMonth', aggregation: 'sum', granularity: 'month', color: '#3b82f6' }
    case 'Table':
      return { columns: ['invoiceNumber', 'totalAmount', 'status'] }
    case 'Instrument365':
      return {}
    default:
      return {}
  }
}
