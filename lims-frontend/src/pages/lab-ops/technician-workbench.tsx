"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Sample } from "@/types"
import { getSamplesExtended, updateSampleStatus, getWorkloadMetrics } from "@/mock/services"
import { formatDate, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  FlaskConical,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  Search,
  Play,
  CheckCircle,
  RefreshCw,
  Users,
} from "lucide-react"

const DEPARTMENTS = [
  "All",
  "Biochemistry",
  "Hematology",
  "Microbiology",
  "Immunology",
  "Molecular Biology",
  "Histopathology",
  "Clinical Pathology",
]

type TabValue = "today" | "pending" | "critical" | "retest"

export default function TechnicianWorkbenchPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [samples, setSamples] = useState<Sample[]>([])
  const [activeTab, setActiveTab] = useState<TabValue>("today")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Lab Ops", href: "/lab-ops" },
      { label: "Technician Workbench" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getSamplesExtended({})
      setSamples(result.data)
    } catch {
      setError("Failed to load workbench data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const todayStr = new Date().toISOString().split("T")[0]

  const todaySamples = useMemo(
    () => samples.filter((s) => s.collectedAt?.startsWith(todayStr)),
    [samples, todayStr]
  )

  const pendingSamples = useMemo(
    () => samples.filter((s) => s.status === "received" || s.status === "processing" || s.status === "testing"),
    [samples]
  )

  const criticalSamples = useMemo(
    () => samples.filter((s) => s.priority === "urgent" || s.priority === "stat"),
    [samples]
  )

  const retestSamples = useMemo(
    () => samples.filter((s) => s.status === "re_testing"),
    [samples]
  )

  const stats = useMemo(() => {
    const myQueue = samples.filter((s) => s.status === "received" || s.status === "processing" || s.status === "testing").length
    const completedToday = samples.filter((s) => s.status === "approved" && s.approvedAt?.startsWith(todayStr)).length
    const pending = pendingSamples.length
    const critical = criticalSamples.length
    return { myQueue, completedToday, pending, critical }
  }, [samples, todayStr, pendingSamples, criticalSamples])

  const filterByDepartment = useCallback(
    (list: Sample[]) =>
      departmentFilter === "All"
        ? list
        : list.filter((s) => s.department === departmentFilter),
    [departmentFilter]
  )

  const filterBySearch = useCallback(
    (list: Sample[]) => {
      if (!search) return list
      const q = search.toLowerCase()
      return list.filter(
        (s) =>
          s.patientName.toLowerCase().includes(q) ||
          s.barcode.toLowerCase().includes(q) ||
          s.testName.toLowerCase().includes(q)
      )
    },
    [search]
  )

  const currentList = useMemo(() => {
    let base: Sample[] = []
    if (activeTab === "today") base = todaySamples
    else if (activeTab === "pending") base = pendingSamples
    else if (activeTab === "critical") base = criticalSamples
    else if (activeTab === "retest") base = retestSamples
    return filterBySearch(filterByDepartment(base))
  }, [activeTab, todaySamples, pendingSamples, criticalSamples, retestSamples, filterBySearch, filterByDepartment])

  const handleStartProcessing = async (sample: Sample) => {
    setProcessingId(sample.id)
    try {
      await updateSampleStatus(sample.id, "processing", {
        processedBy: "Current User",
        processedAt: new Date().toISOString(),
      })
      showToast({ type: "success", title: "Processing started", message: `Sample ${sample.barcode} is now being processed.` })
      loadData()
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not update sample status." })
    } finally {
      setProcessingId(null)
    }
  }

  const handleComplete = async (sample: Sample) => {
    setProcessingId(sample.id)
    try {
      await updateSampleStatus(sample.id, "testing", {
        testedBy: "Current User",
        testedAt: new Date().toISOString(),
      })
      showToast({ type: "success", title: "Completed", message: `Testing started for ${sample.barcode}.` })
      loadData()
    } catch {
      showToast({ type: "error", title: "Failed", message: "Could not complete sample." })
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Technician Workbench" description="Manage your daily lab workflow" />
        <LoadingState count={4} type="card" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <PageHeader title="Technician Workbench" />
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Technician Workbench"
        description="Manage your daily lab workflow"
        actions={
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="My Queue" value={stats.myQueue} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed Today" value={stats.completedToday} trend={stats.completedToday > 0 ? { value: Math.round((stats.completedToday / (stats.myQueue || 1)) * 100), positive: true } : undefined} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={stats.pending} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Critical" value={stats.critical} trend={stats.critical > 0 ? { value: stats.critical, positive: false } : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patient/barcode..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
        </div>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="today" className="relative">
            Today's Samples
            {todaySamples.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{todaySamples.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingSamples.length > 0 && (
              <Badge variant="warning" className="ml-1.5 text-[10px] px-1.5 py-0">{pendingSamples.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="critical" className="relative">
            Critical
            {criticalSamples.length > 0 && (
              <Badge variant="destructive" className="ml-1.5 text-[10px] px-1.5 py-0">{criticalSamples.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="retest">
            Retest Queue
            {retestSamples.length > 0 && (
              <Badge variant="warning" className="ml-1.5 text-[10px] px-1.5 py-0">{retestSamples.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {currentList.length === 0 ? (
            <EmptyState
              icon={<FlaskConical className="h-8 w-8" />}
              title="No samples found"
              description={`No ${activeTab === "today" ? "today's" : activeTab === "pending" ? "pending" : activeTab === "critical" ? "critical" : "retest"} samples match your filters.`}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {currentList.map((sample) => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  onStartProcessing={sample.status === "received" ? () => handleStartProcessing(sample) : undefined}
                  onComplete={sample.status === "processing" ? () => handleComplete(sample) : undefined}
                  isProcessing={processingId === sample.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SampleCard({
  sample,
  onStartProcessing,
  onComplete,
  isProcessing,
}: {
  sample: Sample
  onStartProcessing?: () => void
  onComplete?: () => void
  isProcessing?: boolean
}) {
  const initials = sample.patientName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  const priorityColor =
    sample.priority === "stat"
      ? "bg-destructive/10 text-destructive border-destructive/20"
      : sample.priority === "urgent"
        ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300"
        : sample.priority === "today"
          ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300"
          : "bg-muted text-muted-foreground border-border/50"

  return (
    <Card className={cn("border-l-4 overflow-hidden", sample.priority === "stat" ? "border-l-destructive" : sample.priority === "urgent" ? "border-l-orange-400" : "border-l-primary/20")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold", priorityColor.split(" ")[0])}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate">{sample.patientName}</span>
              <StatusBadge status={sample.status} />
              <span className={cn("inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize", priorityColor)}>
                {sample.priority}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {sample.testName} <span className="mx-1">·</span>
              <span className="font-mono">{sample.barcode}</span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground/60">
              <User className="h-3 w-3" />
              <span>{sample.department}</span>
              <span className="mx-1">·</span>
              <span>{sample.type}</span>
            </div>
            {sample.collectedAt && (
              <div className="mt-1 text-[11px] text-muted-foreground/60">
                Collected: {formatDate(sample.collectedAt, "datetime")}
              </div>
            )}
          </div>
        </div>
        {(onStartProcessing || onComplete) && (
          <div className="mt-3 flex items-center gap-2 border-t pt-3">
            {onStartProcessing && (
              <Button size="sm" className="h-7 text-xs" onClick={onStartProcessing} disabled={isProcessing}>
                <Play className="mr-1 h-3 w-3" /> {isProcessing ? "Starting..." : "Start Processing"}
              </Button>
            )}
            {onComplete && (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onComplete} disabled={isProcessing}>
                <CheckCircle className="mr-1 h-3 w-3" /> {isProcessing ? "Processing..." : "Mark Complete"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
