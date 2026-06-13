import { useEffect, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { DataTable, type ColumnDef } from "@/shared/ui/data-table"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/shared/status-badge"
import { ConfirmDialog } from "@/shared/shared/confirm-dialog"
import { getUsers, deleteUser } from "@/services/api/users"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/types"
import { Plus, Pencil, Trash2 } from "lucide-react"

export default function UsersList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Users" }])
  }, [setBreadcrumbs])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers({ page: 1, pageSize: 100 })
      setUsers(result.items)
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteUser(deleteId)
      toast({ title: "User deleted", variant: "success" })
      setDeleteId(null)
      fetchUsers()
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" })
      setDeleting(false)
    }
  }

  const columns: ColumnDef<User>[] = [
    { id: "email", header: "Email", accessorKey: "email" },
    {
      id: "fullName",
      header: "Name",
      cell: (row) => `${row.firstName} ${row.lastName}`,
    },
    {
      id: "role",
      header: "Roles",
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.role.map((r) => (
            <StatusBadge key={r} status={r} />
          ))}
        </div>
      ),
    },
    {
      id: "isActive",
      header: "Status",
      cell: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "",
      className: "w-[80px]",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/users/${row.id}/edit`)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
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
      title="Users"
      description="Manage all users in the platform"
      actions={
        <Button size="sm" onClick={() => navigate("/users/create")}>
          <Plus className="mr-1 h-4 w-4" /> Create User
        </Button>
      }
    >
      <DataTable<User>
        columns={columns}
        data={users}
        isLoading={loading}
        filterPlaceholder="Search users..."
        pageSize={10}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </PageContainer>
  )
}
