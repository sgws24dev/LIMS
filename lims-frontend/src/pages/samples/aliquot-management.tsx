"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import type { Aliquot, Sample } from "@/types"
import { getAliquots, createAliquot, getSamplesExtended } from "@/mock/services"
import { formatDate } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
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
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  FlaskRound,
  Plus,
  Search,
  Barcode,
  Clock,
  AlertTriangle,
} from "lucide-react"

export default function AliquotManagementPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aliquots, setAliquots] = useState<Aliquot[]>([])
  const [samples, setSamples] = useState<Sample[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [createDialog, setCreateDialog] = useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState("")
  const [aliquotVolume, setAliquotVolume] = useState("2mL")
  const [aliquotContainer, setAliquotContainer] = useState("Microtube")
  const [expiryDate, setExpiryDate] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Aliquots" },
    ])
  }, [setBreadcrumbs])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [alq, smp] = await Promise.all([
        getAliquots({}),
        getSamplesExtended({}),
      ])
      setAliquots(alq)
      setSamples(smp.data)
    } catch {
      setError("Failed to load aliquot data.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const stats = useMemo(() => {
    const total = aliquots.length
    const available = aliquots.filter((a) => a.status === "available").length
    const inUse = aliquots.filter((a) => a.status === "in_use").length
    const expired = aliquots.filter((a) => a.status === "expired").length
    return { total, available, inUse, expired }
  }, [aliquots])

  const filtered = useMemo(() => {
    let data = [...aliquots]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (a) =>
          a.barcode.toLowerCase().includes(q) ||
          a.parentSampleId.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") data = data.filter((a) => a.status === statusFilter)
    return data
  }, [aliquots, search, statusFilter])

  const columns: ColumnDef<Aliquot>[] = [
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
      id: "parentSampleId",
      header: "Parent Sample",
      accessorKey: "parentSampleId",
      cell: (row) => {
        const parent = samples.find((s) => s.id === row.parentSampleId)
        return <span className="text-xs font-mono">{parent?.barcode || row.parentSampleId}</span>
      },
    },
    {
      id: "volume",
      header: "Volume",
      accessorKey: "volume",
    },
    {
      id: "container",
      header: "Container",
      accessorKey: "container",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: (row) => <span className="text-xs">{formatDate(row.createdAt, "datetime")}</span>,
    },
    {
      id: "expiryDate",
      header: "Expiry",
      accessorKey: "expiryDate",
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.expiryDate ? formatDate(row.expiryDate, "short") : "—"}
        </span>
      ),
    },
  ]

  const handleCreate = async () => {
    if (!selectedSampleId) {
      showToast({ type: "error", title: "Validation Error", message: "Please select a parent sample." })
      return
    }
    setSaving(true)
    try {
      const parent = samples.find((s) => s.id === selectedSampleId)
      const barcode = parent
        ? parent.barcode + "-ALQ" + String(aliquots.length + 1)
        : "ALQ-" + String(aliquots.length + 1).padStart(4, "0")
      await createAliquot({
        parentSampleId: selectedSampleId,
        barcode,
        volume: aliquotVolume,
        container: aliquotContainer,
        createdBy: "Current User",
        createdAt: new Date().toISOString(),
        usedFor: "",
        status: "available",
        expiryDate: expiryDate || undefined,
      })
      showToast({ type: "success", title: "Aliquot Created", message: `Aliquot ${barcode} has been created.` })
      setCreateDialog(false)
      setSelectedSampleId("")
      setExpiryDate("")
      loadData()
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to create aliquot." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="table" count={3} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Aliquot Management"
        description="Manage sample aliquots, track usage and expiry"
        actions={
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Aliquot
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<FlaskRound className="h-5 w-5" />} label="Total Aliquots" value={stats.total} />
        <StatCard icon={<FlaskRound className="h-5 w-5" />} label="Available" value={stats.available} />
        <StatCard icon={<FlaskRound className="h-5 w-5" />} label="In Use" value={stats.inUse} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Expired" value={stats.expired} />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Aliquots</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={15}
            filterPlaceholder="Search by barcode..."
            emptyMessage="No aliquots found."
            exportable
          />
        </CardContent>
      </Card>

      <Dialog open={createDialog} onOpenChange={(o) => !o && setCreateDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Aliquot</DialogTitle>
            <DialogDescription>Create an aliquot from a parent sample.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Parent Sample</label>
              <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sample..." />
                </SelectTrigger>
                <SelectContent>
                  {samples.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.barcode} - {s.patientName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume</label>
                <Select value={aliquotVolume} onValueChange={setAliquotVolume}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["0.5mL", "1mL", "2mL", "3mL", "5mL", "10mL"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Container</label>
                <Select value={aliquotContainer} onValueChange={setAliquotContainer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Microtube", "Cryovial", "Eppendorf", "PCR Tube", "Vacutainer"].map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Expiry Date (optional)</label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !selectedSampleId}>
              {saving ? "Creating..." : "Create Aliquot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
