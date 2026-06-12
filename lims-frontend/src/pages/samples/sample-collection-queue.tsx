"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Sample } from "@/types"
import { getSamplesExtended, updateSampleStatus } from "@/mock/services"
import { formatDate } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Syringe,
  Search,
  Barcode,
  Clock,
  Droplets,
  AlertTriangle,
} from "lucide-react"

export default function SampleCollectionQueuePage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [collectDialog, setCollectDialog] = useState<Sample | null>(null)
  const [collectorName, setCollectorName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Collection Queue" },
    ])
  }, [setBreadcrumbs])

  const loadSamples = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSamplesExtended({ status: "registered" })
      setSamples(result.data)
    } catch {
      setError("Failed to load collection queue.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  const sortedByPriority = useMemo(() => {
    const priorityOrder: Record<string, number> = { stat: 0, urgent: 1, today: 2, routine: 3 }
    let data = [...samples]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.barcode.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q)
      )
    }
    if (priorityFilter !== "all") data = data.filter((s) => s.priority === priorityFilter)
    data.sort((a, b) => (priorityOrder[a.priority!] ?? 3) - (priorityOrder[b.priority!] ?? 3))
    return data
  }, [samples, search, priorityFilter])

  const stats = useMemo(() => {
    const total = samples.length
    const stat = samples.filter((s) => s.priority === "stat").length
    const urgent = samples.filter((s) => s.priority === "urgent").length
    return { total, stat, urgent }
  }, [samples])

  const handleCollect = async () => {
    if (!collectDialog || !collectorName) return
    setSaving(true)
    try {
      await updateSampleStatus(collectDialog.id, "collected", {
        collectedBy: collectorName,
        collectedAt: new Date().toISOString(),
      })
      showToast({
        type: "success",
        title: "Sample Collected",
        message: `Sample ${collectDialog.barcode} has been collected by ${collectorName}.`,
      })
      setCollectDialog(null)
      setCollectorName("")
      loadSamples()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to mark sample as collected." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="card" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadSamples} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Collection Queue"
        description="Phlebotomist view - samples ready for collection"
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<Syringe className="h-5 w-5" />} label="Pending Collection" value={stats.total} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="STAT" value={stats.stat} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Urgent" value={stats.urgent} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Registered Samples Awaiting Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient/barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sortedByPriority.length === 0 ? (
            <EmptyState
              icon={<Syringe className="h-6 w-6" />}
              title="No samples awaiting collection"
              description="All registered samples have been collected."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {sortedByPriority.map((sample) => (
                <Card key={sample.id} className="border-l-4 border-l-amber-400">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{sample.patientName}</span>
                          <StatusBadge status={sample.priority!} />
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground font-mono">
                          <Barcode className="h-3 w-3" />
                          {sample.barcode}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {sample.testName} | {sample.type}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3" />
                          {sample.container} - {sample.volume}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          Created: {formatDate(sample.createdAt!, "datetime")}
                        </div>
                      </div>
                      <StatusBadge status={sample.status} />
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => {
                        setCollectDialog(sample)
                        setCollectorName("")
                      }}
                    >
                      <Syringe className="mr-1.5 h-3.5 w-3.5" /> Mark Collected
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!collectDialog} onOpenChange={(o) => !o && setCollectDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Collection</DialogTitle>
            <DialogDescription>Enter the collector's name to confirm sample collection.</DialogDescription>
          </DialogHeader>
          {collectDialog && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barcode:</span>
                  <span className="font-mono font-medium">{collectDialog.barcode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium">{collectDialog.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Test:</span>
                  <span>{collectDialog.testName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <StatusBadge status={collectDialog.priority!} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Collected By</label>
                <Input
                  value={collectorName}
                  onChange={(e) => setCollectorName(e.target.value)}
                  placeholder="Enter collector name..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectDialog(null)}>Cancel</Button>
            <Button onClick={handleCollect} disabled={saving || !collectorName}>
              {saving ? "Saving..." : "Confirm Collection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
