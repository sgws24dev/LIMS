import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/shared/status-badge"
import { Plus } from "lucide-react"
import { getTenants } from "@/services/api/tenants"
import { formatDate } from "@/lib/utils"
import type { Tenant } from "@/types"

export default function InstitutionsList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [data, setData] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const tenants = await getTenants()
      setData(tenants)
    } catch {
      setError("Failed to load institutions.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Institutions" }])
    fetchData()
  }, [setBreadcrumbs])

  const columns: ColumnDef<Tenant>[] = [
    { id: "name", header: "Name", accessorKey: "name", sortable: true, filterable: true },
    { id: "code", header: "Code", accessorKey: "code", sortable: true },
    { id: "domain", header: "Domain", accessorKey: "domain" },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
  ]

  return (
    <PageContainer
      title="Institutions"
      description="Manage all institutions in the platform"
      status={error ? "error" : isLoading ? "loading" : data.length === 0 ? "empty" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No institutions found"
      emptyDescription="Get started by creating your first institution."
      emptyAction={
        <Button size="sm" onClick={() => navigate("/institutions/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create Institution
        </Button>
      }
      actions={
        <Button size="sm" onClick={() => navigate("/institutions/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create Institution
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(row) => navigate(`/institutions/${row.id}`)}
        filterPlaceholder="Search institutions..."
      />
    </PageContainer>
  )
}
