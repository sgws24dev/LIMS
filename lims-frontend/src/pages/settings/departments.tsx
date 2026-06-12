"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { departmentSchema, type DepartmentForm } from "@/lib/validations"
import {
  Plus, Edit, ChevronDown, ChevronUp, GripVertical,
  FlaskConical, Calendar, Clock, Sun, Moon, Beaker,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/ui/search-input"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSelect } from "@/components/forms/form-select"
import { FormActions } from "@/components/forms/form-actions"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Department {
  id: string
  name: string
  code: string
  head: string
  activeTests: number
  isActive: boolean
  description: string
}

interface Unit {
  id: string
  name: string
  symbol: string
  category: string
}

interface Holiday {
  id: string
  name: string
  date: string
  type: "public" | "company" | "optional"
}

interface WorkingDay {
  day: string
  isWorking: boolean
  openTime: string
  closeTime: string
  isHalfDay: boolean
}

const initialDepartments: Department[] = [
  { id: "DEPT001", name: "Biochemistry", code: "BIOCH", head: "Dr. Arun Nair", activeTests: 45, isActive: true, description: "Clinical biochemistry and metabolic panel testing" },
  { id: "DEPT002", name: "Hematology", code: "HEMA", head: "Dr. Sunita Joshi", activeTests: 38, isActive: true, description: "Complete blood count and coagulation studies" },
  { id: "DEPT003", name: "Microbiology", code: "MICRO", head: "Dr. Karan Shah", activeTests: 52, isActive: true, description: "Microbiological culture and sensitivity testing" },
  { id: "DEPT004", name: "Immunology", code: "IMMU", head: "Dr. Pooja Deshmukh", activeTests: 28, isActive: true, description: "Immunoassay and serology testing" },
  { id: "DEPT005", name: "Histopathology", code: "HISTO", head: "Dr. Vikram Reddy", activeTests: 22, isActive: true, description: "Tissue biopsy and cytopathology" },
  { id: "DEPT006", name: "Molecular Biology", code: "MOL", head: "Dr. Ananya Kapoor", activeTests: 18, isActive: true, description: "PCR and genetic testing" },
  { id: "DEPT007", name: "Clinical Pathology", code: "CLIN", head: "Dr. Ravi Menon", activeTests: 32, isActive: true, description: "Routine clinical pathology testing" },
  { id: "DEPT008", name: "Endocrinology", code: "ENDO", head: "Dr. Meera Iyer", activeTests: 15, isActive: false, description: "Hormone and endocrine disorder testing" },
]

const initialUnits: Unit[] = [
  { id: "U001", name: "Milligram per Deciliter", symbol: "mg/dL", category: "Biochemistry" },
  { id: "U002", name: "Gram per Deciliter", symbol: "g/dL", category: "Hematology" },
  { id: "U003", name: "Millimole per Liter", symbol: "mmol/L", category: "Biochemistry" },
  { id: "U004", name: "International Units per Liter", symbol: "IU/L", category: "Enzymes" },
  { id: "U005", name: "Cells per Microliter", symbol: "cells/μL", category: "Hematology" },
  { id: "U006", name: "Milliliter per Minute", symbol: "mL/min", category: "Clinical" },
  { id: "U007", name: "Microgram per Liter", symbol: "μg/L", category: "Immunology" },
  { id: "U008", name: "Milligram per Liter", symbol: "mg/L", category: "Immunology" },
  { id: "U009", name: "Percent", symbol: "%", category: "Hematology" },
  { id: "U010", name: "Millimeter per Hour", symbol: "mm/hr", category: "Hematology" },
]

const initialHolidays: Holiday[] = [
  { id: "H001", name: "Republic Day", date: "2026-01-26", type: "public" },
  { id: "H002", name: "Holi", date: "2026-03-04", type: "public" },
  { id: "H003", name: "Good Friday", date: "2026-04-03", type: "public" },
  { id: "H004", name: "Independence Day", date: "2026-08-15", type: "public" },
  { id: "H005", name: "Gandhi Jayanti", date: "2026-10-02", type: "public" },
  { id: "H006", name: "Diwali", date: "2026-11-07", type: "public" },
  { id: "H007", name: "Christmas", date: "2026-12-25", type: "public" },
  { id: "H008", name: "Foundation Day", date: "2026-05-10", type: "company" },
]

const workingDaysInitial: WorkingDay[] = [
  { day: "Monday", isWorking: true, openTime: "07:00", closeTime: "21:00", isHalfDay: false },
  { day: "Tuesday", isWorking: true, openTime: "07:00", closeTime: "21:00", isHalfDay: false },
  { day: "Wednesday", isWorking: true, openTime: "07:00", closeTime: "21:00", isHalfDay: false },
  { day: "Thursday", isWorking: true, openTime: "07:00", closeTime: "21:00", isHalfDay: false },
  { day: "Friday", isWorking: true, openTime: "07:00", closeTime: "21:00", isHalfDay: false },
  { day: "Saturday", isWorking: true, openTime: "08:00", closeTime: "18:00", isHalfDay: false },
  { day: "Sunday", isWorking: false, openTime: "09:00", closeTime: "14:00", isHalfDay: true },
]

const holidayTypeColors: Record<string, "default" | "success" | "warning" | "secondary"> = {
  public: "default",
  company: "success",
  optional: "secondary",
}

const doctorOptions = [
  { value: "Dr. Arun Nair", label: "Dr. Arun Nair" },
  { value: "Dr. Sunita Joshi", label: "Dr. Sunita Joshi" },
  { value: "Dr. Karan Shah", label: "Dr. Karan Shah" },
  { value: "Dr. Pooja Deshmukh", label: "Dr. Pooja Deshmukh" },
  { value: "Dr. Vikram Reddy", label: "Dr. Vikram Reddy" },
]

export default function Departments() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Settings", href: "/settings" }, { label: "Departments" }])
  }, [])

  const [departments, setDepartments] = useState<Department[]>(initialDepartments)
  const [units, setUnits] = useState<Unit[]>(initialUnits)
  const [showAddUnitDialog, setShowAddUnitDialog] = useState(false)
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays)
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>(workingDaysInitial)
  const [search, setSearch] = useState("")
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const addMethods = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", head: "", description: "" },
  })

  const editMethods = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", code: "", head: "", description: "" },
  })

  const handleEditDialogOpen = useCallback((dept: Department) => {
    setEditingDept(dept)
    editMethods.reset({ name: dept.name, code: dept.code, head: dept.head, description: dept.description })
    setShowEditDialog(true)
  }, [])

  const filteredDepartments = useMemo(() => {
    if (!search) return departments
    const q = search.toLowerCase()
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.head.toLowerCase().includes(q)
    )
  }, [departments, search])

  const onAddSubmit = useCallback((data: DepartmentForm) => {
    const dept: Department = {
      id: `DEPT${String(departments.length + 1).padStart(3, "0")}`,
      name: data.name,
      code: data.code.toUpperCase(),
      head: data.head || "Unassigned",
      activeTests: 0,
      isActive: true,
      description: data.description || "",
    }
    setDepartments([...departments, dept])
    addMethods.reset({ name: "", code: "", head: "", description: "" })
    setShowAddDialog(false)
    toast({ title: "Department added", variant: "success" })
  }, [departments, toast])

  const onEditSubmit = useCallback((data: DepartmentForm) => {
    if (!editingDept) return
    const updated: Department = {
      ...editingDept,
      name: data.name,
      code: data.code.toUpperCase(),
      head: data.head || "Unassigned",
      description: data.description || "",
    }
    setDepartments(departments.map((d) => (d.id === editingDept.id ? updated : d)))
    setShowEditDialog(false)
    toast({ title: "Department updated", variant: "success" })
  }, [editingDept, departments, toast])

  const handleToggleStatus = useCallback((id: string) => {
    setDepartments(departments.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
    toast({ title: "Status updated", variant: "success" })
  }, [departments, toast])

  const handleDelete = useCallback((id: string) => {
    setDepartments(departments.filter((d) => d.id !== id))
    toast({ title: "Department removed", variant: "success" })
  }, [departments, toast])

  const [unitName, setUnitName] = useState("")
  const [unitSymbol, setUnitSymbol] = useState("")
  const [unitCategory, setUnitCategory] = useState("Biochemistry")

  const handleAddUnit = useCallback(() => {
    if (!unitName || !unitSymbol) {
      toast({ title: "Validation error", description: "Name and symbol are required.", variant: "destructive" })
      return
    }
    const newUnit: Unit = {
      id: `U${String(units.length + 1).padStart(3, "0")}`,
      name: unitName,
      symbol: unitSymbol,
      category: unitCategory,
    }
    setUnits([...units, newUnit])
    setUnitName("")
    setUnitSymbol("")
    setUnitCategory("Biochemistry")
    setShowAddUnitDialog(false)
    toast({ title: "Unit added", description: `${unitName} (${unitSymbol}) has been created.`, variant: "success" })
  }, [units, unitName, unitSymbol, unitCategory, toast])

  const handleAddHoliday = useCallback(() => {
    toast({ title: "Holiday feature", description: "Add holiday dialog would open here.", variant: "default" })
  }, [toast])

  const departmentColumns: ColumnDef<Department>[] = [
    {
      id: "grip",
      header: "",
      sortable: false,
      filterable: false,
      className: "w-8",
      cell: () => <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />,
    },
    {
      id: "name",
      header: "Department",
      cell: (dept) => (
        <div>
          <p className="font-medium">{dept.name}</p>
          <p className="text-xs text-muted-foreground">{dept.description}</p>
        </div>
      ),
    },
    {
      id: "code",
      header: "Code",
      cell: (dept) => <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{dept.code}</code>,
    },
    {
      id: "head",
      header: "Head",
      accessorKey: "head",
    },
    {
      id: "activeTests",
      header: "Active Tests",
      accessorKey: "activeTests",
      className: "text-right",
    },
    {
      id: "status",
      header: "Status",
      cell: (dept) => (
        <Badge variant={dept.isActive ? "success" : "secondary"}>
          {dept.isActive ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      className: "w-28",
      cell: (dept) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditDialogOpen(dept)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleStatus(dept.id)}>
            {dept.isActive ? <ChevronDown className="h-4 w-4 text-destructive" /> : <ChevronUp className="h-4 w-4 text-emerald-500" />}
          </Button>
        </div>
      ),
    },
  ]

  const unitColumns: ColumnDef<Unit>[] = [
    { id: "name", header: "Unit Name", accessorKey: "name" },
    {
      id: "symbol",
      header: "Symbol",
      cell: (unit) => <code className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{unit.symbol}</code>,
    },
    {
      id: "category",
      header: "Category",
      cell: (unit) => <Badge variant="secondary">{unit.category}</Badge>,
    },
  ]

  const holidayColumns: ColumnDef<Holiday>[] = [
    { id: "name", header: "Holiday", accessorKey: "name" },
    {
      id: "date",
      header: "Date",
      cell: (h) => new Date(h.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    },
    {
      id: "type",
      header: "Type",
      cell: (h) => <Badge variant={holidayTypeColors[h.type] || "secondary"}>{h.type}</Badge>,
    },
    {
      id: "day",
      header: "Day",
      cell: (h) => <span className="text-muted-foreground">{new Date(h.date).toLocaleDateString("en-IN", { weekday: "short" })}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments & Configuration"
        description="Manage laboratory departments, units, holidays, and working hours"
      />

      <Tabs defaultValue="departments">
        <TabsList>
          <TabsTrigger value="departments">
            <FlaskConical className="mr-2 h-4 w-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="units">
            <Beaker className="mr-2 h-4 w-4" />
            Units
          </TabsTrigger>
          <TabsTrigger value="holidays">
            <Calendar className="mr-2 h-4 w-4" />
            Holidays
          </TabsTrigger>
          <TabsTrigger value="hours">
            <Clock className="mr-2 h-4 w-4" />
            Working Hours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput
              placeholder="Search departments..."
              value={search}
              onSearch={setSearch}
              className="w-60"
            />
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Department
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Department</DialogTitle>
                  <DialogDescription>Create a new laboratory department</DialogDescription>
                </DialogHeader>
                <FormProvider {...addMethods}>
                  <form onSubmit={addMethods.handleSubmit(onAddSubmit)}>
                    <div className="space-y-4">
                      <FormErrorSummary />
                      <FormInput name="name" label="Department Name" placeholder="e.g. Immunology" />
                      <FormInput name="code" label="Code" placeholder="e.g. IMMU" onChange={(e) => addMethods.setValue("code", e.target.value.toUpperCase())} />
                      <FormSelect name="head" label="Department Head" placeholder="Select a doctor" options={doctorOptions} />
                      <FormTextarea name="description" label="Description" placeholder="Brief description" />
                    </div>
                    <DialogFooter className="mt-4">
                      <DialogClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                      </DialogClose>
                      <FormActions submitLabel="Add Department" showCancel={false} />
                    </DialogFooter>
                  </form>
                </FormProvider>
              </DialogContent>
            </Dialog>
          </div>

          <DataTable columns={departmentColumns} data={filteredDepartments} pageSize={10} emptyMessage="No departments found" exportable />
        </TabsContent>

        <TabsContent value="units" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{units.length} measurement units configured</p>
            <Button variant="outline" size="sm" onClick={() => setShowAddUnitDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Unit
            </Button>
          </div>
          <DataTable columns={unitColumns} data={units} pageSize={10} exportable />
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{holidays.length} holidays configured</p>
            <Button onClick={handleAddHoliday}>
              <Plus className="mr-2 h-4 w-4" />
              Add Holiday
            </Button>
          </div>
          <DataTable columns={holidayColumns} data={holidays} pageSize={10} exportable />
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Working Hours</CardTitle>
              <CardDescription>Configure operating hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {workingDays.map((wd) => (
                <div key={wd.day} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={wd.isWorking}
                      onCheckedChange={(v) => setWorkingDays(workingDays.map((d) => d.day === wd.day ? { ...d, isWorking: v } : d))}
                    />
                    <div>
                      <p className={cn("text-sm font-medium", !wd.isWorking && "text-muted-foreground line-through")}>{wd.day}</p>
                      {wd.isHalfDay && <Badge variant="warning" className="mt-0.5 text-[10px]">Half Day</Badge>}
                    </div>
                  </div>
                  {wd.isWorking && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <input
                          type="time"
                          value={wd.openTime}
                          onChange={(e) => setWorkingDays(workingDays.map((d) => d.day === wd.day ? { ...d, openTime: e.target.value } : d))}
                          className="rounded-md border px-2 py-1 text-sm"
                        />
                      </div>
                      <span className="text-muted-foreground">to</span>
                      <div className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-blue-500" />
                        <input
                          type="time"
                          value={wd.closeTime}
                          onChange={(e) => setWorkingDays(workingDays.map((d) => d.day === wd.day ? { ...d, closeTime: e.target.value } : d))}
                          className="rounded-md border px-2 py-1 text-sm"
                        />
                      </div>
                      <Switch
                        checked={wd.isHalfDay}
                        onCheckedChange={(v) => setWorkingDays(workingDays.map((d) => d.day === wd.day ? { ...d, isHalfDay: v } : d))}
                        aria-label="Half day"
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Department Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) setShowEditDialog(false)
        if (open && editingDept) {
          editMethods.reset({ name: editingDept.name, code: editingDept.code, head: editingDept.head, description: editingDept.description })
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
          </DialogHeader>
          <FormProvider {...editMethods}>
            <form onSubmit={editMethods.handleSubmit(onEditSubmit)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <FormInput name="name" label="Department Name" placeholder="e.g. Immunology" />
                <FormInput name="code" label="Code" placeholder="e.g. IMMU" onChange={(e) => editMethods.setValue("code", e.target.value.toUpperCase())} />
                <FormSelect name="head" label="Department Head" placeholder="Select a doctor" options={doctorOptions} />
                <FormTextarea name="description" label="Description" placeholder="Brief description" />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline" type="button">Cancel</Button>
                </DialogClose>
                <FormActions submitLabel="Save Changes" showCancel={false} />
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddUnitDialog} onOpenChange={setShowAddUnitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Unit</DialogTitle>
            <DialogDescription>Create a new measurement unit</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="unit-name">Unit Name</Label>
              <Input id="unit-name" value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="e.g. Milligram per Deciliter" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-symbol">Symbol</Label>
              <Input id="unit-symbol" value={unitSymbol} onChange={(e) => setUnitSymbol(e.target.value)} placeholder="e.g. mg/dL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-category">Category</Label>
              <Select value={unitCategory} onValueChange={setUnitCategory}>
                <SelectTrigger id="unit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biochemistry">Biochemistry</SelectItem>
                  <SelectItem value="Hematology">Hematology</SelectItem>
                  <SelectItem value="Immunology">Immunology</SelectItem>
                  <SelectItem value="Enzymes">Enzymes</SelectItem>
                  <SelectItem value="Clinical">Clinical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUnitDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUnit}>Add Unit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
