"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Users, Phone } from "lucide-react"
import type { Patient } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  type ColumnDef,
} from "@/components/ui/data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { BulkActions } from "@/components/shared/bulk-actions"
import { StatusBadge } from "@/components/shared/status-badge"
import { exportToCSV } from "@/components/shared/export-button"
import { formatDate } from "@/lib/utils"
import { getPatients, deletePatient, bulkDeletePatients } from "@/mock/services"
import { patients as mockPatients } from "@/mock/data/patients"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const bloodGroups = [...new Set(mockPatients.map((p) => p.bloodGroup))].sort()
const cities = [...new Set(mockPatients.map((p) => p.city))].sort()
const genders = ["male", "female"]

export default function PatientsList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [patients, setPatients] = useState<Patient[]>([])
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRows, setSelectedRows] = useState<Patient[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const pageSize = 10

  useEffect(() => {
    setBreadcrumbs([{ label: "Patients" }])
  }, [])

  const fetchPatients = useCallback(async () => {
    setPageStatus("loading")
    try {
      const params: Record<string, unknown> = { page, limit: pageSize }
      if (search) params.search = search
      if (genderFilter !== "all") params.gender = genderFilter
      if (cityFilter !== "all") params.city = cityFilter
      const result = await getPatients(params as any)
      setPatients(result.data)
      setTotalPages(result.totalPages)
      setPageStatus(result.data.length === 0 ? "empty" : "success")
    } catch {
      setPageStatus("error")
    }
  }, [page, search, genderFilter, cityFilter])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setDeleting(true)
    try {
      await deletePatient(deleteDialog.id)
      toast({ title: "Patient deleted", variant: "success" })
      setDeleteDialog({ open: false })
      fetchPatients()
    } catch {
      toast({ title: "Failed to delete patient", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      await bulkDeletePatients(selectedRows.map((r) => r.id))
      toast({ title: `${selectedRows.length} patients deleted`, variant: "success" })
      setBulkDeleteDialog(false)
      setSelectedRows([])
      fetchPatients()
    } catch {
      toast({ title: "Failed to delete patients", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    exportToCSV(
      patients.map((p) => ({
        Name: p.name,
        Phone: p.phone,
        Email: p.email,
        Age: calculateAge(p.dob),
        Gender: p.gender,
        "Blood Group": p.bloodGroup,
        City: p.city,
      })),
      "patients",
      [
        { key: "Name", label: "Name" },
        { key: "Phone", label: "Phone" },
        { key: "Email", label: "Email" },
        { key: "Age", label: "Age" },
        { key: "Gender", label: "Gender" },
        { key: "Blood Group", label: "Blood Group" },
        { key: "City", label: "City" },
      ]
    )
    toast({ title: "Patients exported", variant: "success" })
  }

  const filteredPatients = patients.filter((p) => {
    if (bloodGroupFilter !== "all" && p.bloodGroup !== bloodGroupFilter)
      return false
    return true
  })

  const columns: ColumnDef<Patient>[] = [
    {
      id: "name",
      header: "Patient",
      cell: (patient) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={patient.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(patient.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{patient.name}</p>
            <p className="text-xs text-muted-foreground">{patient.id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      cell: (patient) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Phone className="h-3 w-3" />
          {patient.phone}
        </div>
      ),
    },
    {
      id: "ageGender",
      header: "Age / Gender",
      cell: (patient) => (
        <div className="flex items-center gap-1 text-sm">
          <span>{calculateAge(patient.dob)} yrs</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground capitalize">{patient.gender}</span>
        </div>
      ),
    },
    {
      id: "bloodGroup",
      header: "Blood Group",
      cell: (patient) => (
        <StatusBadge status={patient.bloodGroup.toLowerCase()} />
      ),
    },
    {
      id: "lastVisit",
      header: "Last Visit",
      cell: (patient) => {
        const lastVisit = patient.visits.length > 0
          ? patient.visits.sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )[0]
          : null
        return (
          <span className="text-muted-foreground">
            {lastVisit ? formatDate(lastVisit.date, "short") : "No visits"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: "",
      className: "w-[70px]",
      sortable: false,
      filterable: false,
      cell: (patient) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/patients/${patient.id}`)
            }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/patients/${patient.id}/edit`)
            }}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteDialog({ open: true, id: patient.id })
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageContainer
        title="Patients"
        description="Manage patient records and medical history"
        status={pageStatus}
        loadingType="table"
        onRetry={fetchPatients}
        emptyIcon={<Users className="h-8 w-8" />}
        emptyTitle="No patients found"
        emptyDescription="Try adjusting your search or filters"
        emptyAction={
          <Button onClick={() => navigate("/patients/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Register Patient
          </Button>
        }
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/patients/analytics")}>
              <Users className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button onClick={() => navigate("/patients/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Patient
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-3">
          <SearchInput
            placeholder="Search by name, phone, or ID..."
            value={search}
            onSearch={setSearch}
            className="w-64"
          />
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              {genders.map((g) => (
                <SelectItem key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={bloodGroupFilter} onValueChange={setBloodGroupFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {bloodGroups.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedRows.length > 0 && (
          <BulkActions
            selectedCount={selectedRows.length}
            onClearSelection={() => setSelectedRows([])}
            actions={[
              {
                label: "Delete Selected",
                icon: <span />,
                variant: "destructive",
                onClick: () => setBulkDeleteDialog(true),
              },
            ]}
          />
        )}

        <DataTable
          columns={columns}
          data={filteredPatients}
          selectable
          onSelectedRowsChange={setSelectedRows}
          getRowId={(p) => p.id}
          onRowClick={(patient) => navigate(`/patients/${patient.id}`)}
          exportable
          exportFilename="patients"
          onExportCSV={handleExport}
          showColumnVisibility
          resizableColumns
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? All associated data will be removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        title="Delete Patients"
        description={`Are you sure you want to delete ${selectedRows.length} patients? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={deleting}
      />
    </>
  )
}
