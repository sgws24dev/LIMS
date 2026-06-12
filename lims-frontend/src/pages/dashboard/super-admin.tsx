"use client"

import { useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
} from "recharts"
import {
  Building2, Users, Banknote, Beaker, ArrowUpRight, ArrowDownRight,
  Calendar, Settings, FileText, Activity, TrendingUp, ShoppingCart,
  FlaskRoundIcon as Flask, ChevronRight, Plus,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { branches } from "@/mock/data/branches"
import { patients } from "@/mock/data/patients"
import { bookings } from "@/mock/data/bookings"
import { doctors } from "@/mock/data/doctors"
import { analytics } from "@/mock/data/analytics"
import { tests } from "@/mock/data/tests"

import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/store/appStore"

const PIECHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"]

const statusBadgeVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  completed: "success",
  in_progress: "warning",
  sample_collected: "secondary",
  registered: "default",
  pending: "secondary",
  cancelled: "destructive",
}

interface BookingRow {
  id: string
  patientName: string
  testsCount: string
  totalAmount: number
  status: string
  createdAt: string
  branchId: string
}

const bookingColumns: ColumnDef<BookingRow>[] = [
  { id: "patientName", header: "Patient", accessorKey: "patientName", sortable: true },
  { id: "testsCount", header: "Tests", accessorKey: "testsCount" },
  {
    id: "totalAmount",
    header: "Amount",
    accessorKey: "totalAmount",
    cell: (row) => formatCurrency(row.totalAmount),
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge variant={statusBadgeVariant[row.status] || "default"}>
        {row.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Date",
    accessorKey: "createdAt",
    cell: (row) => formatDate(row.createdAt, "datetime"),
    sortable: true,
  },
]

interface BranchRow {
  id: string
  name: string
  city: string
  monthlyTests: number
  monthlyRevenue: number
  staffCount: number
}

const branchColumns: ColumnDef<BranchRow>[] = [
  { id: "name", header: "Branch", accessorKey: "name", sortable: true },
  { id: "city", header: "City", accessorKey: "city" },
  { id: "monthlyTests", header: "Tests (Month)", accessorKey: "monthlyTests", sortable: true },
  {
    id: "monthlyRevenue",
    header: "Revenue (Month)",
    accessorKey: "monthlyRevenue",
    cell: (row) => formatCurrency(row.monthlyRevenue),
    sortable: true,
  },
  { id: "staffCount", header: "Staff", accessorKey: "staffCount" },
]

export default function SuperAdminDashboard() {
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [])

  const currentMonthRevenue = useMemo(() => {
    const last = analytics.revenue[analytics.revenue.length - 1]
    return last?.amount || 0
  }, [])

  const previousMonthRevenue = useMemo(() => {
    const prev = analytics.revenue[analytics.revenue.length - 2]
    return prev?.amount || 0
  }, [])

  const revenueChange = previousMonthRevenue > 0
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0

  const totalPatients = patients.length
  const totalBranches = branches.length
  const activeTests = tests.filter((t) => t.isActive).length
  const totalRevenue = analytics.revenue.reduce((sum, r) => sum + r.amount, 0)
  const totalBookings = bookings.length

  const recentBookings: BookingRow[] = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map((b) => ({
          id: b.id,
          patientName: b.patientName,
          testsCount: `${b.tests.length} test${b.tests.length > 1 ? "s" : ""}`,
          totalAmount: b.totalAmount,
          status: b.status,
          createdAt: b.createdAt,
          branchId: b.branchId,
        })),
    []
  )

  const branchPerformanceData: BranchRow[] = useMemo(
    () =>
      branches.map((b) => ({
        id: b.id,
        name: b.name.split(" - ")[1] || b.name,
        city: b.city,
        monthlyTests: b.monthlyTests,
        monthlyRevenue: b.monthlyRevenue,
        staffCount: b.staffCount,
      })),
    []
  )

  const revenueBreakdownData = useMemo(
    () =>
      analytics.branchPerformance.map((bp) => ({
        name: bp.branch,
        value: bp.revenue,
      })),
    []
  )

  const patientGrowthData = useMemo(
    () =>
      analytics.patients.map((p) => ({
        month: p.month.replace(/\s\d{4}$/, ""),
        count: p.count,
      })),
    []
  )

  const revenueChartData = useMemo(
    () =>
      analytics.revenue.map((r) => ({
        month: r.month.replace(/\s\d{4}$/, ""),
        amount: r.amount / 100000,
      })),
    []
  )

  const quickActions = [
    { label: "New branch", icon: Building2, href: "/branches/create", color: "text-sky-600 dark:text-sky-400" },
    { label: "Add user", icon: Users, href: "/users/create", color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Create test", icon: Beaker, href: "/tests", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "View reports", icon: FileText, href: "/reports", color: "text-amber-600 dark:text-amber-400" },
    { label: "Settings", icon: Settings, href: "/settings", color: "text-violet-600 dark:text-violet-400" },
    { label: "Billing", icon: ShoppingCart, href: "/billing", color: "text-rose-600 dark:text-rose-400" },
  ]

  return (
      <div className="space-y-6 p-6">
      <div className="relative">
        <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rounded-full" />
        <PageHeader
          title="Enterprise Dashboard"
          description="Overview of your entire laboratory network"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/reports">
                  <FileText className="mr-1 h-4 w-4" />
                  Reports
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/bookings/walk-in">
                  <Plus className="mr-1 h-4 w-4" />
                  New booking
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Labs"
          value={totalBranches}
          trend={{ value: Math.round((totalBranches / 5) * 100 - 100), positive: true }}
          className="stat-highlight"
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Patients"
          value={totalPatients}
          trend={{ value: 12.5, positive: true }}
          className="stat-highlight"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Monthly Revenue"
          value={formatCurrency(currentMonthRevenue)}
          trend={{ value: Math.abs(Math.round(revenueChange)), positive: revenueChange >= 0 }}
          className="stat-highlight"
        />
        <StatCard
          icon={<Beaker className="h-5 w-5" />}
          label="Active Tests"
          value={activeTests}
          trend={{ value: 8.3, positive: true }}
          className="stat-highlight"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-accent">
            <div>
              <CardTitle className="text-base">Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue in lakhs (INR)</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className={revenueChange >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                {revenueChange >= 0 ? "+" : ""}{revenueChange.toFixed(1)}%
              </span>
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    </linearGradient>
                    <filter id="barShadow">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--chart-1)" floodOpacity="0.25" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    formatter={(value: unknown) => [formatCurrency(Number(value) * 100000), "Revenue"]}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  />
                  <Bar dataKey="amount" fill="url(#revGrad)" radius={[6, 6, 0, 0]} filter="url(#barShadow)" maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="pb-2 card-header-accent">
            <CardTitle className="text-base">Patient Growth</CardTitle>
            <CardDescription>New patients over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientGrowthData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="patientGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                    <filter id="areaShadow">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--chart-2)" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                    cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--chart-2)"
                    strokeWidth={2.5}
                    fill="url(#patientGradient)"
                    filter="url(#areaShadow)"
                    activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2, fill: "var(--chart-2)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-accent">
            <div>
              <CardTitle className="text-base">Branch Performance</CardTitle>
              <CardDescription>Monthly revenue and test volume by branch</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/branches/performance">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={branchColumns}
              data={branchPerformanceData}
              pageSize={6}
              pageSizeOptions={[6]}
              filterPlaceholder="Search branches..."
              exportable
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="pb-2 card-header-accent">
            <CardTitle className="text-base">Revenue by Branch</CardTitle>
            <CardDescription>Distribution across all labs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadow">
                      <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <Pie
                    data={revenueBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {revenueBreakdownData.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={PIECHART_COLORS[idx % PIECHART_COLORS.length]}
                        filter="url(#pieShadow)"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: unknown) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1.5">
              {revenueBreakdownData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: PIECHART_COLORS[idx % PIECHART_COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2 card-header-accent">
            <div>
              <CardTitle className="text-base">Recent Bookings</CardTitle>
              <CardDescription>Latest patient registrations</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookings">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={bookingColumns}
              data={recentBookings}
              pageSize={8}
              pageSizeOptions={[8]}
              filterPlaceholder="Search patients..."
              exportable
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.href}
                  className="flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all duration-300 hover:bg-accent hover:shadow-sm hover:-translate-y-0.5"
                >
                  <div className={cn("rounded-full bg-primary/5 p-2.5", action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">System Overview</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-semibold">{totalBookings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Referring Doctors</span>
                <span className="font-semibold">{doctors.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tests Available</span>
                <span className="font-semibold">{tests.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
