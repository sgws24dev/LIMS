import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Eye, Download, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { InvoiceStatusBadge } from '@/modules/billing/components/invoice-status-badge'
import { getInvoices, type InvoiceDto } from '@/services/api/billing'

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Paid', label: 'Paid' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Voided', label: 'Voided' },
]

export default function InvoicesListPage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<InvoiceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getInvoices({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search || undefined,
        page,
        pageSize,
      })
      setInvoices(result.items)
      setTotal(result.totalCount)
    } catch {
      setError('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search, page])

  useEffect(() => { fetchInvoices() }, [fetchInvoices])

  const columns = [
    { id: 'invoiceNumber', header: 'Invoice #', accessorKey: 'invoiceNumber', cell: (row: InvoiceDto) => (
      <button onClick={() => navigate(`/billing/invoices/${row.id}`)} className="font-mono font-medium text-primary hover:underline">
        {row.invoiceNumber}
      </button>
    )},
    { id: 'billToName', header: 'Customer', accessorKey: 'billToName' },
    { id: 'status', header: 'Status', accessorKey: 'status', cell: (row: InvoiceDto) => <InvoiceStatusBadge status={row.status} /> },
    { id: 'totalAmount', header: 'Amount', accessorKey: 'totalAmount', cell: (row: InvoiceDto) => `${row.currency} ${row.totalAmount.toLocaleString()}` },
    { id: 'invoiceDate', header: 'Date', accessorKey: 'invoiceDate', cell: (row: InvoiceDto) => new Date(row.invoiceDate).toLocaleDateString() },
    { id: 'dueDate', header: 'Due Date', accessorKey: 'dueDate', cell: (row: InvoiceDto) => {
      const due = new Date(row.dueDate)
      const overdue = due < new Date() && row.status !== 'Paid' && row.status !== 'Voided'
      return <span className={overdue ? 'text-red-600 font-medium' : ''}>{due.toLocaleDateString()}</span>
    }},
    { id: 'actions', header: '', cell: (row: InvoiceDto) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/billing/invoices/${row.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.open(`/api/v1/billing/invoices/${row.id}/pdf`)}>
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )},
  ]

  return (
    <PageContainer title="Invoices" status={loading ? 'loading' : error ? 'error' : invoices.length === 0 ? 'empty' : 'success'} onRetry={fetchInvoices}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Invoices</h1>
          <Button onClick={() => navigate('/billing/invoices/new')}>
            <Plus className="h-4 w-4 mr-2" />Create Invoice
          </Button>
        </div>

        <div className="flex gap-3">
          <Input placeholder="Search by invoice # or customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} className="max-w-sm" />
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              {statusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={invoices} />
      </div>
    </PageContainer>
  )
}
