import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, ArrowLeft, Calendar, FileText, FolderOpen, Edit3 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/components/ui/select'
import { Label } from '@/shared/components/ui/label'
import { Card } from '@/shared/ui/card'
import { PageContainer } from '@/shared/shared/page-container'
import { createInvoice, type CreateInvoiceLineItemDto } from '@/services/api/billing'

type SourceType = '' | 'Manual' | 'Booking' | 'ServiceRequest' | 'Project'

interface LineItemForm {
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  taxRate: number
}

const sourceOptions: { value: SourceType; label: string; icon: React.ReactNode }[] = [
  { value: 'Manual', label: 'Manual Entry', icon: <Edit3 className="h-5 w-5" /> },
  { value: 'Booking', label: 'From Booking', icon: <Calendar className="h-5 w-5" /> },
  { value: 'ServiceRequest', label: 'From Service Request', icon: <FileText className="h-5 w-5" /> },
  { value: 'Project', label: 'From Project', icon: <FolderOpen className="h-5 w-5" /> },
]

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sourceType, setSourceType] = useState<SourceType>('')
  const [sourceId, setSourceId] = useState('')

  const [billToName, setBillToName] = useState('')
  const [billToAddress, setBillToAddress] = useState('')
  const [billToEmail, setBillToEmail] = useState('')
  const [currency, setCurrency] = useState('AED')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [lineItems, setLineItems] = useState<LineItemForm[]>([
    { description: '', quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 }
  ])

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string | number) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: typeof value === 'string' && field !== 'description' ? Number(value) : value }
    setLineItems(updated)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const calculateLineTotal = (item: LineItemForm) => {
    const subtotal = item.quantity * item.unitPrice
    const discount = subtotal * item.discountPercent / 100
    const afterDiscount = subtotal - discount
    const tax = afterDiscount * item.taxRate / 100
    return afterDiscount + tax
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const totalDiscount = lineItems.reduce((sum, item) => {
    const sub = item.quantity * item.unitPrice
    return sum + sub * item.discountPercent / 100
  }, 0)
  const totalTax = lineItems.reduce((sum, item) => {
    const sub = item.quantity * item.unitPrice
    const disc = sub * item.discountPercent / 100
    return sum + (sub - disc) * item.taxRate / 100
  }, 0)
  const total = subtotal - totalDiscount + totalTax

  const handleSubmit = async (saveAsDraft: boolean) => {
    setLoading(true)
    setError(null)
    try {
      const lineItemDtos: CreateInvoiceLineItemDto[] = lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
        taxRate: item.taxRate,
      }))
      const result = await createInvoice({
        billedToEntityType: sourceType !== 'Manual' && sourceType ? sourceType : 'Monthly',
        billedToEntityId: sourceId || undefined,
        billToName,
        billToAddress,
        billToEmail,
        currency,
        invoiceDate: new Date(invoiceDate).toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        lineItems: lineItemDtos,
        saveAsDraft,
      })
      navigate(`/billing/invoices/${result.id}`)
    } catch {
      setError('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title="Create Invoice" status={error ? 'error' : 'success'} onRetry={() => setError(null)}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/billing/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-semibold">Create Invoice</h1>
        </div>

        {/* Step 1: Source Selection */}
        {step === 1 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-medium">Select Source</h2>
            <p className="text-sm text-muted-foreground">Choose how to create this invoice:</p>
            <div className="grid gap-3 md:grid-cols-2">
              {sourceOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSourceType(opt.value); setSourceId('') }}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                    sourceType === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <span className="text-muted-foreground">{opt.icon}</span>
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {sourceType && sourceType !== 'Manual' && (
              <div className="space-y-2">
                <Label>{sourceType} ID</Label>
                <Input
                  placeholder={`Enter ${sourceType} ID...`}
                  value={sourceId}
                  onChange={e => setSourceId(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!sourceType}>
                Next: Customer Info
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Customer Information */}
        {step === 2 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-medium">Customer Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Bill To Name</Label>
                <Input value={billToName} onChange={e => setBillToName(e.target.value)} placeholder="Customer name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={billToEmail} onChange={e => setBillToEmail(e.target.value)} placeholder="customer@example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea value={billToAddress} onChange={e => setBillToAddress(e.target.value)} placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)} disabled={!billToName || !billToEmail}>
                Next: Line Items
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Line Items */}
        {step === 3 && (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Line Items</h2>
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div key={i} className="flex gap-2 items-start p-3 border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={e => updateLineItem(i, 'description', e.target.value)}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateLineItem(i, 'quantity', e.target.value)}
                      min={0}
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={e => updateLineItem(i, 'unitPrice', e.target.value)}
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Input
                      type="number"
                      placeholder="Disc %"
                      value={item.discountPercent}
                      onChange={e => updateLineItem(i, 'discountPercent', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Input
                      type="number"
                      placeholder="Tax %"
                      value={item.taxRate}
                      onChange={e => updateLineItem(i, 'taxRate', e.target.value)}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="w-24 pt-1 text-right text-sm font-medium">
                    {calculateLineTotal(item).toFixed(2)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeLineItem(i)} className="mt-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={() => setStep(4)} disabled={lineItems.some(i => !i.description)}>
                Next: Review
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-medium">Review & Confirm</h2>

            <div className="text-sm space-y-1">
              <p><strong>Source:</strong> {sourceType}{sourceId ? ` (ID: ${sourceId})` : ''}</p>
              <p><strong>Customer:</strong> {billToName}</p>
              <p><strong>Address:</strong> {billToAddress}</p>
              <p><strong>Email:</strong> {billToEmail}</p>
              <p><strong>Currency:</strong> {currency}</p>
              <p><strong>Invoice Date:</strong> {invoiceDate}</p>
              <p><strong>Due Date:</strong> {dueDate}</p>
            </div>

            <hr className="my-2" />

            <div className="text-sm">
              {lineItems.map((item, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span>{item.description} × {item.quantity}</span>
                  <span>{calculateLineTotal(item).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr className="my-2" />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span>{currency} {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount:</span><span>({currency} {totalDiscount.toFixed(2)})</span></div>
              <div className="flex justify-between"><span>Tax:</span><span>{currency} {totalTax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-lg"><span>Total:</span><span>{currency} {total.toFixed(2)}</span></div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={loading}>
                  Save as Draft
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={loading}>
                  Create & Approve
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
