"use client"

import { useState, useRef, useCallback } from "react"
import { PanelLeftClose, PanelLeft, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/components/shared/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ListItem {
  id: string
  title: string
  subtitle: string
  status: string
  date: string
}

const sampleList: ListItem[] = [
  { id: "SMP-001", title: "Fasting Blood Sugar", subtitle: "Patient #1024 - Rajesh Kumar", status: "pending", date: "12 Jun 2026" },
  { id: "SMP-002", title: "Lipid Profile", subtitle: "Patient #1031 - Priya Singh", status: "processing", date: "12 Jun 2026" },
  { id: "SMP-003", title: "Complete Blood Count", subtitle: "Patient #1045 - Amit Shah", status: "completed", date: "11 Jun 2026" },
  { id: "SMP-004", title: "TSH", subtitle: "Patient #1052 - Neha Gupta", status: "pending", date: "11 Jun 2026" },
  { id: "SMP-005", title: "Liver Function Test", subtitle: "Patient #1060 - Vikram Patel", status: "processing", date: "10 Jun 2026" },
  { id: "SMP-006", title: "Urine Culture", subtitle: "Patient #1071 - Deepa Iyengar", status: "completed", date: "10 Jun 2026" },
  { id: "SMP-007", title: "HbA1c", subtitle: "Patient #1082 - Suresh Rao", status: "pending", date: "09 Jun 2026" },
  { id: "SMP-008", title: "Vitamin D", subtitle: "Patient #1093 - Ananya Gupta", status: "completed", date: "09 Jun 2026" },
]

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning"> = {
  pending: "default",
  processing: "warning",
  completed: "success",
}

export default function SplitView() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [selectedItem, setSelectedItem] = useState<ListItem | null>(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [leftWidth, setLeftWidth] = useState(360)
  const [search, setSearch] = useState("")
  const dividerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useState(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Premium" },
      { label: "Split View" },
    ])
  })

  const filteredList = sampleList.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return
    const newWidth = Math.max(200, Math.min(600, e.clientX))
    setLeftWidth(newWidth)
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }, [handleMouseMove])

  return (
    <PageContainer
      title="Split View"
      description="Side-by-side comparison for samples and results"
      status="success"
    >
      <div className="flex h-[600px] overflow-hidden rounded-xl border bg-card">
        <div
          className={cn(
            "flex flex-col border-r bg-muted/20 transition-all duration-200",
            leftCollapsed ? "w-0 overflow-hidden border-r-0" : ""
          )}
          style={{ width: leftCollapsed ? 0 : leftWidth, minWidth: leftCollapsed ? 0 : undefined }}
        >
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-medium">Queue</span>
            <Button variant="ghost" size="icon-sm" onClick={() => setLeftCollapsed(true)}>
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
          <div className="border-b p-3">
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "cursor-pointer border-b p-3 transition-colors hover:bg-muted/50",
                  selectedItem?.id === item.id && "bg-primary/5"
                )}
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.title}</span>
                  <Badge variant={statusVariant[item.status] ?? "default"} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.subtitle}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground/60">{item.date}</p>
              </div>
            ))}
          </div>
        </div>

        {leftCollapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute z-10 m-2"
            onClick={() => setLeftCollapsed(false)}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        )}

        <div
          ref={dividerRef}
          className={cn(
            "w-1.5 cursor-col-resize bg-transparent transition-colors hover:bg-primary/20 active:bg-primary/30 shrink-0",
            leftCollapsed && "hidden"
          )}
          onMouseDown={handleMouseDown}
        />

        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b p-3">
            <span className="text-sm font-medium">Details</span>
            {selectedItem && (
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedItem(null)}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedItem.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedItem.subtitle}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="text-sm font-medium">{selectedItem.id}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={statusVariant[selectedItem.status] ?? "default"}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-medium">{selectedItem.date}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className="text-sm font-medium">Normal</p>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-medium">Test Parameters</h3>
                  <p className="text-sm text-muted-foreground">Detailed parameter information will appear here.</p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 text-sm font-medium">Patient History</h3>
                  <p className="text-sm text-muted-foreground">Previous test results and patient history will be displayed here.</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an item from the left panel to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
