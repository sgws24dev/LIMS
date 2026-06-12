"use client"

import { useState, useMemo, useEffect } from "react"
import { payments, getTodayCollections, getPaymentMethodBreakdown } from "@/mock/data/payments"
import { getDailyCollectionData } from "@/mock/data/purchase-orders"
import type { Payment } from "@/mock/data/payments"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts"
import {
  Download, Wallet, TrendingUp, Banknote, PiggyBank, Calendar,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"

const METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  cheque: "Cheque",
  insurance: "Insurance",
  bank_transfer: "Bank Transfer",
}
const COLORS = [
  "#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#06b6d4", "#ef4444",
]

export default function PaymentsListPage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Billing", href: "/billing" }, { label: "Payments" }]) }, [])
  const [search, setSearch] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const todayColl = useMemo(() => getTodayCollections(), [])
  const methodBreakdown = useMemo(() => getPaymentMethodBreakdown(), [])
  const dailyData = useMemo(() => getDailyCollectionData(), [])

  const filteredPayments = useMemo(() => {
    let filtered = [...payments]
    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.invoiceNumber.toLowerCase().includes(q) ||
          p.patientName.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q)
      )
    }
    if (methodFilter !== "all") filtered = filtered.filter((p) => p.method === methodFilter)
    if (statusFilter !== "all") filtered = filtered.filter((p) => p.status === statusFilter)
    if (dateFilter === "today") {
      const today = new Date().toISOString().split("T")[0]
      filtered = filtered.filter((p) => p.date.startsWith(today))
    } else if (dateFilter === "week") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      filtered = filtered.filter((p) => new Date(p.date) >= weekAgo)
    } else if (dateFilter === "month") {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      filtered = filtered.filter((p) => new Date(p.date) >= monthAgo)
    }
    return filtered
  }, [search, methodFilter, statusFilter, dateFilter])

  const totalToday = todayColl.reduce((s, p) => s + p.amount, 0)
  const totalCompleted = payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amount, 0)
  const totalPending = payments.filter((p) => p.status === "pending").reduce((s, p) => s + p.amount, 0)

  const columns: ColumnDef<Payment>[] = [
    {
      id: "id", header: "Payment ID", accessorKey: "id",
      cell: (row) => <span className="font-medium text-primary">{row.id}</span>,
    },
    { id: "invoiceNumber", header: "Invoice #", accessorKey: "invoiceNumber" },
    { id: "patientName", header: "Patient", accessorKey: "patientName" },
    {
      id: "amount", header: "Amount", accessorKey: "amount",
      cell: (row) => formatCurrency(row.amount),
    },
    {
      id: "method", header: "Method", accessorKey: "method",
      cell: (row) => (
        <Badge variant="secondary" className="capitalize">
          {METHOD_LABELS[row.method] ?? row.method}
        </Badge>
      ),
    },
    {
      id: "date", header: "Date", accessorKey: "date",
      cell: (row) => formatDate(row.date, "datetime"),
    },
    { id: "reference", header: "Reference", accessorKey: "reference" },
    {
      id: "status", header: "Status", accessorKey: "status",
      cell: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Track and manage all payment transactions"
        actions={
          <Button variant="outline" onClick={() => { toast({ title: "Export initiated", description: "Your payment report is being generated." }) }}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Today's Collection"
          value={formatCurrency(totalToday)}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Total Collected"
          value={formatCurrency(totalCompleted)}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total Transactions"
          value={payments.filter((p) => p.status === "completed").length}
        />
        <StatCard
          icon={<PiggyBank className="h-5 w-5" />}
          label="Pending Clearance"
          value={formatCurrency(totalPending)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Method Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={methodBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="amount"
                    nameKey="method"
                    label={({ method, percent }: any) =>
                      `${METHOD_LABELS[method] ?? method} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {methodBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                    labelFormatter={(label) => METHOD_LABELS[label] ?? label}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatDate(d)}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis className="text-xs text-muted-foreground" />
                  <Tooltip
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Payment Transactions</CardTitle>
            <div className="flex items-center gap-2">
              <SearchInput
                placeholder="Search payments..."
                value={search}
                onSearch={setSearch}
                className="w-56"
              />
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Method" />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredPayments}
            pageSize={10}
            emptyMessage="No payments found matching your criteria."
            exportable
          />
        </CardContent>
      </Card>
    </div>
  )
}
