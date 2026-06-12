"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { patients } from "@/mock/data/patients"
import { bookings } from "@/mock/data/bookings"
import { createInvoice } from "@/mock/services"
import { generateId, formatCurrency } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, Save, Search, Trash2 } from "lucide-react"

interface LineItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  total: number
}

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "upi", label: "UPI" },
  { value: "cheque", label: "Cheque" },
  { value: "insurance", label: "Insurance" },
  { value: "bank_transfer", label: "Bank Transfer" },
]

function toDateInput(date: Date): string {
  return date.toISOString().split("T")[0]
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [patientSearch, setPatientSearch] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [discount, setDiscount] = useState(0)
  const [tax, setTax] = useState(0)
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [invoiceDate, setInvoiceDate] = useState(toDateInput(new Date()))
  const [dueDate, setDueDate] = useState(toDateInput(addDays(new Date(), 30)))
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Billing", href: "/billing" }, { label: "Create Invoice" }])
  }, [])

  const filteredPatients = useMemo(() => {
    if (!patientSearch) return patients
    const q = patientSearch.toLowerCase()
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)
    )
  }, [patientSearch])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  const patientBookings = useMemo(() => {
    if (!selectedPatientId) return []
    return bookings.filter((b) => b.patientId === selectedPatientId)
  }, [selectedPatientId])

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId)

  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking) {
      const items: LineItem[] = booking.tests.map((testId, i) => ({
        id: generateId(),
        name: testId,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      }))
      setLineItems(items)
    }
  }

  const updateLineItem = (id: string, field: "name" | "quantity" | "unitPrice", value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "unitPrice") {
          const qty = field === "quantity" ? Number(value) : item.quantity
          const price = field === "unitPrice" ? Number(value) : item.unitPrice
          updated.total = qty * price
        }
        return updated
      })
    )
  }

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.total, 0), [lineItems])
  const netTotal = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax])

  const handleSubmit = async () => {
    if (!selectedPatient) {
      toast({ title: "Please select a patient", variant: "destructive" })
      return
    }
    if (lineItems.length === 0) {
      toast({ title: "Please add at least one line item", variant: "destructive" })
      return
    }
    setSubmitting(true)
    try {
      await createInvoice({
        patientName: selectedPatient.name,
        patientId: selectedPatient.id,
        items: lineItems,
        subtotal,
        discount,
        tax,
        total: netTotal,
        paid: 0,
        due: netTotal,
        status: "unpaid",
        paymentMethod,
        dueDate: new Date(dueDate).toISOString(),
        notes,
      })
      toast({ title: "Invoice created successfully", variant: "success" })
      navigate("/billing")
    } catch {
      toast({ title: "Failed to create invoice", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Invoice"
        description="Generate a new invoice for a patient booking"
        actions={
          <Button variant="outline" onClick={() => navigate("/billing")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient & Booking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Patient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {patientSearch && (
                  <ScrollArea className="h-40 rounded-md border">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${selectedPatientId === p.id ? "bg-accent font-medium" : ""}`}
                        onClick={() => {
                          setSelectedPatientId(p.id)
                          setSelectedBookingId("")
                          setLineItems([])
                          setPatientSearch("")
                        }}
                      >
                        <span className="font-medium">{p.name}</span>
                        <span className="ml-2 text-muted-foreground">{p.id}</span>
                      </button>
                    ))}
                  </ScrollArea>
                )}
              </div>

              {selectedPatient && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="text-sm font-medium">{selectedPatient.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedPatient.id} &middot; {selectedPatient.phone}</div>
                </div>
              )}

              {selectedPatient && (
                <div className="space-y-2">
                  <Label>Select Booking</Label>
                  <Select value={selectedBookingId} onValueChange={handleSelectBooking}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a booking..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patientBookings.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.id} &middot; {b.scheduledDate} &middot; {b.status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Invoice Date</Label>
                  <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select a booking to load items, or add items manually below.</p>
              ) : (
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-2 text-left font-medium">Item</th>
                        <th className="px-4 py-2 text-right font-medium">Qty</th>
                        <th className="px-4 py-2 text-right font-medium">Rate</th>
                        <th className="px-4 py-2 text-right font-medium">Total</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="px-4 py-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                              className="h-8"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))}
                              className="h-8 w-20 text-right"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              min={0}
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, "unitPrice", Number(e.target.value))}
                              className="h-8 w-24 text-right"
                            />
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatCurrency(item.total)}
                          </td>
                          <td className="px-2 py-2">
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeLineItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Discount (₹)</Label>
                <Input type="number" min={0} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Tax (₹)</Label>
                <Input type="number" min={0} value={tax} onChange={(e) => setTax(Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((pm) => (
                      <SelectItem key={pm.value} value={pm.value}>
                        {pm.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-destructive">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Net Amount</span>
                <span>{formatCurrency(netTotal)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button onClick={handleSubmit} disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Creating..." : "Create Invoice"}
            </Button>
            <Button variant="outline" onClick={() => navigate("/billing")}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
