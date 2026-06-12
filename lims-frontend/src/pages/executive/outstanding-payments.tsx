"use client"

import { useState, useEffect, useMemo } from "react"
import { Banknote, AlertTriangle, CalendarDays, TrendingUp } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getOutstandingPayments } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ExecutiveChart } from "@/components/shared/executive-chart"

interface PaymentData {
  totalOutstanding: number
  overdueAmount: number
  averageDelayDays: number
  byCategory: { category: string; amount: number; count: number; overdueDays: number }[]
  recentTransactions: { invoiceNo: string; patientName: string; amount: number; dueDate: string; status: string }[]
}

interface TxRow {
  invoiceNo: string
  patientName: string
  amount: number
  dueDate: string
  status: string
}

const txColumns: ColumnDef<TxRow>[] = [
  { id: "invoiceNo", header: "Invoice", accessorKey: "invoiceNo" },
  { id: "patientName", header: "Patient/Company", accessorKey: "patientName", sortable: true },
  {
    id: "amount", header: "Amount", accessorKey: "amount",
    cell: (row) => formatCurrency(row.amount),
    sortable: true,
  },
  { id: "dueDate", header: "Due Date", accessorKey: "dueDate" },
  {
    id: "status", header: "Status", accessorKey: "status",
    cell: (row) => (
      <Badge variant={row.status === "overdue" ? "destructive" : "warning"}>
        {row.status}
      </Badge>
    ),
  },
]

export default function OutstandingPaymentsPage() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payments, setPayments] = useState<PaymentData | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Outstanding Payments" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getOutstandingPayments()
      setPayments(result)
    } catch {
      setError("Failed to load payment data")
      showToast({ type: "error", title: "Error", message: "Failed to load outstanding payments" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const collectionRate = payments
    ? Math.round(((payments.totalOutstanding - payments.overdueAmount) / Math.max(1, payments.totalOutstanding)) * 100)
    : 0

  const agingData = [
    { label: "0-30 days", value: payments ? payments.totalOutstanding - payments.overdueAmount : 0 },
    { label: "31-60 days", value: payments ? Math.round(payments.overdueAmount * 0.45) : 0 },
    { label: "61-90 days", value: payments ? Math.round(payments.overdueAmount * 0.35) : 0 },
    { label: "90+ days", value: payments ? Math.round(payments.overdueAmount * 0.2) : 0 },
  ]

  const branchOutstanding = payments?.byCategory.map((c) => ({
    label: c.category,
    value: c.amount,
  })) ?? []

  const collectionTrend = [
    { label: "Jan", value: 320000 },
    { label: "Feb", value: 280000 },
    { label: "Mar", value: 350000 },
    { label: "Apr", value: 410000 },
    { label: "May", value: 380000 },
    { label: "Jun", value: 420000 },
  ]

  const dueThisWeek = payments?.recentTransactions.filter(
    (t) => t.status === "pending"
  ).length ?? 0

  const handleSendReminder = () => {
    showToast({ type: "success", title: "Reminder sent", message: "Payment reminders have been sent" })
  }

  const handleMarkCollected = () => {
    showToast({ type: "success", title: "Marked as collected", message: "Payment has been marked as collected" })
  }

  return (
    <PageContainer
      title="Outstanding Payments"
      description="Track and manage outstanding payments and collections"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Total Outstanding"
          value={formatCurrency(payments?.totalOutstanding ?? 0)}
        />
        <StatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Overdue"
          value={formatCurrency(payments?.overdueAmount ?? 0)}
          trend={{ value: payments?.overdueAmount ?? 0, positive: (payments?.overdueAmount ?? 0) < 200000 }}
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Due This Week"
          value={dueThisWeek}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Collection Rate"
          value={`${collectionRate}%`}
          trend={{ value: collectionRate, positive: collectionRate >= 70 }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aging Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={agingData} type="bar" height={260} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Outstanding by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={branchOutstanding} type="pie" height={260} formatValue={formatCurrency} showLegend />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Defaulters</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={txColumns}
            data={payments?.recentTransactions ?? []}
            pageSize={6}
            emptyMessage="No outstanding transactions"
            exportable
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={collectionTrend} type="line" height={260} formatValue={formatCurrency} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={handleSendReminder} variant="outline" className="justify-start">
              Send Reminder
            </Button>
            <Button onClick={handleMarkCollected} variant="outline" className="justify-start">
              Mark as Collected
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
