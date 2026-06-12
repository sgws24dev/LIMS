"use client"

import { useState, useMemo, useEffect } from "react"
import { invoices } from "@/mock/data/invoices"
import { payments } from "@/mock/data/payments"
import { getPendingPayments } from "@/mock/data/purchase-orders"
import { analytics, getBranchPerformance } from "@/mock/data/analytics"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EmptyState } from "@/components/ui/empty-state"
import { Pagination } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts"
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Percent, Receipt,
  PieChart as PieChartIcon, BarChart3, CreditCard, IndianRupee,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#6366f1", "#ec4899", "#14b8a6"]
const GST_COLORS = ["#f59e0b", "#3b82f6", "#8b5cf6"]

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function FinancialDashboardPage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  useEffect(() => { setBreadcrumbs([{ label: "Billing", href: "/billing" }, { label: "Financial Dashboard" }]) }, [])
  const [selectedYear, setSelectedYear] = useState("2026")
  const [pendingPage, setPendingPage] = useState(1)
  const pendingPageSize = 6

  const revenueData = analytics.revenue

  const monthlyRevenue = useMemo(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return invoices
      .filter((i) => {
        const d = new Date(i.createdAt)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .reduce((s, i) => s + i.total, 0)
  }, [])

  const outstandingAmount = useMemo(
    () => invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((s, i) => s + i.due, 0),
    []
  )

  const totalPaid = useMemo(
    () => invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
    []
  )

  const totalInvoiced = useMemo(
    () => invoices.filter((i) => i.status !== "cancelled").reduce((s, i) => s + i.total, 0),
    []
  )

  const collectionRate = totalInvoiced > 0 ? ((totalPaid / totalInvoiced) * 100).toFixed(1) : "0"
  const avgInvoiceValue = totalInvoiced > 0 ? Math.round(totalInvoiced / invoices.filter((i) => i.status !== "cancelled").length) : 0

  const branchRevenue = useMemo(() => {
    const branches = getBranchPerformance()
    return branches.map((b) => ({ name: b.branch.split(" - ")[1] ?? b.branch, revenue: b.revenue }))
  }, [])

  const testCategoryRevenue = [
    { name: "Biochemistry", value: 42, amount: 1450000 },
    { name: "Hematology", value: 18, amount: 620000 },
    { name: "Microbiology", value: 12, amount: 415000 },
    { name: "Immunology", value: 15, amount: 518000 },
    { name: "Histopathology", value: 8, amount: 276000 },
    { name: "Molecular", value: 5, amount: 173000 },
  ]

  const dayCollection = [
    { day: "1", amount: 12500 }, { day: "2", amount: 18200 }, { day: "3", amount: 9800 },
    { day: "4", amount: 15400 }, { day: "5", amount: 22100 }, { day: "6", amount: 13200 },
    { day: "7", amount: 8500 }, { day: "8", amount: 16800 }, { day: "9", amount: 19200 },
    { day: "10", amount: 24100 }, { day: "11", amount: 0 }, { day: "12", amount: 0 },
  ]

  const pendingPay = getPendingPayments()

  const expenseVsRevenue = [
    { month: "Jan", revenue: 2950000, expense: 2100000 },
    { month: "Feb", revenue: 2800000, expense: 2050000 },
    { month: "Mar", revenue: 3250000, expense: 2300000 },
    { month: "Apr", revenue: 3420000, expense: 2450000 },
    { month: "May", revenue: 3680000, expense: 2600000 },
    { month: "Jun", revenue: 3100000, expense: 2250000 },
  ]

  const gstSummary = {
    cgst: 184500,
    sgst: 184500,
    igst: 62500,
    total: 431500,
  }

  const pendingInvoices = invoices.filter((i) => i.status === "unpaid" || i.status === "partial")

  const slicedPending = useMemo(() => {
    const start = (pendingPage - 1) * pendingPageSize
    return pendingInvoices.slice(start, start + pendingPageSize)
  }, [pendingInvoices, pendingPage, pendingPageSize])

  const pendingTotalPages = Math.ceil(pendingInvoices.length / pendingPageSize)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial Dashboard"
        description="Comprehensive financial overview and revenue analytics"
        actions={
          <div className="flex items-center gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2026">2026</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => toast({ title: "Export", description: "Financial report export would start", variant: "success" })}>Export Report</Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Monthly Revenue"
          value={formatCurrency(monthlyRevenue)}
          trend={{ value: 8.5, positive: true }}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Outstanding"
          value={formatCurrency(outstandingAmount)}
          trend={{ value: 3.2, positive: false }}
        />
        <StatCard
          icon={<Percent className="h-5 w-5" />}
          label="Collection Rate"
          value={`${collectionRate}%`}
          trend={{ value: 2.1, positive: true }}
        />
        <StatCard
          icon={<Receipt className="h-5 w-5" />}
          label="Avg Invoice Value"
          value={formatCurrency(avgInvoiceValue)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs text-muted-foreground" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                  <YAxis type="category" dataKey="name" className="text-xs text-muted-foreground" width={90} />
                  <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {branchRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by Test Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testCategoryRevenue}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {testCategoryRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                   <Tooltip formatter={((value: unknown, _: unknown, props: any) => [`${Number(value)}%`, props.payload?.amount ? `${formatCurrency(props.payload.amount)}` : ""]) as any} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Day-wise Collection (June)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayCollection}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GST Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "CGST", value: gstSummary.cgst },
                        { name: "SGST", value: gstSummary.sgst },
                        { name: "IGST", value: gstSummary.igst },
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={40} outerRadius={65}
                      dataKey="value"
                      nameKey="name"
                    >
                      {[0, 1, 2].map((i) => (
                        <Cell key={i} fill={GST_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 w-full space-y-2">
                {[
                  { label: "CGST (9%)", value: gstSummary.cgst, color: "bg-amber-500" },
                  { label: "SGST (9%)", value: gstSummary.sgst, color: "bg-blue-500" },
                  { label: "IGST (18%)", value: gstSummary.igst, color: "bg-purple-500" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t pt-2 text-sm font-bold">
                  <span>Total GST</span>
                  <span>{formatCurrency(gstSummary.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense vs Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseVsRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
                   <Tooltip formatter={(value: unknown) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} fill="#10b981" />
                  <Bar dataKey="expense" name="Expense" radius={[4, 4, 0, 0]} fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <EmptyState
                icon={<Receipt className="h-8 w-8" />}
                title="No pending payments"
                description="All invoices are paid up to date."
              />
            ) : (
              <div className="max-h-72 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slicedPending.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium text-primary">{inv.invoiceNumber}</TableCell>
                        <TableCell>{inv.patientName}</TableCell>
                        <TableCell className="text-destructive font-medium">{formatCurrency(inv.due)}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === "unpaid" ? "destructive" : "warning"} className="capitalize">
                            {inv.status}
                          </Badge>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="px-2 pb-2">
            <Pagination currentPage={pendingPage} totalPages={pendingTotalPages} onPageChange={setPendingPage} />
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
