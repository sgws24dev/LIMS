import { useCallback, useMemo } from 'react'
import GridLayout, { type Layout } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { X, Move } from 'lucide-react'
import type { DashboardDefinitionDto, DashboardWidgetDto, WidgetDataDto } from '@/services/api/billing'
import KpiWidget from '@/modules/billing/components/widgets/KpiWidget'
import ChartWidget from '@/modules/billing/components/widgets/ChartWidget'
import TableWidget from '@/modules/billing/components/widgets/TableWidget'

interface DashboardGridProps {
  dashboard: DashboardDefinitionDto
  widgetData: Record<string, WidgetDataDto>
  onLayoutChange: (layout: Layout) => void
  onRemoveWidget: (widgetId: string) => void
  onOpenWidgetPicker: () => void
  isEditable?: boolean
}

export default function DashboardGrid({
  dashboard,
  widgetData,
  onLayoutChange,
  onRemoveWidget,
  onOpenWidgetPicker,
  isEditable = true,
}: DashboardGridProps) {
  const layout = useMemo(() => {
    return dashboard.widgets
      .filter((w) => w.isVisible)
      .map((w) => ({
        i: w.id,
        x: w.positionX,
        y: w.positionY,
        w: w.width,
        h: w.height,
        minW: 2,
        minH: 2,
      }))
  }, [dashboard.widgets])

  const renderWidget = useCallback(
    (widget: DashboardWidgetDto) => {
      const data = widgetData[widget.id]
      const parsedConfig = widget.config ? JSON.parse(widget.config) : {}

      return (
        <Card key={widget.id} className="h-full overflow-hidden group flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0 shrink-0">
            <CardTitle className="text-sm font-medium">{widget.widgetType === 'Kpi' ? 'KPI' : widget.widgetType.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            {isEditable && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon-sm" className="cursor-move" title="Drag to move">
                  <Move className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveWidget(widget.id)}
                  title="Remove widget"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            {data ? (
              renderWidgetContent(widget, data, parsedConfig)
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Loading data...
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    [widgetData, isEditable, onRemoveWidget]
  )

  if (dashboard.widgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg p-8">
        <p className="text-muted-foreground mb-4">This dashboard is empty</p>
        {isEditable && (
          <Button onClick={onOpenWidgetPicker} variant="outline">
            Add Widget
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <GridLayout
        className="layout"
        layout={layout}
        width={1200}
        gridConfig={{ cols: 12, rowHeight: 100, margin: [10, 10] as const, containerPadding: null, maxRows: Infinity }}
        dragConfig={{ enabled: isEditable }}
        resizeConfig={{ enabled: isEditable }}
        onLayoutChange={onLayoutChange}
      >
        {dashboard.widgets
          .filter((w) => w.isVisible)
          .map((widget) => (
            <div key={widget.id}>{renderWidget(widget)}</div>
          ))}
      </GridLayout>
      {isEditable && (
        <div className="mt-4 flex justify-center">
          <Button onClick={onOpenWidgetPicker} variant="outline" size="sm">
            + Add Widget
          </Button>
        </div>
      )}
    </div>
  )
}

function renderWidgetContent(
  widget: DashboardWidgetDto,
  data: WidgetDataDto,
  config: Record<string, unknown>
) {
  config._widgetId = widget.id

  switch (widget.widgetType) {
    case 'Kpi':
      return <KpiWidget data={data} config={config} />
    case 'LineChart':
    case 'BarChart':
    case 'PieChart':
    case 'AreaChart':
      config.widgetType = widget.widgetType
      return <ChartWidget data={data} config={config} />
    case 'Table':
      return <TableWidget data={data} config={config} />
    default:
      return (
        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
          Unknown widget type: {widget.widgetType}
        </div>
      )
  }
}
