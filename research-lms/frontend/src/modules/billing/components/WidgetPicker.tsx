import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import {
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Table2,
  Gauge,
  Microscope,
} from 'lucide-react'
import type { WidgetType } from '@/services/api/billing'

const WIDGET_TYPES: { type: WidgetType; label: string; description: string; icon: React.ElementType }[] = [
  { type: 'Kpi', label: 'KPI', description: 'Single metric with trend indicator', icon: Gauge },
  { type: 'LineChart', label: 'Line Chart', description: 'Time-series data visualization', icon: LineChart },
  { type: 'BarChart', label: 'Bar Chart', description: 'Categorical comparison', icon: BarChart3 },
  { type: 'PieChart', label: 'Pie Chart', description: 'Proportion breakdown', icon: PieChart },
  { type: 'AreaChart', label: 'Area Chart', description: 'Cumulative time-series', icon: Activity },
  { type: 'Table', label: 'Table', description: 'Sortable, filterable data table', icon: Table2 },
  { type: 'Instrument365', label: 'Instrument 365', description: 'Full-year instrument heatmap', icon: Microscope },
]

interface WidgetPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (widgetType: WidgetType) => void
}

export default function WidgetPicker({ open, onOpenChange, onSelect }: WidgetPickerProps) {
  const [selected, setSelected] = useState<WidgetType | null>(null)

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected)
      setSelected(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Widget</DialogTitle>
          <DialogDescription>
            Choose a widget type to add to your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {WIDGET_TYPES.map((wt) => {
            const Icon = wt.icon
            return (
              <Card
                key={wt.type}
                className={`cursor-pointer transition-all hover:border-primary ${
                  selected === wt.type ? 'border-primary ring-1 ring-primary' : ''
                }`}
                onClick={() => setSelected(wt.type)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <Icon className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{wt.label}</div>
                    <div className="text-xs text-muted-foreground">{wt.description}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selected}>
            Add Widget
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
