"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Sample } from "@/types"
import { getSamplesExtended } from "@/mock/services"
import { formatDate, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/shared/status-badge"
import { PageContainer } from "@/components/shared/page-container"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Package,
  Syringe,
  FlaskConical,
  XCircle,
  Plus,
  Search,
  Barcode,
  Calendar,
} from "lucide-react"

export default function SampleTrackingDashboardPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [pageStatus, setPageStatus] = useState<"loading" | "error" | "success" | "empty">("loading")
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Tracking" },
    ])
  }, [setBreadcrumbs])

  const loadSamples = useCallback(async () => {
    setPageStatus("loading")
    try {
      const result = await getSamplesExtended({})
      if (result.data.length === 0) {
        setPageStatus("empty")
      } else {
        setSamples(result.data)
        setPageStatus("success")
      }
    } catch {
      setPageStatus("error")
    }
  }, [])

  useEffect(() => {
    loadSamples()
  }, [loadSamples])

  const stats = useMemo(() => {
    const total = samples.length
    const collected = samples.filter((s) => s.status === "collected").length
    const processing = samples.filter((s) => s.status === "processing" || s.status === "testing").length
    const rejected = samples.filter((s) => s.status === "rejected").length
    return { total, collected, processing, rejected }
  }, [samples])

  const departments = useMemo(() => {
    const deps = new Set(samples.map((s) => s.department))
    return Array.from(deps)
  }, [samples])

  const filtered = useMemo(() => {
    let data = [...samples]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (s) =>
          s.barcode.toLowerCase().includes(q) ||
          s.patientName.toLowerCase().includes(q) ||
          s.patientPhone?.includes(q)
      )
    }
    if (statusFilter !== "all") data = data.filter((s) => s.status === statusFilter)
    if (departmentFilter !== "all") data = data.filter((s) => s.department === departmentFilter)
    if (priorityFilter !== "all") data = data.filter((s) => s.priority === priorityFilter)
    return data
  }, [samples, search, statusFilter, departmentFilter, priorityFilter])

  const columns: ColumnDef<Sample>[] = [
    {
      id: "barcode",
      header: "Barcode",
      accessorKey: "barcode",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono text-xs font-medium">{row.barcode}</span>
        </div>
      ),
    },
    {
      id: "patientName",
      header: "Patient",
      accessorKey: "patientName",
      cell: (row) => <span className="font-medium">{row.patientName}</span>,
    },
    {
      id: "testName",
      header: "Test",
      accessorKey: "testName",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "priority",
      header: "Priority",
      accessorKey: "priority",
      cell: (row) => <StatusBadge status={row.priority!} />,
    },
    {
      id: "collectedAt",
      header: "Collected At",
      accessorKey: "collectedAt",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.collectedAt ? formatDate(row.collectedAt, "datetime") : "—"}
        </span>
      ),
    },
    {
      id: "department",
      header: "Department",
      accessorKey: "department",
      cell: (row) => <span className="text-xs">{row.department}</span>,
    },
  ]

  return (
    <div className="p-6">
      <PageContainer
        title="Sample Tracking"
        description="Track and monitor all samples across the lifecycle"
        status={pageStatus === "error" ? "error" : "success"}
        errorMessage="Failed to load samples."
        onRetry={loadSamples}
        actions={
          <Button onClick={() => navigate("/samples/register")}>
            <Plus className="mr-2 h-4 w-4" /> Register Sample
          </Button>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon={<Package className="h-5 w-5" />} label="Total Samples" value={stats.total} />
            <StatCard icon={<Syringe className="h-5 w-5" />} label="Collected" value={stats.collected} />
            <StatCard icon={<FlaskConical className="h-5 w-5" />} label="Processing" value={stats.processing} />
            <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={stats.rejected} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search barcode, patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Depts</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d!} value={d!}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={columns}
            data={filtered}
            pageSize={15}
            onRowClick={(row) => navigate(`/samples/${row.id}`)}
            emptyMessage="No samples match your filters."
            filterPlaceholder="Filter samples..."
            exportable
          />
        </div>
      </PageContainer>
    </div>
  )
}
