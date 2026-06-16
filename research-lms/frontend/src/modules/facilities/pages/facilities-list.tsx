import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/shared/status-badge"
import { ConfirmDialog } from "@/shared/shared/confirm-dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { getFacilities, deleteFacility, type Facility } from "@/services/api/facilities"
import { formatDate } from "@/lib/utils"

export default function FacilitiesList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [data, setData] = useState<Facility[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getFacilities({ page: 1, pageSize: 100 })
      setData(result.items)
    } catch {
      setError("Failed to load facilities.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Facilities" }])
    fetchData()
  }, [setBreadcrumbs])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteFacility(deleteId)
      setData((prev) => prev.filter((f) => f.id !== deleteId))
    } catch {
      // error handled silently
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Facility>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true, filterable: true },
    { id: "type", header: "Type", accessorKey: "type", sortable: true },
    { id: "location", header: "Location", accessorKey: "location" },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      id: "createdAt",
      header: "Created",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      id: "actions",
      header: "",
      className: "w-[80px]",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="icon-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/facilities/${row.id}/edit`) }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="icon-sm"
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Facilities"
      description="Manage all research facilities"
      status={error ? "error" : isLoading ? "loading" : data.length === 0 ? "empty" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No facilities found"
      emptyDescription="Get started by creating your first facility."
      emptyAction={
        <Button size="sm" onClick={() => navigate("/facilities/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create Facility
        </Button>
      }
      actions={
        <Button size="sm" onClick={() => navigate("/facilities/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create Facility
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/facilities/${row.id}`)}
        filterPlaceholder="Search facilities..."
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete Facility"
        description="Are you sure you want to delete this facility? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </PageContainer>
  )
}
