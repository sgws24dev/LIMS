"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { stockAdjustmentSchema, type StockAdjustmentForm } from "@/lib/validations"
import { inventory } from "@/mock/data/inventory"
import type { InventoryItem } from "@/types"
import { formatCurrency, formatDate, cn, generateId } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FormInput } from "@/components/forms/form-input"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import { FlaskConical, MoreHorizontal, Plus, History, ArrowRightLeft, PackageOpen, AlertTriangle, Search, Beaker, Syringe, Microscope } from "lucide-react"
import { useAppStore } from "@/store/appStore"

function getQuantityVariant(item: InventoryItem): "success" | "warning" | "destructive" {
  if (item.quantity === 0) return "destructive"
  if (item.quantity <= item.minQuantity) return "warning"
  return "success"
}

const categoryIcon: Record<string, typeof FlaskConical> = {
  reagent: FlaskConical,
  consumable: PackageOpen,
  equipment: Microscope,
}

export default function ReagentsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Inventory", href: "/inventory" }, { label: "Reagents & Consumables" }]) }, [])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  const methods = useForm<StockAdjustmentForm>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: { type: "add", quantity: "", reason: "" },
  })
  const adjustType = methods.watch("type")

  const locations = useMemo(
    () => [...new Set(inventory.map((i) => i.location))].sort(),
    []
  )

  const filteredItems = useMemo(() => {
    let filtered = [...inventory]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
      )
    }
    if (categoryFilter !== "all") filtered = filtered.filter((i) => i.category === categoryFilter)
    if (locationFilter !== "all") filtered = filtered.filter((i) => i.location === locationFilter)
    return filtered
  }, [search, categoryFilter, locationFilter])

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item)
    methods.reset({ type: "add", quantity: "", reason: "" })
    setAdjustDialogOpen(true)
  }

  const submitAdjustment = (data: StockAdjustmentForm) => {
    if (!selectedItem) return
    const qty = Number(data.quantity)
    const newQty = data.type === "add" ? selectedItem.quantity + qty : Math.max(0, selectedItem.quantity - qty)
    toast({
      title: "Stock Adjusted",
      description: `${selectedItem.name} ${data.type === "add" ? "+" : "-"}${qty} (${selectedItem.quantity} → ${newQty})`,
    })
    setAdjustDialogOpen(false)
  }

  const columns: ColumnDef<InventoryItem>[] = [
    {
      id: "name", header: "Name", accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {(() => {
              const Icon = categoryIcon[row.category]
              return <Icon className="h-4 w-4" />
            })()}
          </div>
          <div>
            <p className="font-medium">{row.name}</p>
            <p className="text-xs text-muted-foreground">{row.sku}</p>
          </div>
        </div>
      ),
    },
    {
      id: "category", header: "Category", accessorKey: "category",
      cell: (row) => <span className="capitalize">{row.category}</span>,
    },
    {
      id: "quantity", header: "Qty", accessorKey: "quantity",
      cell: (row) => (
        <Badge variant={getQuantityVariant(row)} className="font-mono">
          {row.quantity}
        </Badge>
      ),
    },
    { id: "unit", header: "Unit", accessorKey: "unit" },
    { id: "minQuantity", header: "Min Qty", accessorKey: "minQuantity" },
    {
      id: "batchNo", header: "Batch #", accessorKey: "batchNo",
      cell: (row) => row.batchNo ?? <span className="text-muted-foreground">--</span>,
    },
    {
      id: "expiryDate", header: "Expiry", accessorKey: "expiryDate",
      cell: (row) => {
        if (!row.expiryDate) return <span className="text-muted-foreground">N/A</span>
        const expired = new Date(row.expiryDate) < new Date()
        return (
          <span className={expired ? "text-destructive" : ""}>
            {formatDate(row.expiryDate)}
          </span>
        )
      },
    },
    { id: "location", header: "Location", accessorKey: "location" },
    {
      id: "status", header: "Status",
      cell: (row) => {
        if (row.quantity === 0) return <Badge variant="destructive">Out of Stock</Badge>
        if (row.quantity <= row.minQuantity) return <Badge variant="warning">Low Stock</Badge>
        if (row.expiryDate && new Date(row.expiryDate) < new Date()) return <Badge variant="destructive">Expired</Badge>
        return <Badge variant="success">In Stock</Badge>
      },
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
            <DropdownMenuItem onClick={() => handleAdjustStock(row)}>
              <Plus className="mr-2 h-4 w-4" /> Adjust Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { navigate("/inventory/reagents"); toast({ title: "Transfer", description: "Stock transfer form would open here", variant: "default" }) }}>
              <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { navigate("/inventory/reagents"); toast({ title: "View History", description: "Stock movement history would open here", variant: "default" }) }}>
              <History className="mr-2 h-4 w-4" /> View History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reagents & Consumables"
        description="Manage laboratory reagents, consumables, and equipment inventory"
        actions={
          <Button onClick={() => { navigate("/inventory/reagents/new"); toast({ title: "Add Item", description: "Opening new reagent form...", variant: "default" }) }}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Items</CardTitle>
            <div className="flex items-center gap-2">
              <SearchInput
                placeholder="Search by name or SKU..."
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
                  <SelectItem value="reagent">Reagent</SelectItem>
                  <SelectItem value="consumable">Consumable</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredItems}
            pageSize={10}
            emptyMessage="No inventory items found matching your criteria."
            exportable
          />
        </CardContent>
      </Card>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedItem?.name} ({selectedItem?.sku})
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitAdjustment)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-sm text-muted-foreground">Current Stock</div>
                  <div className="text-2xl font-bold">
                    {selectedItem?.quantity} {selectedItem?.unit}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Min Qty: {selectedItem?.minQuantity} | Location: {selectedItem?.location}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Adjustment Type</Label>
                  <Controller
                    name="type"
                    control={methods.control}
                    render={({ field }) => (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={field.value === "add" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => field.onChange("add")}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Stock
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "remove" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => field.onChange("remove")}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" /> Remove Stock
                        </Button>
                      </div>
                    )}
                  />
                </div>
                <FormInput name="quantity" label="Quantity" type="number" min="1" placeholder="Enter quantity" />
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Controller
                    name="reason"
                    control={methods.control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="purchase_order">Purchase Order Received</SelectItem>
                          <SelectItem value="daily_usage">Daily Usage</SelectItem>
                          <SelectItem value="qc_testing">QC Testing</SelectItem>
                          <SelectItem value="damage">Damaged / Expired</SelectItem>
                          <SelectItem value="transfer">Transfer from Other Branch</SelectItem>
                          <SelectItem value="return">Return to Vendor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <span className="text-muted-foreground">New quantity will be: </span>
                  <strong>
                    {selectedItem && methods.watch("quantity")
                      ? adjustType === "add"
                        ? selectedItem.quantity + Number(methods.watch("quantity"))
                        : Math.max(0, selectedItem.quantity - Number(methods.watch("quantity")))
                      : selectedItem?.quantity}{" "}
                    {selectedItem?.unit}
                  </strong>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {adjustType === "add" ? "Add Stock" : "Remove Stock"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}
