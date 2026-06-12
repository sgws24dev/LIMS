"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Eye, Building2 } from "lucide-react"
import type { Doctor } from "@/types"
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
import { Card, CardContent } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import { StatCard } from "@/components/ui/stat-card"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { BulkActions } from "@/components/shared/bulk-actions"
import { StatusBadge } from "@/components/shared/status-badge"
import { exportToCSV } from "@/components/shared/export-button"
import { formatCurrency } from "@/lib/utils"
import { getDoctors, deleteDoctor, bulkDeleteDoctors } from "@/mock/services"
import { doctors as mockDoctors } from "@/mock/data/doctors"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase()
}

const specializations = [...new Set(mockDoctors.map((d) => d.specialization))]
const cities = [...new Set(mockDoctors.map((d) => d.city))]

export default function DoctorsList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")
  const [search, setSearch] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRows, setSelectedRows] = useState<Doctor[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Doctors" }])
  }, [])

  const fetchDoctors = useCallback(async () => {
    setPageStatus("loading")
    try {
      const params: Record<string, unknown> = { page: 1, limit: 100 }
      if (search) params.search = search
      if (specializationFilter !== "all") params.specialization = specializationFilter
      const result = await getDoctors(params as any)
      setDoctors(result.data)
      setPageStatus(result.data.length === 0 ? "empty" : "success")
    } catch {
      setPageStatus("error")
    }
  }, [search, specializationFilter])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const stats = useMemo(() => ({
    total: mockDoctors.length,
    active: mockDoctors.filter((d) => d.isActive).length,
    totalReferrals: mockDoctors.reduce((sum, d) => sum + d.patientsReferred, 0),
    totalRevenue: mockDoctors.reduce((sum, d) => sum + d.totalRevenue, 0),
  }), [])

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doc) => {
      const matchesCity = cityFilter === "all" || doc.city === cityFilter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && doc.isActive) ||
        (statusFilter === "inactive" && !doc.isActive)
      return matchesCity && matchesStatus
    })
  }, [doctors, cityFilter, statusFilter])

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setDeleting(true)
    try {
      await deleteDoctor(deleteDialog.id)
      toast({ title: "Doctor deleted", variant: "success" })
      setDeleteDialog({ open: false })
      fetchDoctors()
    } catch {
      toast({ title: "Failed to delete doctor", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      await bulkDeleteDoctors(selectedRows.map((r) => r.id))
      toast({ title: `${selectedRows.length} doctors deleted`, variant: "success" })
      setBulkDeleteDialog(false)
      setSelectedRows([])
      fetchDoctors()
    } catch {
      toast({ title: "Failed to delete doctors", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    exportToCSV(
      filteredDoctors.map((d) => ({
        Name: d.name,
        Specialization: d.specialization,
        Hospital: d.hospital,
        City: d.city,
        "Patients Referred": d.patientsReferred,
        Commission: `${d.commission}%`,
        Revenue: formatCurrency(d.totalRevenue),
        Status: d.isActive ? "Active" : "Inactive",
      })),
      "doctors",
      [
        { key: "Name", label: "Name" },
        { key: "Specialization", label: "Specialization" },
        { key: "Hospital", label: "Hospital" },
        { key: "City", label: "City" },
        { key: "Patients Referred", label: "Patients Referred" },
        { key: "Commission", label: "Commission" },
        { key: "Revenue", label: "Revenue" },
        { key: "Status", label: "Status" },
      ]
    )
    toast({ title: "Doctors exported", variant: "success" })
  }

  const columns: ColumnDef<Doctor>[] = [
    {
      id: "name",
      header: "Name",
      cell: (doc) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={doc.avatar} alt={doc.name} />
            <AvatarFallback className="text-xs">{getInitials(doc.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{doc.name}</p>
            <p className="text-xs text-muted-foreground">{doc.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "specialization",
      header: "Specialization",
      accessorKey: "specialization",
    },
    {
      id: "hospital",
      header: "Hospital",
      accessorKey: "hospital",
    },
    {
      id: "city",
      header: "City",
      accessorKey: "city",
    },
    {
      id: "patientsReferred",
      header: "Referred",
      className: "text-right",
      cell: (doc) => <span className="font-medium">{doc.patientsReferred}</span>,
    },
    {
      id: "commission",
      header: "Commission",
      className: "text-right",
      cell: (doc) => <span>{doc.commission}%</span>,
    },
    {
      id: "revenue",
      header: "Revenue",
      className: "text-right",
      cell: (doc) => <span className="font-medium">{formatCurrency(doc.totalRevenue)}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: (doc) => <StatusBadge status={doc.isActive ? "active" : "inactive"} />,
    },
    {
      id: "actions",
      header: "",
      className: "w-[70px]",
      sortable: false,
      filterable: false,
      cell: (doc) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/doctors/${doc.id}`)
            }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteDialog({ open: true, id: doc.id })
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
        title="Doctor Management"
        description="Manage referring doctors and track their performance"
        status={pageStatus}
        loadingType="table"
        onRetry={fetchDoctors}
        emptyIcon={<Building2 className="h-8 w-8" />}
        emptyTitle="No doctors found"
        emptyDescription="Try adjusting your search or filter criteria"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/doctors/referral-tracking")}>
              <Eye className="mr-2 h-4 w-4" />
              Referral Tracking
            </Button>
            <Button onClick={() => navigate("/doctors/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Doctors" value={stats.total} />
          <StatCard label="Active Doctors" value={stats.active} />
          <StatCard label="Total Referrals" value={stats.totalReferrals.toLocaleString()} />
          <StatCard label="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <SearchInput
                placeholder="Search by name, specialization, or hospital..."
                value={search}
                onSearch={setSearch}
                className="w-72"
              />
              <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
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
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
              data={filteredDoctors}
              selectable
              onSelectedRowsChange={setSelectedRows}
              getRowId={(d) => d.id}
              onRowClick={(doc) => navigate(`/doctors/${doc.id}`)}
              exportable
              exportFilename="doctors"
              onExportCSV={handleExport}
              showColumnVisibility
              resizableColumns
            />
          </CardContent>
        </Card>
      </PageContainer>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete Doctor"
        description="Are you sure you want to delete this doctor? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        title="Delete Doctors"
        description={`Are you sure you want to delete ${selectedRows.length} doctors?`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={deleting}
      />
    </>
  )
}
