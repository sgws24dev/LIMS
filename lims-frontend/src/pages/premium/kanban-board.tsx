"use client"

import { useState, useMemo } from "react"
import {
  GripVertical, Plus, Filter, Clock, User, MoreHorizontal,
  AlertCircle, ArrowUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/components/shared/page-container"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface KanbanCard {
  id: string
  title: string
  status: string
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  time: string
  type: string
}

interface KanbanColumn {
  id: string
  title: string
  cards: KanbanCard[]
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "warning" | "info"> = {
  low: "secondary",
  medium: "default",
  high: "warning",
  critical: "destructive",
}

const workflowTypes = [
  { value: "sample", label: "Sample Workflow" },
  { value: "result", label: "Result Workflow" },
  { value: "review", label: "Review Workflow" },
]

const initialCards: KanbanCard[] = [
  { id: "1", title: "Fasting Blood Sugar - Patient #1024", status: "todo", priority: "high", assignee: "Rajesh", time: "30 min ago", type: "sample" },
  { id: "2", title: "Lipid Profile - Patient #1031", status: "todo", priority: "medium", assignee: "Priya", time: "1 hr ago", type: "sample" },
  { id: "3", title: "CBC - Patient #1045", status: "in_progress", priority: "high", assignee: "Amit", time: "2 hrs ago", type: "sample" },
  { id: "4", title: "TSH Results - Patient #1052", status: "in_progress", priority: "critical", assignee: "Dr. Sharma", time: "45 min ago", type: "result" },
  { id: "5", title: "Liver Function Test - Patient #1060", status: "review", priority: "medium", assignee: "Dr. Kapoor", time: "3 hrs ago", type: "review" },
  { id: "6", title: "Urine Culture - Patient #1071", status: "review", priority: "low", assignee: "Dr. Verma", time: "5 hrs ago", type: "review" },
  { id: "7", title: "HbA1c - Patient #1082", status: "done", priority: "medium", assignee: "Suresh", time: "1 day ago", type: "sample" },
  { id: "8", title: "Vitamin D - Patient #1093", status: "done", priority: "low", assignee: "Neha", time: "2 days ago", type: "sample" },
  { id: "9", title: "PT/INR - Patient #1100", status: "todo", priority: "critical", assignee: "Unassigned", time: "10 min ago", type: "sample" },
]

export default function KanbanBoard() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [workflowType, setWorkflowType] = useState("sample")
  const [search, setSearch] = useState("")
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: "todo", title: "To Do", cards: [] },
    { id: "in_progress", title: "In Progress", cards: [] },
    { id: "review", title: "Review", cards: [] },
    { id: "done", title: "Done", cards: [] },
  ])

  useState(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Premium" },
      { label: "Kanban Board" },
    ])
  })

  const filteredCards = useMemo(() => {
    let cards = initialCards.filter((c) => c.type === workflowType)
    if (search) {
      const q = search.toLowerCase()
      cards = cards.filter((c) => c.title.toLowerCase().includes(q) || c.assignee.toLowerCase().includes(q))
    }
    return cards
  }, [workflowType, search])

  const boardColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      cards: filteredCards.filter((c) => c.status === col.id),
    }))
  }, [columns, filteredCards])

  const [draggedCard, setDraggedCard] = useState<string | null>(null)

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId)
  }

  const handleDrop = (columnId: string) => {
    if (!draggedCard) return
    showToast({ type: "info", title: "Card moved", message: `Card moved to ${columnId}` })
    setDraggedCard(null)
  }

  return (
    <PageContainer
      title="Kanban Board"
      description="Visual workflow management for lab processes"
      status="success"
      actions={
        <div className="flex items-center gap-2">
          <Select value={workflowType} onValueChange={setWorkflowType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workflowTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Search cards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[200px]"
          />
          <Button size="sm" onClick={() => showToast({ type: "info", title: "Add Card", message: "New card creation dialog would open" })}>
            <Plus className="mr-1 h-4 w-4" />
            Add Card
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {boardColumns.map((col) => (
          <div
            key={col.id}
            className="space-y-3 rounded-xl border bg-muted/30 p-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.id)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                {col.cards.length}
              </span>
            </div>
            {col.cards.map((card) => (
              <div
                key={card.id}
                draggable
                onDragStart={() => handleDragStart(card.id)}
                className={cn(
                  "cursor-grab rounded-lg border bg-card p-3 shadow-card transition-all hover:shadow-card-hover active:cursor-grabbing",
                  draggedCard === card.id && "opacity-50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{card.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={priorityVariant[card.priority]}>
                        {card.priority === "critical" && <AlertCircle className="mr-0.5 h-3 w-3" />}
                        {card.priority}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {card.assignee}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {card.time}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon-sm" onClick={() => showToast({ type: "info", title: card.title, message: "Card actions menu would open" })}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {col.cards.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed text-xs text-muted-foreground">
                Drop cards here
              </div>
            )}
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
