import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import {
  getDashboardById,
  updateDashboard,
  updateWidgetConfig,
  getWidgetData,
  createDashboard,
  type DashboardDefinitionDto,
  type WidgetDataDto,
  type WidgetType,
  type CreateDashboardWidgetDto,
} from '@/services/api/billing'
import DashboardGrid from '@/modules/billing/components/DashboardGrid'
import WidgetPicker from '@/modules/billing/components/WidgetPicker'
import WidgetConfigDialog from '@/modules/billing/components/WidgetConfigDialog'
import DashboardShareDialog from '@/modules/billing/components/DashboardShareDialog'
import { type Layout } from 'react-grid-layout'

export default function DashboardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardDefinitionDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [widgetData, setWidgetData] = useState<Record<string, WidgetDataDto>>({})
  const [isEditable, setIsEditable] = useState(true)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedWidgetType, setSelectedWidgetType] = useState<WidgetType | null>(null)

  const fetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const d = await getDashboardById(id)
      setDashboard(d)
      await loadWidgetData(d)
    } catch {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetch() }, [fetch])

  const loadWidgetData = async (d: DashboardDefinitionDto) => {
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    const to = now

    const dataMap: Record<string, WidgetDataDto> = {}
    for (const widget of d.widgets) {
      if (!widget.isVisible) continue
      try {
        dataMap[widget.id] = await getWidgetData(
          d.id,
          widget.id,
          from.toISOString().split('T')[0],
          to.toISOString().split('T')[0]
        )
      } catch {
        dataMap[widget.id] = { labels: [], datasets: [] }
      }
    }
    setWidgetData(dataMap)
  }

  const handleLayoutChange = async (layout: Layout) => {
    if (!dashboard) return

    for (const item of layout) {
      const widget = dashboard.widgets.find((w) => w.id === item.i)
      if (!widget) continue
      if (
        widget.positionX !== item.x ||
        widget.positionY !== item.y ||
        widget.width !== item.w ||
        widget.height !== item.h
      ) {
        try {
          await updateWidgetConfig(dashboard.id, item.i, {
            dashboardId: dashboard.id,
            widgetId: item.i,
            config: widget.config,
            positionX: item.x,
            positionY: item.y,
            width: item.w,
            height: item.h,
          })
          widget.positionX = item.x
          widget.positionY = item.y
          widget.width = item.w
          widget.height = item.h
        } catch {
          // silently fail
        }
      }
    }
  }

  const handleRemoveWidget = async (widgetId: string) => {
    if (!dashboard) return

    const updatedWidgets = dashboard.widgets
      .filter((w) => w.id !== widgetId)
      .map((w) => ({
        widgetType: w.widgetType as WidgetType,
        config: w.config,
        positionX: w.positionX,
        positionY: w.positionY,
        width: w.width,
        height: w.height,
      }))

    const newLayout = JSON.stringify({
      widgets: updatedWidgets.map((w, i) => ({
        widgetId: `temp-${i}`,
        x: w.positionX,
        y: w.positionY,
        w: w.width,
        h: w.height,
      })),
    })

    try {
      await updateDashboard(dashboard.id, {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        layout: newLayout,
        isDefault: dashboard.isDefault,
      })
      await fetch()
    } catch {
      setError('Failed to remove widget')
    }
  }

  const handleWidgetSelected = (widgetType: WidgetType) => {
    setSelectedWidgetType(widgetType)
    setPickerOpen(false)
    setConfigOpen(true)
  }

  const handleConfigSave = async (config: string) => {
    if (!dashboard || !selectedWidgetType) return

    const newWidget: CreateDashboardWidgetDto = {
      widgetType: selectedWidgetType,
      config,
      positionX: 0,
      positionY: dashboard.widgets.length,
      width: 4,
      height: 3,
    }

    const updatedWidgets = [
      ...dashboard.widgets.map((w) => ({
        widgetType: w.widgetType as WidgetType,
        config: w.config,
        positionX: w.positionX,
        positionY: w.positionY,
        width: w.width,
        height: w.height,
      })),
      newWidget,
    ]

    const newLayout = JSON.stringify({
      widgets: updatedWidgets.map((w, i) => ({
        widgetId: `temp-${i}`,
        x: w.positionX,
        y: w.positionY,
        w: w.width,
        h: w.height,
      })),
    })

    try {
      const result = await createDashboard({
        name: dashboard.name,
        description: dashboard.description,
        layout: newLayout,
        isDefault: dashboard.isDefault,
        widgets: updatedWidgets,
      })
      navigate(`/billing/analytics/${result.id}`, { replace: true })
    } catch {
      setError('Failed to add widget')
    }
  }

  const handleSaveLayout = async () => {
    if (!dashboard) return
    try {
      const layout = JSON.stringify({
        widgets: dashboard.widgets.filter((w) => w.isVisible).map((w) => ({
          widgetId: w.id,
          x: w.positionX,
          y: w.positionY,
          w: w.width,
          h: w.height,
        })),
      })
      await updateDashboard(dashboard.id, {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description,
        layout,
        isDefault: dashboard.isDefault,
      })
      await fetch()
    } catch {
      setError('Failed to save layout')
    }
  }

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => setIsEditable(!isEditable)}>
        {isEditable ? 'View Mode' : 'Edit Mode'}
      </Button>
      <Button variant="outline" size="sm" onClick={handleSaveLayout}>
        Save Layout
      </Button>
      <Button variant="outline" size="sm" onClick={() => setShareDialogOpen(true)}>
        Share
      </Button>
    </div>
  )

  return (
    <PageContainer
      title={dashboard?.name || 'Dashboard'}
      description={dashboard?.description}
      status={loading ? 'loading' : error ? 'error' : dashboard ? 'success' : 'empty'}
      errorMessage={error ?? undefined}
      onRetry={fetch}
      actions={actions}
    >
      {dashboard && (
        <>
          <DashboardGrid
            dashboard={dashboard}
            widgetData={widgetData}
            onLayoutChange={handleLayoutChange}
            onRemoveWidget={handleRemoveWidget}
            onOpenWidgetPicker={() => setPickerOpen(true)}
            isEditable={isEditable}
          />

          <WidgetPicker
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            onSelect={handleWidgetSelected}
          />

          <WidgetConfigDialog
            open={configOpen}
            onOpenChange={setConfigOpen}
            widgetType={selectedWidgetType}
            onSave={handleConfigSave}
          />

          <DashboardShareDialog
            dashboardId={dashboard.id}
            dashboardName={dashboard.name}
            currentSharedWith={dashboard.sharedWith ?? null}
            open={shareDialogOpen}
            onOpenChange={setShareDialogOpen}
          />
        </>
      )}
    </PageContainer>
  )
}
