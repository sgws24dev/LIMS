import { useState, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import {
  GripVertical, Plus, Eye, Save, Megaphone, BarChart3,
  Zap, Calendar, Activity, FileText, Bell, Trash2
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Switch } from '@/shared/ui/switch'
import { PageContainer } from '@/shared/shared/page-container'
import { useToast } from '@/shared/hooks/use-toast'
import { getActiveHomepage, saveHomepage } from '@/services/api/content'

type SectionType =
  | 'Announcements'
  | 'KpiCard'
  | 'QuickActions'
  | 'UpcomingBookings'
  | 'RecentActivity'
  | 'CustomMarkdown'
  | 'TrainingAlerts'

interface Section {
  id: string
  type: SectionType
  config: Record<string, string>
}

const SECTION_ICONS: Record<SectionType, React.ElementType> = {
  Announcements: Megaphone,
  KpiCard: BarChart3,
  QuickActions: Zap,
  UpcomingBookings: Calendar,
  RecentActivity: Activity,
  CustomMarkdown: FileText,
  TrainingAlerts: Bell,
}

const SECTION_PALETTE: { type: SectionType; label: string }[] = [
  { type: 'Announcements', label: 'Announcements Banner' },
  { type: 'KpiCard', label: 'KPI Cards' },
  { type: 'QuickActions', label: 'Quick Actions' },
  { type: 'UpcomingBookings', label: 'Upcoming Bookings' },
  { type: 'RecentActivity', label: 'Recent Activity' },
  { type: 'CustomMarkdown', label: 'Custom Markdown' },
  { type: 'TrainingAlerts', label: 'Training Alerts' },
]

function SectionCard({ section, index, onRemove, onConfigChange }: {
  section: Section
  index: number
  onRemove: (id: string) => void
  onConfigChange: (id: string, key: string, value: string) => void
}) {
  const Icon = SECTION_ICONS[section.type]

  return (
    <Draggable draggableId={section.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style as React.CSSProperties}
          className={snapshot.isDragging ? 'opacity-70' : ''}
        >
          <Card className="mb-3">
            <CardHeader className="flex flex-row items-center gap-2 py-3">
              <div {...provided.dragHandleProps} className="cursor-grab touch-none text-muted-foreground hover:text-foreground">
                <GripVertical className="h-4 w-4" />
              </div>
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium flex-1">
                {SECTION_PALETTE.find(p => p.type === section.type)?.label}
              </span>
              <Button variant="ghost" size="icon-sm" onClick={() => onRemove(section.id)}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </CardHeader>
            {section.type === 'KpiCard' && (
              <CardContent className="pb-3">
                <Label className="text-xs">Metric</Label>
                <Input
                  placeholder="e.g. Revenue, Utilization"
                  value={section.config.metric || ''}
                  onChange={(e) => onConfigChange(section.id, 'metric', e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              </CardContent>
            )}
            {section.type === 'CustomMarkdown' && (
              <CardContent className="pb-3">
                <Label className="text-xs">Markdown Content</Label>
                <Textarea
                  placeholder="Enter markdown..."
                  value={section.config.content || ''}
                  onChange={(e) => onConfigChange(section.id, 'content', e.target.value)}
                  className="mt-1 text-sm min-h-[100px]"
                />
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </Draggable>
  )
}

export default function HomepageBuilder() {
  const { toast } = useToast()
  const [sections, setSections] = useState<Section[]>([])
  const [homepageName, setHomepageName] = useState('Default Homepage')
  const [isActive, setIsActive] = useState(true)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    getActiveHomepage()
      .then((homepage) => {
        if (homepage && homepage.layoutJson !== '[]') {
          setSections(JSON.parse(homepage.layoutJson))
          setHomepageName(homepage.name)
          setIsActive(homepage.isActive)
        }
      })
      .catch(() => { /* ignore */ })
  }, [])

  const addSection = useCallback((type: SectionType) => {
    setSections((prev) => [...prev, {
      id: `${type}-${Date.now()}`,
      type,
      config: {}
    }])
  }, [])

  const removeSection = useCallback((id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const handleConfigChange = useCallback((id: string, key: string, value: string) => {
    setSections((prev) => prev.map((s) =>
      s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s
    ))
  }, [])

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setSections(items)
  }, [sections])

  const handleSave = async () => {
    try {
      await saveHomepage({
        name: homepageName,
        isActive,
        layoutJson: JSON.stringify(sections)
      })
      toast({ title: 'Homepage saved', description: 'Your layout has been updated.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to save homepage.', variant: 'destructive' })
    }
  }

  return (
    <PageContainer title="Homepage Builder" description="Drag and drop sections to build your facility homepage">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <Label className="text-xs">Homepage Name</Label>
          <Input
            value={homepageName}
            onChange={(e) => setHomepageName(e.target.value)}
            className="mt-1 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Active</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
          <Eye className="mr-1 h-4 w-4" />
          {preview ? 'Edit' : 'Preview'}
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>

      <div className="flex gap-6">
        {!preview && (
          <aside className="w-48 shrink-0">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Section Types</h4>
            <div className="space-y-1">
              {SECTION_PALETTE.map((item) => {
                const Icon = SECTION_ICONS[item.type]
                return (
                  <Button
                    key={item.type}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => addSection(item.type)}
                  >
                    <Icon className="mr-2 h-3.5 w-3.5" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </aside>
        )}

        <div className="flex-1">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed rounded-lg">
              <Plus className="mb-2 h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Add sections from the left palette to build your homepage</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="homepage-sections">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {sections.map((section, index) => (
                      <SectionCard
                        key={section.id}
                        section={section}
                        index={index}
                        onRemove={removeSection}
                        onConfigChange={handleConfigChange}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
