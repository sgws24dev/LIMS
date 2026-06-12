"use client"

import { useState, useEffect } from "react"
import {
  Save,
  Plus,
  Trash2,
  HardDrive,
  TestTube,
  CheckCircle2,
  Loader2,
  Pencil,
  X,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getInstruments } from "@/mock/services"
import type { Instrument } from "@/types"

interface TestMapping {
  id: string
  instrumentId: string
  instrumentTestCode: string
  instrumentTestName: string
  limsTestCode: string
  limsTestName: string
  unit: string
  conversionFactor: string
  isActive: boolean
}

const mockMappings: TestMapping[] = [
  { id: "MAP001", instrumentId: "INS001", instrumentTestCode: "GLU", instrumentTestName: "Glucose", limsTestCode: "FBS", limsTestName: "Fasting Blood Sugar", unit: "mg/dL", conversionFactor: "1.0", isActive: true },
  { id: "MAP002", instrumentId: "INS001", instrumentTestCode: "CREA", instrumentTestName: "Creatinine", limsTestCode: "CRT", limsTestName: "Creatinine (Serum)", unit: "mg/dL", conversionFactor: "1.0", isActive: true },
  { id: "MAP003", instrumentId: "INS001", instrumentTestCode: "UREA", instrumentTestName: "Urea", limsTestCode: "BUN", limsTestName: "Blood Urea Nitrogen", unit: "mg/dL", conversionFactor: "0.467", isActive: true },
  { id: "MAP004", instrumentId: "INS002", instrumentTestCode: "WBC", instrumentTestName: "White Blood Cells", limsTestCode: "WBC", limsTestName: "Total WBC Count", unit: "10^3/uL", conversionFactor: "1.0", isActive: true },
  { id: "MAP005", instrumentId: "INS002", instrumentTestCode: "RBC", instrumentTestName: "Red Blood Cells", limsTestCode: "RBC", limsTestName: "Total RBC Count", unit: "10^6/uL", conversionFactor: "1.0", isActive: true },
  { id: "MAP006", instrumentId: "INS003", instrumentTestCode: "T4", instrumentTestName: "Thyroxine", limsTestCode: "T4", limsTestName: "Total T4", unit: "ug/dL", conversionFactor: "1.0", isActive: true },
  { id: "MAP007", instrumentId: "INS003", instrumentTestCode: "TSH", instrumentTestName: "TSH", limsTestCode: "TSH", limsTestName: "Thyroid Stimulating Hormone", unit: "mIU/L", conversionFactor: "1.0", isActive: false },
]

export default function MappingConfigPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [mappings, setMappings] = useState<TestMapping[]>(mockMappings)
  const [filterInstrument, setFilterInstrument] = useState("all")
  const [saving, setSaving] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<TestMapping>>({})
  const [showAdd, setShowAdd] = useState(false)
  const [newMapping, setNewMapping] = useState({
    instrumentId: "",
    instrumentTestCode: "",
    instrumentTestName: "",
    limsTestCode: "",
    limsTestName: "",
    unit: "",
    conversionFactor: "1.0",
  })
  const [filterLimsTest, setFilterLimsTest] = useState("")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Instruments", href: "/instruments" },
      { label: "Mapping Config" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await getInstruments()
        setInstruments(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load instruments")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredMappings = mappings.filter((m) => {
    const matchesInstrument = filterInstrument === "all" || m.instrumentId === filterInstrument
    const matchesTest = !filterLimsTest || m.limsTestName.toLowerCase().includes(filterLimsTest.toLowerCase()) || m.instrumentTestName.toLowerCase().includes(filterLimsTest.toLowerCase())
    return matchesInstrument && matchesTest
  })

  const handleEdit = (mapping: TestMapping) => {
    setEditingId(mapping.id)
    setEditForm({ ...mapping })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSaving(editingId)
    await new Promise((r) => setTimeout(r, 300))
    setMappings((prev) => prev.map((m) => m.id === editingId ? { ...m, ...editForm } as TestMapping : m))
    toast({ title: "Mapping Updated", variant: "success" })
    setEditingId(null)
    setSaving(null)
  }

  const handleDelete = async (id: string) => {
    setSaving(id)
    await new Promise((r) => setTimeout(r, 200))
    setMappings((prev) => prev.filter((m) => m.id !== id))
    toast({ title: "Mapping Deleted", variant: "success" })
    setSaving(null)
  }

  const handleAdd = async () => {
    if (!newMapping.instrumentId || !newMapping.instrumentTestCode || !newMapping.limsTestCode) {
      toast({ title: "Validation Error", description: "Instrument and test codes are required", variant: "destructive" })
      return
    }
    setSaving("new")
    await new Promise((r) => setTimeout(r, 300))
    const mapping: TestMapping = {
      id: `MAP${String(mappings.length + 1).padStart(3, "0")}`,
      instrumentId: newMapping.instrumentId,
      instrumentTestCode: newMapping.instrumentTestCode,
      instrumentTestName: newMapping.instrumentTestName,
      limsTestCode: newMapping.limsTestCode,
      limsTestName: newMapping.limsTestName,
      unit: newMapping.unit,
      conversionFactor: newMapping.conversionFactor || "1.0",
      isActive: true,
    }
    setMappings((prev) => [...prev, mapping])
    setShowAdd(false)
    setNewMapping({ instrumentId: "", instrumentTestCode: "", instrumentTestName: "", limsTestCode: "", limsTestName: "", unit: "", conversionFactor: "1.0" })
    toast({ title: "Mapping Added", variant: "success" })
    setSaving(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Test Mapping Configuration" description="Map instrument test codes to LIMS test codes" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Test Mapping Configuration" description="Map instrument test codes to LIMS test codes" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Test Mapping Configuration"
        description="Map instrument test codes to LIMS test codes"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filterInstrument} onValueChange={setFilterInstrument}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All Instruments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Instruments</SelectItem>
            {instruments.map((i) => (
              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Search tests..."
            value={filterLimsTest}
            onChange={(e) => setFilterLimsTest(e.target.value)}
          />
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1 h-3.5 w-3.5" /> Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Test Mapping</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4">
              <Select value={newMapping.instrumentId} onValueChange={(v) => setNewMapping((p) => ({ ...p, instrumentId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Instrument" />
                </SelectTrigger>
                <SelectContent>
                  {instruments.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input label="Instrument Test Code" placeholder="e.g. GLU" value={newMapping.instrumentTestCode} onChange={(e) => setNewMapping((p) => ({ ...p, instrumentTestCode: e.target.value }))} />
              <Input label="Instrument Test Name" placeholder="e.g. Glucose" value={newMapping.instrumentTestName} onChange={(e) => setNewMapping((p) => ({ ...p, instrumentTestName: e.target.value }))} />
              <Input label="LIMS Test Code" placeholder="e.g. FBS" value={newMapping.limsTestCode} onChange={(e) => setNewMapping((p) => ({ ...p, limsTestCode: e.target.value }))} />
              <Input label="LIMS Test Name" placeholder="e.g. Fasting Blood Sugar" value={newMapping.limsTestName} onChange={(e) => setNewMapping((p) => ({ ...p, limsTestName: e.target.value }))} />
              <Input label="Unit" placeholder="e.g. mg/dL" value={newMapping.unit} onChange={(e) => setNewMapping((p) => ({ ...p, unit: e.target.value }))} />
              <Input label="Conversion Factor" placeholder="1.0" value={newMapping.conversionFactor} onChange={(e) => setNewMapping((p) => ({ ...p, conversionFactor: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={saving === "new"}>
                {saving === "new" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
                Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredMappings.length === 0 ? (
            <EmptyState title="No mappings found" description="Add a mapping or adjust your filters" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instrument</TableHead>
                  <TableHead>Instrument Test</TableHead>
                  <TableHead>LIMS Test</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Factor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMappings.map((m) => {
                  const inst = instruments.find((i) => i.id === m.instrumentId)
                  return (
                    <TableRow key={m.id}>
                      {editingId === m.id ? (
                        <>
                          <TableCell>{inst?.name || m.instrumentId}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Input className="h-7 w-20 text-xs" value={editForm.instrumentTestCode || ""} onChange={(e) => setEditForm((p) => ({ ...p, instrumentTestCode: e.target.value }))} />
                              <Input className="h-7 w-20 text-xs" value={editForm.instrumentTestName || ""} onChange={(e) => setEditForm((p) => ({ ...p, instrumentTestName: e.target.value }))} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Input className="h-7 w-16 text-xs" value={editForm.limsTestCode || ""} onChange={(e) => setEditForm((p) => ({ ...p, limsTestCode: e.target.value }))} />
                              <Input className="h-7 w-20 text-xs" value={editForm.limsTestName || ""} onChange={(e) => setEditForm((p) => ({ ...p, limsTestName: e.target.value }))} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input className="h-7 w-16 text-xs" value={editForm.unit || ""} onChange={(e) => setEditForm((p) => ({ ...p, unit: e.target.value }))} />
                          </TableCell>
                          <TableCell>
                            <Input className="h-7 w-16 text-xs" value={editForm.conversionFactor || ""} onChange={(e) => setEditForm((p) => ({ ...p, conversionFactor: e.target.value }))} />
                          </TableCell>
                          <TableCell>
                            <Select value={editForm.isActive ? "true" : "false"} onValueChange={(v) => setEditForm((p) => ({ ...p, isActive: v === "true" }))}>
                              <SelectTrigger className="h-7 w-24 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon-sm" onClick={handleSaveEdit} disabled={saving === m.id}>
                                {saving === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => setEditingId(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell className="font-medium">{inst?.name || m.instrumentId}</TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{m.instrumentTestCode}</span>
                            <span className="ml-1 text-muted-foreground">{m.instrumentTestName}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-xs">{m.limsTestCode}</span>
                            <span className="ml-1 text-muted-foreground">{m.limsTestName}</span>
                          </TableCell>
                          <TableCell className="text-xs">{m.unit}</TableCell>
                          <TableCell className="text-xs font-mono">{m.conversionFactor}</TableCell>
                          <TableCell>
                            <Badge variant={m.isActive ? "success" : "secondary"}>{m.isActive ? "Active" : "Inactive"}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(m)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(m.id)} disabled={saving === m.id}>
                                {saving === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3 text-destructive" />}
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
        <strong>{filteredMappings.length}</strong> mapping(s) configured · Mappings determine how instrument result codes translate to LIMS test codes
      </div>
    </div>
  )
}
