"use client"

import { useState, useMemo, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { purchaseOrderSchema, type PurchaseOrderForm } from "@/lib/validations"
import { purchaseOrders, vendors, type PurchaseOrder, type PurchaseOrderItem, type POStatus } from "@/mock/data/purchase-orders"
import { formatCurrency, formatDate, generateId, cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import { FormActions } from "@/components/forms/form-actions"
import {
  Plus, MoreHorizontal, Download, CheckCircle2, XCircle, Truck, Eye,
  ShoppingCart, FileText, Building2, Calendar, Loader2,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"

const statusConfig: Record<POStatus, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  received: { label: "Received", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
}

interface CreatePOItem {
  id: string
  name: string
  sku: string
  quantity: number
  unitPrice: number
  total: number
}

const mockItems = [
  { id: "MI001", name: "Glucose GOD-POD Reagent Kit", sku: "RGT-GLU-001", unitPrice: 4500 },
  { id: "MI002", name: "Total Cholesterol CHOD-PAP Reagent", sku: "RGT-CHOL-002", unitPrice: 5200 },
  { id: "MI003", name: "Triglycerides GPO-PAP Reagent", sku: "RGT-TG-003", unitPrice: 4800 },
  { id: "MI004", name: "HDL Cholesterol Direct Reagent", sku: "RGT-HDL-004", unitPrice: 5800 },
  { id: "MI005", name: "ALT (SGPT) Reagent IFCC", sku: "RGT-ALT-005", unitPrice: 3500 },
  { id: "MI006", name: "Creatinine Jaffe Reagent Kit", sku: "RGT-CREAT-006", unitPrice: 3200 },
  { id: "MI007", name: "TSH CLIA Reagent Cartridge", sku: "RGT-TSH-007", unitPrice: 12000 },
  { id: "MI008", name: "Free T4 CLIA Reagent Cartridge", sku: "RGT-FT4-008", unitPrice: 11000 },
  { id: "MI009", name: "HbA1c HPLC Column & Reagent", sku: "RGT-HBA1C-010", unitPrice: 8500 },
  { id: "MI010", name: "Vacutainer SST (Gold Top) 5mL", sku: "CNS-SST-017", unitPrice: 8 },
  { id: "MI011", name: "Vacutainer EDTA (Purple Top) 3mL", sku: "CNS-EDTA-018", unitPrice: 7 },
  { id: "MI012", name: "Latex Examination Gloves (Box of 100)", sku: "CNS-GLOVES-025", unitPrice: 350 },
  { id: "MI013", name: "CRP Immunoturbidimetry Reagent", sku: "RGT-CRP-015", unitPrice: 6000 },
  { id: "MI014", name: "PT/INR Thromboplastin Reagent", sku: "RGT-PT-016", unitPrice: 7500 },
]

export default function PurchaseOrdersPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Inventory", href: "/inventory" }, { label: "Purchase Orders" }]) }, [])
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [orderItems, setOrderItems] = useState<CreatePOItem[]>([])
  const [itemSearch, setItemSearch] = useState("")

  const methods = useForm<PurchaseOrderForm>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: { vendor: "", expectedDelivery: "", notes: "", items: [] },
  })

  const filteredOrders = useMemo(() => {
    let filtered = [...purchaseOrders]
    if (activeTab !== "all") filtered = filtered.filter((po) => po.status === activeTab)
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (po) =>
          po.poNumber.toLowerCase().includes(q) ||
          po.vendor.toLowerCase().includes(q)
      )
    }
    return filtered
  }, [search, activeTab])

  const handleAction = (po: PurchaseOrder, action: "approve" | "receive" | "cancel") => {
    const actionLabels = { approve: "approved", receive: "received", cancel: "cancelled" }
    toast({
      title: `PO ${actionLabels[action].charAt(0).toUpperCase() + actionLabels[action].slice(1)}`,
      description: `${po.poNumber} has been ${actionLabels[action]}.`,
    })
  }

  const addItemToOrder = (item: typeof mockItems[0]) => {
    const existing = orderItems.find((i) => i.id === item.id)
    if (existing) {
      setOrderItems(
        orderItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i
        )
      )
    } else {
      setOrderItems([
        ...orderItems,
        { id: item.id, name: item.name, sku: item.sku, quantity: 1, unitPrice: item.unitPrice, total: item.unitPrice },
      ])
    }
    setItemSearch("")
  }

  const updateItemQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setOrderItems(orderItems.filter((i) => i.id !== id))
    } else {
      setOrderItems(
        orderItems.map((i) => (i.id === id ? { ...i, quantity: qty, total: qty * i.unitPrice } : i))
      )
    }
  }

  const totalOrderAmount = orderItems.reduce((s, i) => s + i.total, 0)

  const submitCreatePO = (data: PurchaseOrderForm) => {
    if (orderItems.length === 0) return
    toast({
      title: "Purchase Order Created",
      description: `PO for ${vendors.find((v) => v.id === data.vendor)?.name} with ${orderItems.length} items`,
    })
    setCreateDialogOpen(false)
    setOrderItems([])
    methods.reset({ vendor: "", expectedDelivery: "", notes: "", items: [] })
  }

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      id: "poNumber", header: "PO #", accessorKey: "poNumber",
      cell: (row) => <span className="font-medium text-primary">{row.poNumber}</span>,
    },
    {
      id: "vendor", header: "Vendor", accessorKey: "vendor",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>{row.vendor}</span>
        </div>
      ),
    },
    {
      id: "itemsCount", header: "Items", cell: (row) => row.items.length,
    },
    {
      id: "totalAmount", header: "Total", accessorKey: "totalAmount",
      cell: (row) => formatCurrency(row.totalAmount),
    },
    {
      id: "status", header: "Status", accessorKey: "status",
      cell: (row) => {
        const cfg = statusConfig[row.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      id: "createdDate", header: "Created", accessorKey: "createdDate",
      cell: (row) => formatDate(row.createdDate),
    },
    {
      id: "expectedDelivery", header: "Delivery", accessorKey: "expectedDelivery",
      cell: (row) => {
        const overdue = new Date(row.expectedDelivery) < new Date() && row.status !== "received" && row.status !== "cancelled"
        return (
          <span className={overdue ? "text-destructive font-medium" : ""}>
            {formatDate(row.expectedDelivery)}
          </span>
        )
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
            <DropdownMenuItem onClick={() => navigate(`/inventory/purchase-orders/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { const link = document.createElement("a"); link.download = `${row.poNumber}.pdf`; link.click(); toast({ title: "Download Started", description: `${row.poNumber}.pdf is being downloaded.`, variant: "success" }) }}>
              <Download className="mr-2 h-4 w-4" /> Download
            </DropdownMenuItem>
            {row.status === "pending" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction(row, "approve")}>
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(row, "cancel")} className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </DropdownMenuItem>
              </>
            )}
            {row.status === "approved" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction(row, "receive")}>
                  <Truck className="mr-2 h-4 w-4" /> Mark Received
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(row, "cancel")} className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const filteredMockItems = mockItems.filter(
    (i) =>
      !orderItems.find((oi) => oi.id === i.id) &&
      (i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        i.sku.toLowerCase().includes(itemSearch.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchase Orders"
        description="Manage procurement and vendor purchase orders"
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create PO
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="received">Received</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              <SearchInput
                placeholder="Search by PO # or vendor..."
                value={search}
                onSearch={setSearch}
                className="w-60"
              />
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredOrders}
            pageSize={10}
            emptyMessage="No purchase orders found matching your criteria."
            exportable
          />
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new purchase order
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(submitCreatePO)}>
              <div className="space-y-4">
                <FormErrorSummary />
                <div className="space-y-2">
                  <Label>Vendor</Label>
                  <Select value={methods.watch("vendor")} onValueChange={(v) => methods.setValue("vendor", v, { shouldDirty: true })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.name} - {v.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Add Items</Label>
                  <Input
                    placeholder="Search items by name or SKU..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                  />
                  {itemSearch && filteredMockItems.length > 0 && (
                    <div className="mt-1 max-h-40 overflow-auto rounded-lg border">
                      {filteredMockItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                          onClick={() => addItemToOrder(item)}
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{item.sku}</span>
                          </div>
                          <span className="text-xs">{formatCurrency(item.unitPrice)} each</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {orderItems.length > 0 && (
                  <div className="rounded-lg border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-3 py-2 text-left font-medium">Item</th>
                          <th className="px-3 py-2 text-right font-medium">Qty</th>
                          <th className="px-3 py-2 text-right font-medium">Unit Price</th>
                          <th className="px-3 py-2 text-right font-medium">Total</th>
                          <th className="px-3 py-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item) => (
                          <tr key={item.id} className="border-b last:border-0">
                            <td className="px-3 py-2">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-muted-foreground">{item.sku}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <Input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                                className="h-8 w-20 text-right"
                              />
                            </td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.total)}</td>
                            <td className="px-3 py-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                type="button"
                                onClick={() => setOrderItems(orderItems.filter((i) => i.id !== item.id))}
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t bg-muted/30">
                          <td colSpan={3} className="px-3 py-2 text-right font-bold">Total Amount</td>
                          <td className="px-3 py-2 text-right font-bold">{formatCurrency(totalOrderAmount)}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}

                <FormInput name="expectedDelivery" label="Expected Delivery Date" type="date" />
                <FormTextarea name="notes" label="Notes" placeholder="Additional notes or instructions..." />
              </div>
              <DialogFooter className="mt-4">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={orderItems.length === 0}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Create Purchase Order
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </div>
  )
}
