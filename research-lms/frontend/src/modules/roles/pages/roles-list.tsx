import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { ConfirmDialog } from "@/shared/shared/confirm-dialog"
import { getRoles, deleteRole } from "@/services/api/roles"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Role } from "@/types"

export default function RolesList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Roles & Permissions" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    fetchRoles()
  }, [])

  async function fetchRoles() {
    setLoading(true)
    setError(null)
    try {
      const data = await getRoles()
      setRoles(data)
    } catch {
      setError("Failed to load roles")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteRole(deleteId)
      setRoles((prev) => prev.filter((r) => r.id !== deleteId))
    } catch {
      // error handled silently
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const columns: ColumnDef<Role>[] = [
    { id: "name", header: "Name", accessorKey: "name" },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      className: "max-w-xs truncate",
    },
    {
      id: "isSystem",
      header: "Type",
      cell: (row) =>
        row.isSystem ? (
          <Badge variant="info">System</Badge>
        ) : (
          <Badge variant="success">Custom</Badge>
        ),
    },
    { id: "userCount", header: "Users", accessorKey: "userCount" },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/roles/${row.id}/edit`)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={row.isSystem}
            onClick={(e) => {
              e.stopPropagation()
              setDeleteId(row.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <PageContainer
      title="Roles & Permissions"
      description="Manage roles and their permissions"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchRoles}
      actions={
        <Button size="sm" onClick={() => navigate("/roles/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create Role
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={roles}
        onRowClick={(row) => navigate(`/roles/${row.id}`)}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null)
        }}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </PageContainer>
  )
}
