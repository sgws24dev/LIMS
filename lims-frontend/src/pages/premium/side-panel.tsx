"use client"

import { useState, useEffect } from "react"
import { X, Info, History, Link2, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/components/shared/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"

interface SidePanelItem {
  id: string
  title: string
  subtitle: string
  status: string
  type: string
}

const items: SidePanelItem[] = [
  { id: "SMP-0421", title: "Fasting Blood Sugar", subtitle: "Rajesh Kumar", status: "processing", type: "sample" },
  { id: "SMP-0422", title: "Lipid Profile", subtitle: "Priya Singh", status: "pending", type: "sample" },
  { id: "SMP-0423", title: "Complete Blood Count", subtitle: "Amit Shah", status: "completed", type: "sample" },
  { id: "RES-0101", title: "TSH Result", subtitle: "Neha Gupta", status: "verified", type: "result" },
  { id: "RES-0102", title: "Liver Function Test", subtitle: "Vikram Patel", status: "draft", type: "result" },
]

interface HistoryItem {
  event: string
  timestamp: string
  user: string
}

const historyData: HistoryItem[] = [
  { event: "Sample collected", timestamp: "12 Jun 2026, 09:30 AM", user: "Priya Phlebotomist" },
  { event: "Sample received at lab", timestamp: "12 Jun 2026, 10:15 AM", user: "Rajesh Lab Tech" },
  { event: "Processing started", timestamp: "12 Jun 2026, 10:30 AM", user: "Amit Biochemist" },
  { event: "Result entered", timestamp: "12 Jun 2026, 11:45 AM", user: "Dr. Kapoor" },
]

const relatedColumns: ColumnDef<{ id: string; name: string; relation: string }>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "relation", header: "Relation", accessorKey: "relation" },
]

export default function SidePanelPage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [selectedItem, setSelectedItem] = useState<SidePanelItem | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("details")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Premium" },
      { label: "Side Panel" },
    ])
  }, [setBreadcrumbs])

  const openPanel = (item: SidePanelItem) => {
    setSelectedItem(item)
    setPanelOpen(true)
    setActiveTab("details")
  }

  const closePanel = () => {
    setPanelOpen(false)
    setTimeout(() => setSelectedItem(null), 300)
  }

  return (
    <PageContainer
      title="Side Panel"
      description="Context-aware slide-in panel for viewing item details"
      status="success"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer transition-all hover:shadow-card-hover"
            onClick={() => openPanel(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <Badge variant="secondary" className="text-[10px]">{item.id}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant={
                    item.status === "completed" || item.status === "verified" ? "success" :
                    item.status === "processing" ? "warning" : "default"
                  }
                >
                  {item.status}
                </Badge>
                <span className="text-xs capitalize text-muted-foreground">{item.type}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg transform transition-transform duration-300",
          panelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex-1 bg-background/60 backdrop-blur-sm" onClick={closePanel} />
        <div className="w-full max-w-lg border-l bg-card shadow-dialog">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h2 className="text-base font-semibold">{selectedItem?.title ?? "Details"}</h2>
              <p className="text-xs text-muted-foreground">{selectedItem?.id}</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={closePanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedItem && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-col">
              <div className="border-b px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="details" className="text-xs">
                    <Info className="mr-1.5 h-3.5 w-3.5" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-xs">
                    <History className="mr-1.5 h-3.5 w-3.5" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="related" className="text-xs">
                    <Link2 className="mr-1.5 h-3.5 w-3.5" />
                    Related
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="text-xs">
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Notes
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <TabsContent value="details" className="mt-0 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="text-sm font-medium">{selectedItem.id}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="default">{selectedItem.status}</Badge>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium capitalize">{selectedItem.type}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Patient</p>
                      <p className="text-sm font-medium">{selectedItem.subtitle}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-2 text-sm font-medium">Test Information</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed information about the selected item appears here, including test parameters,
                      reference ranges, and collection details.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-3">
                  {historyData.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
                        {i < historyData.length - 1 && <div className="h-full w-px bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">{h.event}</p>
                        <p className="text-xs text-muted-foreground">{h.timestamp}</p>
                        <p className="text-xs text-muted-foreground">by {h.user}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="related" className="mt-0">
                  <DataTable
                    columns={relatedColumns}
                    data={[
                      { id: "1", name: "Booking #BKG-0421", relation: "Parent Booking" },
                      { id: "2", name: "Patient #1024", relation: "Patient Record" },
                      { id: "3", name: "Result #RES-0101", relation: "Test Result" },
                    ]}
                    pageSize={5}
                    emptyMessage="No related items"
                    exportable
                  />
                </TabsContent>

                <TabsContent value="notes" className="mt-0">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      No notes available for this item. Notes can be added by authorized personnel.
                    </p>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
