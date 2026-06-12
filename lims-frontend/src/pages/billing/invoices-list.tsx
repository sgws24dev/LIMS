"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Invoice } from "@/types"
import { invoices } from "@/mock/data/invoices"
import { cn, formatCurrency, formatDate, generateId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import {
  Plus, MoreHorizontal, Download, Banknote, Send, XCircle, Eye, Search,
  Filter, Receipt, Wallet, AlertTriangle, CheckCircle2, Clock,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  unpaid: { label: "Unpaid", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
}

export default function InvoicesListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Billing" }])
  }, [])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentRef, setPaymentRef] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null)

  const filteredInvoices = useMemo(() => {
    let filtered = [...invoices]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.patientName.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") filtered = filtered.filter((inv) => inv.status === statusFilter)
    if (methodFilter !== "all") filtered = filtered.filter((inv) => inv.paymentMethod === methodFilter)
    return filtered
  }, [search, statusFilter, methodFilter])

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0)
    const partial = invoices.filter((i) => i.status === "partial" || i.status === "unpaid").reduce((s, i) => s + i.due, 0)
    const unpaid = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + i.due, 0)
    return { paid, outstanding: partial, unpaid }
  }, [])

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setPaymentAmount(String(invoice.due))
    setPaymentMethod("cash")
    setPaymentDate(new Date().toISOString().split("T")[0])
    setPaymentRef(`PAY-${generateId().slice(0, 8).toUpperCase()}`)
    setPaymentDialogOpen(true)
    setExpandedRow(null)
  }

  const submitPayment = () => {
    if (!selectedInvoice) return
    toast({
      title: "Payment Recorded",
      description: `₹${Number(paymentAmount).toLocaleString("en-IN")} received for ${selectedInvoice.invoiceNumber}`,
    })
    setPaymentDialogOpen(false)
  }

  const columns: ColumnDef<Invoice>[] = [
    {
      id: "invoiceNumber", header: "Invoice #", accessorKey: "invoiceNumber",
      cell: (row) => (
        <span className="font-medium text-primary">{row.invoiceNumber}</span>
      ),
    },
    { id: "patientName", header: "Patient Name", accessorKey: "patientName" },
    {
      id: "date", header: "Date", accessorKey: "createdAt",
      cell: (row) => formatDate(row.createdAt),
    },
    { id: "items", header: "Items", cell: (row) => row.items.length },
    {
      id: "total", header: "Total", accessorKey: "total",
      cell: (row) => formatCurrency(row.total),
    },
    {
      id: "paid", header: "Paid", accessorKey: "paid",
      cell: (row) => formatCurrency(row.paid),
    },
    {
      id: "due", header: "Due", accessorKey: "due",
      cell: (row) => (
        <span className={row.due > 0 ? "text-destructive font-medium" : ""}>
          {formatCurrency(row.due)}
        </span>
      ),
    },
    {
      id: "status", header: "Status", accessorKey: "status",
      cell: (row) => {
        const cfg = statusConfig[row.status]
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>
      },
    },
    {
      id: "paymentMethod", header: "Payment", accessorKey: "paymentMethod",
      cell: (row) => row.paymentMethod ? (
        <span className="capitalize">{row.paymentMethod.replace("_", " ")}</span>
      ) : (
        <span className="text-muted-foreground">--</span>
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
            <DropdownMenuItem onClick={() => navigate(`/billing/invoices/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const link = document.createElement("a")
              link.download = `${row.invoiceNumber}.pdf`
              link.click()
              toast({ title: "Download Started", description: `${row.invoiceNumber}.pdf is being downloaded.`, variant: "success" })
            }}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </DropdownMenuItem>
            {row.status !== "paid" && row.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => handleRecordPayment(row)}>
                <Banknote className="mr-2 h-4 w-4" /> Record Payment
              </DropdownMenuItem>
            )}
            {row.status !== "paid" && row.status !== "cancelled" && (
              <DropdownMenuItem onClick={() => {
                toast({
                  title: "Reminder Sent",
                  description: `Payment reminder sent to ${row.patientName}`,
                  variant: "success",
                })
              }}>
                <Send className="mr-2 h-4 w-4" /> Send Reminder
              </DropdownMenuItem>
            )}
            {row.status !== "cancelled" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={() => { setInvoiceToCancel(row); setShowCancelDialog(true) }}>
                  <XCircle className="mr-2 h-4 w-4" /> Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Manage all laboratory invoices and payments"
        actions={
          <Button onClick={() => navigate("/billing/invoices/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Receipt className="h-5 w-5" />}
          label="Total Collected"
          value={formatCurrency(totals.paid)}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Outstanding"
          value={formatCurrency(totals.outstanding)}
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Overdue"
          value={formatCurrency(totals.unpaid)}
          trend={{ value: 3, positive: false }}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <SearchInput
                placeholder="Search by invoice # or patient..."
                value={search}
                onSearch={setSearch}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredInvoices}
            pageSize={10}
            onRowClick={(row) =>
              setExpandedRow(expandedRow === row.id ? null : row.id)
            }
            emptyMessage="No invoices found matching your criteria."
            exportable
          />
        </CardContent>
      </Card>

      {expandedRow && (
        <Card>
          <CardHeader>
            <CardTitle>
              Invoice Details -{" "}
              {invoices.find((i) => i.id === expandedRow)?.invoiceNumber}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const inv = invoices.find((i) => i.id === expandedRow)
              if (!inv) return null
              return (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-muted-foreground">Patient</Label>
                      <p className="font-medium">{inv.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date</Label>
                      <p className="font-medium">{formatDate(inv.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Due Date</Label>
                      <p className="font-medium">{formatDate(inv.dueDate)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="mb-2 block text-muted-foreground">Items</Label>
                    <div className="rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Item</th>
                            <th className="px-4 py-2 text-right font-medium">Qty</th>
                            <th className="px-4 py-2 text-right font-medium">Rate</th>
                            <th className="px-4 py-2 text-right font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((item) => (
                            <tr key={item.id} className="border-b last:border-0">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 text-right">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t bg-muted/30">
                            <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(inv.subtotal)}</td>
                          </tr>
                          {inv.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right font-medium">Discount</td>
                              <td className="px-4 py-2 text-right text-destructive">-{formatCurrency(inv.discount)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right font-medium">Tax</td>
                            <td className="px-4 py-2 text-right">{formatCurrency(inv.tax)}</td>
                          </tr>
                          <tr className="border-t">
                            <td colSpan={3} className="px-4 py-2 text-right font-bold">Total</td>
                            <td className="px-4 py-2 text-right font-bold">{formatCurrency(inv.total)}</td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-right font-medium text-emerald-600">Paid</td>
                            <td className="px-4 py-2 text-right font-medium text-emerald-600">{formatCurrency(inv.paid)}</td>
                          </tr>
                          {inv.due > 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-2 text-right font-medium text-destructive">Due</td>
                              <td className="px-4 py-2 text-right font-medium text-destructive">{formatCurrency(inv.due)}</td>
                            </tr>
                          )}
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  {inv.status !== "paid" && inv.status !== "cancelled" && (
                    <div className="flex gap-2">
                      <Button onClick={() => handleRecordPayment(inv)}>
                        <Banknote className="mr-2 h-4 w-4" /> Record Payment
                      </Button>
                      <Button variant="outline" onClick={() => toast({ title: "Reminder Sent", description: `Payment reminder sent to ${inv.patientName}`, variant: "success" })}>
                        <Send className="mr-2 h-4 w-4" /> Send Reminder
                      </Button>
                    </div>
                  )}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record payment for {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-3">
              <div className="text-sm text-muted-foreground">Invoice Total</div>
              <div className="text-2xl font-bold">{formatCurrency(selectedInvoice?.total ?? 0)}</div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Already Paid:</span>
                <span className="font-medium text-emerald-600">{formatCurrency(selectedInvoice?.paid ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Due Amount:</span>
                <span className="font-medium text-destructive">{formatCurrency(selectedInvoice?.due ?? 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Amount (₹)</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                max={selectedInvoice?.due}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Reference #</Label>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitPayment}>
              <Banknote className="mr-2 h-4 w-4" /> Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Invoice"
        description="Are you sure you want to cancel this invoice? This cannot be undone."
        confirmLabel="Cancel Invoice"
        variant="destructive"
        onConfirm={() => {
          if (invoiceToCancel) {
            toast({ title: "Invoice Cancelled", description: `Invoice ${invoiceToCancel.invoiceNumber} has been cancelled.`, variant: "warning" })
          }
          setShowCancelDialog(false)
          setInvoiceToCancel(null)
        }}
      />
    </div>
  )
}
