"use client"

import { useState } from "react"
import { Plus, Filter, Share2, Star, Trash2, Copy, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/components/shared/page-container"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"

interface FilterCondition {
  field: string
  operator: string
  value: string
}

interface SavedFilter {
  id: string
  name: string
  page: string
  conditions: FilterCondition[]
  isDefault: boolean
  shared: boolean
  createdBy: string
}

const fields = ["Status", "Department", "Priority", "Patient Name", "Test Name", "Date", "Branch", "Doctor"]
const operators = ["Equals", "Not Equals", "Contains", "Starts With", "Greater Than", "Less Than", "Between"]

const initialFilters: SavedFilter[] = [
  { id: "flt-1", name: "Pending Samples", page: "Samples", conditions: [{ field: "Status", operator: "Equals", value: "pending" }], isDefault: true, shared: true, createdBy: "Admin" },
  { id: "flt-2", name: "Urgent Tests Today", page: "Samples", conditions: [{ field: "Priority", operator: "Equals", value: "urgent" }], isDefault: false, shared: false, createdBy: "Admin" },
  { id: "flt-3", name: "Critical Results", page: "Results", conditions: [{ field: "Status", operator: "Equals", value: "critical" }], isDefault: false, shared: true, createdBy: "Tech Lead" },
  { id: "flt-4", name: "Biochemistry Dept", page: "Samples", conditions: [{ field: "Department", operator: "Equals", value: "Biochemistry" }], isDefault: false, shared: false, createdBy: "Manager" },
  { id: "flt-5", name: "This Week Bookings", page: "Bookings", conditions: [{ field: "Date", operator: "Greater Than", value: "last 7 days" }], isDefault: true, shared: true, createdBy: "Admin" },
]

const filterColumns: ColumnDef<SavedFilter>[] = [
  { id: "name", header: "Filter Name", accessorKey: "name", sortable: true },
  { id: "page", header: "Page", accessorKey: "page" },
  {
    id: "conditions", header: "Conditions", accessorKey: "conditions",
    cell: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.conditions.map((c, i) => (
          <Badge key={i} variant="secondary" className="text-[10px]">
            {c.field} {c.operator} {c.value}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    id: "isDefault", header: "Default", accessorKey: "isDefault",
    cell: (row) => row.isDefault ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : null,
  },
  {
    id: "shared", header: "Shared", accessorKey: "shared",
    cell: (row) => row.shared ? <Badge variant="info">Team</Badge> : <Badge variant="secondary">Private</Badge>,
  },
  {
    id: "actions", header: "Actions",
    cell: () => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm"><Copy className="h-3.5 w-3.5" /></Button>
        <Button variant="ghost" size="icon-sm"><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
      </div>
    ),
  },
]

export default function SavedFilters() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [showDialog, setShowDialog] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [newFilter, setNewFilter] = useState<{ name: string; page: string; conditions: FilterCondition[] }>({
    name: "",
    page: "Samples",
    conditions: [{ field: "Status", operator: "Equals", value: "" }],
  })

  useState(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Premium" },
      { label: "Saved Filters" },
    ])
  })

  const handleAddCondition = () => {
    setNewFilter((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: "Status", operator: "Equals", value: "" }],
    }))
  }

  const handleRemoveCondition = (index: number) => {
    setNewFilter((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }))
  }

  const handleUpdateCondition = (index: number, key: keyof FilterCondition, value: string) => {
    setNewFilter((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c, i) => (i === index ? { ...c, [key]: value } : c)),
    }))
  }

  const handleSaveFilter = () => {
    if (!newFilter.name.trim()) {
      showToast({ type: "error", title: "Error", message: "Filter name is required" })
      return
    }
    const filter: SavedFilter = {
      id: `flt-${Date.now()}`,
      name: newFilter.name,
      page: newFilter.page,
      conditions: newFilter.conditions,
      isDefault: false,
      shared: false,
      createdBy: "You",
    }
    setFilters((prev) => [...prev, filter])
    setShowDialog(false)
    setNewFilter({ name: "", page: "Samples", conditions: [{ field: "Status", operator: "Equals", value: "" }] })
    showToast({ type: "success", title: "Filter saved", message: `"${filter.name}" has been saved` })
  }

  const handleApply = (filter: SavedFilter) => {
    showToast({ type: "info", title: "Filter applied", message: `"${filter.name}" filter applied` })
  }

  const handleShare = (filter: SavedFilter) => {
    showToast({ type: "success", title: "Shared", message: `"${filter.name}" shared with team` })
  }

  const handleSetDefault = (filter: SavedFilter) => {
    setFilters((prev) =>
      prev.map((f) => ({ ...f, isDefault: f.id === filter.id }))
    )
    showToast({ type: "success", title: "Default set", message: `"${filter.name}" is now the default filter` })
  }

  return (
    <PageContainer
      title="Saved Filters"
      description="Create, manage, and share custom filters for any page"
      status="success"
      actions={
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Filter
        </Button>
      }
    >
      <div className="space-y-3">
        {filters.map((filter) => (
          <Card key={filter.id} className="transition-all hover:shadow-card-hover">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex flex-1 items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Filter className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{filter.name}</span>
                    {filter.isDefault && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{filter.page} &middot; {filter.conditions.length} condition{filter.conditions.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {filter.conditions.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {c.field} {getOperatorSymbol(c.operator)} {c.value}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleApply(filter)}>
                  Apply
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleShare(filter)}>
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleSetDefault(filter)}>
                  <Star className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Filter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Filter Name</label>
              <Input
                placeholder="e.g., Pending Biochemistry Samples"
                value={newFilter.name}
                onChange={(e) => setNewFilter((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Page</label>
              <Select
                value={newFilter.page}
                onValueChange={(v) => setNewFilter((prev) => ({ ...prev, page: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Samples", "Results", "Bookings", "Patients", "Invoices"].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Conditions</label>
                <Button variant="ghost" size="sm" onClick={handleAddCondition}>
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              {newFilter.conditions.map((cond, i) => (
                <div key={i} className="mb-2 flex items-center gap-2">
                  <Select value={cond.field} onValueChange={(v) => handleUpdateCondition(i, "field", v)}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={cond.operator} onValueChange={(v) => handleUpdateCondition(i, "operator", v)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    className="w-[130px]"
                    value={cond.value}
                    onChange={(e) => handleUpdateCondition(i, "value", e.target.value)}
                  />
                  <Button variant="ghost" size="icon-sm" onClick={() => handleRemoveCondition(i)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveFilter}>Save Filter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

function getOperatorSymbol(op: string): string {
  const map: Record<string, string> = {
    "Equals": "=",
    "Not Equals": "≠",
    "Contains": "~",
    "Starts With": "^",
    "Greater Than": ">",
    "Less Than": "<",
    "Between": "∈",
  }
  return map[op] ?? op
}
