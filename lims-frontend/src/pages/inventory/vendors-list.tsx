"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus, Eye, Edit, Trash2, Building2, Star, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { getVendors, createVendor, updateVendor, deleteVendor } from "@/mock/services"
import type { Vendor } from "@/mock/data/vendors"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const categories = ["Reagent", "Consumable", "Equipment", "Service"] as const

export default function VendorsList() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    category: "Reagent" as Vendor["category"],
    paymentTerms: "",
  })

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id?: string }>({ open: false })
  const [deleting, setDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Inventory", href: "/inventory" }, { label: "Vendors" }])
  }, [])

  const fetchVendors = useCallback(async () => {
    setPageStatus("loading")
    try {
      const result = await getVendors()
      setVendors(result)
      setPageStatus(result.length === 0 ? "empty" : "success")
    } catch {
      setPageStatus("error")
    }
  }, [])

  useEffect(() => {
    fetchVendors()
  }, [fetchVendors])

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        !search ||
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        v.email.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || v.category === categoryFilter
      const matchesStatus = statusFilter === "all" || v.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [vendors, search, categoryFilter, statusFilter])

  const openAddDialog = () => {
    setEditingVendor(null)
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "", category: "Reagent", paymentTerms: "" })
    setDialogOpen(true)
  }

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      category: vendor.category,
      paymentTerms: vendor.paymentTerms,
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData)
        toast({ title: "Vendor updated", variant: "success" })
      } else {
        await createVendor({ ...formData, status: "active" })
        toast({ title: "Vendor created", variant: "success" })
      }
      setDialogOpen(false)
      fetchVendors()
    } catch {
      toast({ title: "Failed to save vendor", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.id) return
    setDeleting(true)
    try {
      await deleteVendor(deleteDialog.id)
      toast({ title: "Vendor deleted", variant: "success" })
      setDeleteDialog({ open: false })
      fetchVendors()
    } catch {
      toast({ title: "Failed to delete vendor", variant: "destructive" })
    } finally {
      setDeleting(false)
    }
  }

  const columns: ColumnDef<Vendor>[] = [
    {
      id: "name", header: "Name", accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
          </div>
        </div>
      ),
    },
    {
      id: "contactPerson", header: "Contact Person", accessorKey: "contactPerson",
    },
    { id: "phone", header: "Phone", accessorKey: "phone" },
    {
      id: "email", header: "Email", accessorKey: "email",
      cell: (row) => (
        <span className="text-muted-foreground">{row.email}</span>
      ),
    },
    {
      id: "category", header: "Category", accessorKey: "category",
      cell: (row) => <Badge variant="outline">{row.category}</Badge>,
    },
    {
      id: "status", header: "Status", accessorKey: "status",
      cell: (row) => (
        <Badge variant={row.status === "active" ? "success" : "secondary"}>
          {row.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "rating", header: "Rating", accessorKey: "rating",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>{row.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      id: "lastOrder", header: "Last Order", accessorKey: "lastOrderDate",
      cell: (row) =>
        row.lastOrderDate ? (
          <span>{formatDate(row.lastOrderDate)}</span>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        ),
    },
    {
      id: "actions", header: "", className: "w-[60px]",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast({ title: "View Vendor", description: `Viewing ${row.name}`, variant: "default" })}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openEditDialog(row)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteDialog({ open: true, id: row.id })}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <PageContainer
        title="Vendors"
        description="Manage laboratory vendors and suppliers"
        status={pageStatus}
        loadingType="table"
        onRetry={fetchVendors}
        emptyIcon={<Building2 className="h-8 w-8" />}
        emptyTitle="No vendors found"
        emptyDescription="Add your first vendor to get started"
        emptyAction={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        }
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        }
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>All Vendors</CardTitle>
              <div className="flex items-center gap-2">
                <SearchInput
                  placeholder="Search by name, contact, or email..."
                  value={search}
                  onSearch={setSearch}
                  className="w-56"
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredVendors}
              pageSize={10}
              emptyMessage="No vendors found matching your criteria."
              exportable
            />
          </CardContent>
        </Card>
      </PageContainer>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            <DialogDescription>
              {editingVendor ? "Update vendor information below." : "Fill in the details to add a new vendor."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Vendor Name</Label>
              <Input
                placeholder="Enter vendor name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input
                  placeholder="Full name"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData((p) => ({ ...p, contactPerson: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData((p) => ({ ...p, category: v as Vendor["category"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                placeholder="City, State"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Terms</Label>
              <Select
                value={formData.paymentTerms}
                onValueChange={(v) => setFormData((p) => ({ ...p, paymentTerms: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !formData.name || !formData.contactPerson}>
              {submitting ? "Saving..." : editingVendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open })}
        title="Delete Vendor"
        description="Are you sure you want to delete this vendor? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleting}
      />
    </>
  )
}
