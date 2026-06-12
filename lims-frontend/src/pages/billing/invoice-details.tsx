"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Download,
  Banknote,
  XCircle,
  Receipt,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  User,
  Hash,
  CreditCard,
  Landmark,
} from "lucide-react"
import type { Invoice } from "@/types"
import { invoices } from "@/mock/data/invoices"
import { payments } from "@/mock/data/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" | "outline" }> = {
  paid: { label: "Paid", variant: "success" },
  partial: { label: "Partial", variant: "warning" },
  unpaid: { label: "Unpaid", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
}

const methodIcons: Record<string, typeof CreditCard> = {
  cash: Banknote,
  card: CreditCard,
  upi: Landmark,
  cheque: Landmark,
  insurance: Landmark,
  bank_transfer: Landmark,
}

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const invoicePayments = useMemo(
    () => payments.filter((p) => p.invoiceId === id),
    [id]
  )

  useEffect(() => {
    if (!id) return
    const found = invoices.find((inv) => inv.id === id)
    if (found) {
      setInvoice(found)
      setBreadcrumbs([
        { label: "Billing", href: "/billing" },
        { label: `Invoice #${found.invoiceNumber}` },
      ])
    }
    setLoading(false)
  }, [id, setBreadcrumbs])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice Not Found"
          description="The invoice you are looking for does not exist."
          actions={
            <Button variant="outline" onClick={() => navigate("/billing")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          }
        />
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground/40" />
            <p className="text-lg font-medium">Invoice not found</p>
            <p className="text-sm text-muted-foreground">
              No invoice matches ID &quot;{id}&quot;.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusCfg = statusConfig[invoice.status]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice #${invoice.invoiceNumber}`}
        description={invoice.patientName}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/billing")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const a = document.createElement("a")
                a.href = `/api/invoices/${invoice.id}/pdf`
                a.download = `invoice-${invoice.invoiceNumber}.pdf`
                a.click()
                toast({
                  title: "Download Started",
                  description: `Invoice ${invoice.invoiceNumber}.pdf`,
                  variant: "success",
                })
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            {invoice.status !== "paid" && invoice.status !== "cancelled" && (
              <Button
                onClick={() => {
                  navigate("/billing/invoices")
                  toast({
                    title: "Record Payment",
                    description: "Payment recording...",
                    variant: "success",
                  })
                }}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}
            {invoice.status !== "cancelled" && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Invoice Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Invoice #</span>
              <span className="font-medium">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Issued Date</span>
              <span className="font-medium">{formatDate(invoice.createdAt, "long")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className="font-medium">{formatDate(invoice.dueDate, "long")}</span>
            </div>
            {invoice.paymentMethod && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{invoice.paymentMethod.replace(/_/g, " ")}</span>
              </div>
            )}
            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Notes</span>
                  <p className="mt-1 text-sm">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-muted-foreground" />
              Patient Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Patient Name</span>
              <span className="font-medium">{invoice.patientName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Patient ID</span>
              <span className="font-medium">{invoice.patientId}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Line Items
          </CardTitle>
          <CardDescription>
            {invoice.items.length} item{invoice.items.length !== 1 ? "s" : ""} on this invoice
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2.5 text-left font-medium">#</th>
                  <th className="px-4 py-2.5 text-left font-medium">Item</th>
                  <th className="px-4 py-2.5 text-right font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-right font-medium">Rate</th>
                  <th className="px-4 py-2.5 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-2.5 text-muted-foreground">{index + 1}</td>
                    <td className="px-4 py-2.5 font-medium">{item.name}</td>
                    <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-2.5 text-right">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-muted-foreground" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Paid</span>
              <span className="font-medium text-emerald-600">{formatCurrency(invoice.paid)}</span>
            </div>
            {invoice.due > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Due Amount</span>
                <span className="font-medium text-destructive">{formatCurrency(invoice.due)}</span>
              </div>
            )}
            {invoice.paymentDate && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Payment Date</span>
                <span>{formatDate(invoice.paymentDate, "long")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicePayments.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <Receipt className="mb-2 h-8 w-8" />
                <p className="text-sm">No payment records found</p>
              </div>
            ) : (
              <div className="divide-y">
                {invoicePayments.map((payment) => {
                  const MethodIcon = methodIcons[payment.method] || CreditCard
                  return (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <MethodIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {payment.method.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.date, "datetime")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Ref: {payment.reference}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </p>
                        <Badge
                          variant={
                            payment.status === "completed"
                              ? "success"
                              : payment.status === "pending"
                                ? "warning"
                                : payment.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                          }
                          className="text-xs capitalize"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Invoice"
        description={`Are you sure you want to cancel invoice ${invoice.invoiceNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Invoice"
        variant="destructive"
        onConfirm={() => {
          toast({
            title: "Invoice Cancelled",
            description: `Invoice ${invoice.invoiceNumber} has been cancelled.`,
            variant: "warning",
          })
          setShowCancelDialog(false)
        }}
      />
    </div>
  )
}
