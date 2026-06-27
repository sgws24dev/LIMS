import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Send, Ban, DollarSign } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { PageContainer } from '@/shared/shared/page-container'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { InvoiceStatusBadge } from '@/modules/billing/components/invoice-status-badge'
import { getInvoiceById, sendInvoice, voidInvoice, recordPayment, getInvoicePdf, type InvoiceDto } from '@/services/api/billing'

export default function InvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await getInvoiceById(id)
      setInvoice(data)
    } catch {
      setError('Invoice not found')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchInvoice() }, [fetchInvoice])

  const handleSend = async () => {
    if (!id) return
    try {
      await sendInvoice(id)
      fetchInvoice()
    } catch { setError('Failed to send invoice') }
  }

  const handleVoid = async () => {
    if (!id) return
    const reason = prompt('Void reason:')
    if (!reason) return
    try {
      await voidInvoice(id, reason)
      fetchInvoice()
    } catch { setError('Failed to void invoice') }
  }

  const handleRecordPayment = async () => {
    if (!id || !invoice) return
    const amount = prompt('Payment amount:', invoice.balanceDue.toString())
    if (!amount || isNaN(Number(amount))) return
    try {
      await recordPayment(id, Number(amount))
      fetchInvoice()
    } catch { setError('Failed to record payment') }
  }

  const handleDownloadPdf = async () => {
    if (!id) return
    try {
      const blob = await getInvoicePdf(id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch { setError('Failed to download PDF') }
  }

  if (loading || !invoice) {
    return <PageContainer title="Invoice" status="loading" />
  }

  const canSend = invoice.status === 'Approved'
  const canVoid = !['Voided', 'Paid', 'CreditNote'].includes(invoice.status)
  const canPay = !['Paid', 'Voided', 'CreditNote'].includes(invoice.status) && invoice.balanceDue > 0

  return (
    <PageContainer title={`Invoice ${invoice.invoiceNumber}`} status={error ? 'error' : 'success'} onRetry={fetchInvoice}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/billing/invoices')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-2xl font-semibold font-mono">{invoice.invoiceNumber}</h1>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
          <div className="flex gap-2">
            {canSend && <Button onClick={handleSend}><Send className="h-4 w-4 mr-2" />Send</Button>}
            {canPay && <Button variant="outline" onClick={handleRecordPayment}><DollarSign className="h-4 w-4 mr-2" />Record Payment</Button>}
            <Button variant="outline" onClick={handleDownloadPdf}><Download className="h-4 w-4 mr-2" />PDF</Button>
            {canVoid && <Button variant="destructive" onClick={handleVoid}><Ban className="h-4 w-4 mr-2" />Void</Button>}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
            <p className="font-medium">{invoice.billToName}</p>
            <p className="text-sm">{invoice.billToAddress}</p>
            <p className="text-sm">{invoice.billToEmail}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Invoice Details</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Invoice Date:</span><span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Due Date:</span><span>{new Date(invoice.dueDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span>Currency:</span><span>{invoice.currency}</span></div>
              <div className="flex justify-between"><span>ERP Sync:</span><Badge variant="outline">{invoice.erpSyncStatus}</Badge></div>
            </div>
          </Card>
        </div>

        <Card className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Qty</th>
                <th className="text-right p-3">Unit Price</th>
                <th className="text-right p-3">Discount</th>
                <th className="text-right p-3">Tax</th>
                <th className="text-right p-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{item.description}</td>
                  <td className="text-right p-3">{item.quantity}</td>
                  <td className="text-right p-3">{item.unitPrice.toFixed(2)}</td>
                  <td className="text-right p-3">{item.discountPercent}%</td>
                  <td className="text-right p-3">{item.taxRate}%</td>
                  <td className="text-right p-3 font-medium">{item.lineTotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <hr className="my-2" />
            <div className="flex justify-between text-sm"><span>Subtotal:</span><span>{invoice.currency} {invoice.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Discount:</span><span>({invoice.currency} {invoice.discountAmount.toFixed(2)})</span></div>
            <div className="flex justify-between text-sm"><span>Tax:</span><span>{invoice.currency} {invoice.taxAmount.toFixed(2)}</span></div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-lg"><span>Total:</span><span>{invoice.currency} {invoice.totalAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span>Paid:</span><span>{invoice.currency} {invoice.amountPaid.toFixed(2)}</span></div>
            <div className="flex justify-between font-medium text-base text-primary"><span>Balance Due:</span><span>{invoice.currency} {invoice.balanceDue.toFixed(2)}</span></div>
          </div>
        </div>

        {invoice.voidReason && (
          <Card className="p-4 bg-red-50 dark:bg-red-950">
            <h3 className="text-sm font-medium text-red-700 dark:text-red-300">Void Reason</h3>
            <p className="text-sm text-red-600 dark:text-red-400">{invoice.voidReason}</p>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
