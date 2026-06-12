"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, UserCog } from "lucide-react"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import {
  DataTable,
  type ColumnDef,
} from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
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
import { StatusBadge } from "@/components/shared/status-badge"
import { BulkActions } from "@/components/shared/bulk-actions"
import { exportToCSV } from "@/components/shared/export-button"
import { formatDate } from "@/lib/utils"
import { getUsers, deleteUser, bulkDeleteUsers } from "@/mock/services"
import { users as mockUsers } from "@/mock/data/users"
import { branches as mockBranches } from "@/mock/data/branches"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  lab_admin: "Lab Admin",
  branch_manager: "Branch Manager",
  technician: "Technician",
  doctor: "Doctor",
  receptionist: "Receptionist",
  phlebotomist: "Phlebotomist",
  billing: "Billing",
  patient: "Patient",
  corporate: "Corporate",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function UsersList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [users, setUsers] = useState<User[]>([])
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRows, setSelectedRows] = useState<User[]>([])
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const pageSize = 10

  useEffect(() => {
    setBreadcrumbs([{ label: "User Management" }])
  }, [])

  const fetchUsers = useCallback(async () => {
    setPageStatus("loading")
    try {
      const params: Record<string, unknown> = { page, limit: pageSize }
      if (search) params.search = search
      if (roleFilter !== "all") params.role = roleFilter
      if (branchFilter !== "all") params.branchId = branchFilter
      if (statusFilter === "active") params.isActive = true
      else if (statusFilter === "inactive") params.isActive = false
      const result = await getUsers(params as any)
      setUsers(result.data)
      setTotalPages(result.totalPages)
      setPageStatus(result.data.length === 0 ? "empty" : "success")
    } catch {
      setPageStatus("error")
    }
  }, [page, search, roleFilter, statusFilter, branchFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setDeleting(true)
    try {
      await deleteUser(deleteDialog.id)
      toast({ title: "User deleted", variant: "success" })
      setDeleteDialog({ open: false })
      fetchUsers()
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      await bulkDeleteUsers(selectedRows.map((r) => r.id))
      toast({ title: `${selectedRows.length} users deleted`, variant: "success" })
      setBulkDeleteDialog(false)
      setSelectedRows([])
      fetchUsers()
    } catch {
      toast({ title: "Failed to delete users", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const handleExport = () => {
    exportToCSV(
      users.map((u) => ({
        Name: u.name,
        Email: u.email,
        Role: roleLabels[u.role] || u.role,
        Phone: u.phone,
        Status: u.isActive ? "Active" : "Inactive",
        "Last Login": u.lastLogin ? formatDate(u.lastLogin, "datetime") : "Never",
      })),
      "users",
      [
        { key: "Name", label: "Name" },
        { key: "Email", label: "Email" },
        { key: "Role", label: "Role" },
        { key: "Phone", label: "Phone" },
        { key: "Status", label: "Status" },
        { key: "Last Login", label: "Last Login" },
      ]
    )
    toast({ title: "Users exported", variant: "success" })
  }

  const branches = [...new Set(mockBranches.map((b) => ({ id: b.id, name: b.name })))]
  const uniqueRoles = [...new Set(mockUsers.map((u) => u.role))]

  const columns: ColumnDef<User>[] = [
    {
      id: "name",
      header: "Name",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.id}</p>
          </div>
        </div>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => (
        <Badge variant={user.role === "super_admin" ? "destructive" : user.role === "lab_admin" ? "default" : "secondary"}>
          {roleLabels[user.role] || user.role}
        </Badge>
      ),
    },
    {
      id: "branch",
      header: "Branch",
      cell: (user) => (
        <span className="text-muted-foreground">
          {user.branchId
            ? mockBranches.find((b) => b.id === user.branchId)?.name || "-"
            : "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (user) => <StatusBadge status={user.isActive ? "active" : "inactive"} />,
    },
    {
      id: "lastLogin",
      header: "Last Login",
      cell: (user) => (
        <span className="text-muted-foreground">
          {user.lastLogin ? formatDate(user.lastLogin, "datetime") : "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      className: "w-[70px]",
      sortable: false,
      filterable: false,
      cell: (user) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/users/${user.id}`)
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
              navigate(`/users/${user.id}/edit`)
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
              setDeleteDialog({ open: true, id: user.id })
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
        title="Users"
        description="Manage system users and their roles"
        status={pageStatus}
        loadingType="table"
        onRetry={fetchUsers}
        emptyIcon={<UserCog className="h-8 w-8" />}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your search or filters"
        emptyAction={
          <Button onClick={() => navigate("/users/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        }
        actions={
          <Button onClick={() => navigate("/users/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        }
      >
        <div className="flex flex-wrap gap-3">
          <SearchInput
            placeholder="Search users..."
            value={search}
            onSearch={setSearch}
            className="w-60"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {uniqueRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {roleLabels[role] || role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
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
          data={users}
          selectable
          onSelectedRowsChange={setSelectedRows}
          getRowId={(u) => u.id}
          onRowClick={(user) => navigate(`/users/${user.id}`)}
          exportable
          exportFilename="users"
          onExportCSV={handleExport}
          showColumnVisibility
          resizableColumns
        />
      </PageContainer>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteDialog}
        onOpenChange={setBulkDeleteDialog}
        title="Delete Users"
        description={`Are you sure you want to delete ${selectedRows.length} users? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={deleting}
      />
    </>
  )
}
