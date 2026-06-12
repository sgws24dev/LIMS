"use client"

import { useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
} from "recharts"
import {
  Beaker, Banknote, Users, CalendarDays, Clock,
  ChevronRight, ArrowUpRight, FlaskRoundIcon as Flask,
  MapPin, Phone, Mail, User,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { branches } from "@/mock/data/branches"
import { bookings } from "@/mock/data/bookings"
import { samples } from "@/mock/data/samples"
import { users } from "@/mock/data/users"
import { analytics } from "@/mock/data/analytics"
import type { Branch, Booking } from "@/types"
import { useAppStore } from "@/store/appStore"

import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"

const PIECHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const statusVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  completed: "success",
  in_progress: "warning",
  sample_collected: "secondary",
  registered: "default",
  pending: "secondary",
  cancelled: "destructive",
}

interface ScheduleRow {
  id: string
  patientName: string
  time: string
  tests: string
  status: string
  collectionType: string
}

const scheduleColumns: ColumnDef<ScheduleRow>[] = [
  { id: "patientName", header: "Patient", accessorKey: "patientName", sortable: true },
  { id: "time", header: "Time", accessorKey: "time" },
  { id: "tests", header: "Tests", accessorKey: "tests" },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge variant={statusVariant[row.status] || "default"}>
        {row.status.replace(/_/g, " ")}
      </Badge>
    ),
  },
  {
    id: "collectionType",
    header: "Type",
    accessorKey: "collectionType",
    cell: (row) => (row.collectionType === "home" ? "Home" : "Lab"),
  },
]

export default function BranchDashboard() {
  const branchId = "BRH002"
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [])

  const branch = branches.find((b) => b.id === branchId) as Branch

  const todayStr = new Date().toISOString().split("T")[0]
  const branchBookings = useMemo(() => bookings.filter((b) => b.branchId === branchId), [branchId])
  const todayBranchBookings = useMemo(
    () => branchBookings.filter((b) => b.scheduledDate === todayStr),
    [branchBookings, todayStr]
  )

  const dailyTests = useMemo(
    () => todayBranchBookings.reduce((sum, b) => sum + b.tests.length, 0),
    [todayBranchBookings]
  )

  const dailyRevenue = useMemo(
    () =>
      todayBranchBookings
        .filter((b) => b.status !== "cancelled")
        .reduce((sum, b) => sum + b.paidAmount, 0),
    [todayBranchBookings]
  )

  const walkIns = useMemo(
    () => todayBranchBookings.filter((b) => b.type === "walkin").length,
    [todayBranchBookings]
  )

  const collections = useMemo(
    () => samples.filter((s) => s.status === "collected" || s.status === "received").length,
    []
  )

  const staffOnDuty = useMemo(
    () => users.filter((u) => u.branchId === branchId && u.isActive),
    [branchId]
  )

  const todaySchedule: ScheduleRow[] = useMemo(
    () =>
      todayBranchBookings.slice(0, 7).map((b) => ({
        id: b.id,
        patientName: b.patientName,
        time: b.scheduledTime || "--:--",
        tests: `${b.tests.length} test${b.tests.length > 1 ? "s" : ""}`,
        status: b.status,
        collectionType: b.collectionType,
      })),
    [todayBranchBookings]
  )

  const weeklyRevenueData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return days.map((day) => ({
      day,
      revenue: Math.floor(Math.random() * 30000 + 15000),
      tests: Math.floor(Math.random() * 40 + 15),
    }))
  }, [])

  const monthlyTrendData = useMemo(
    () =>
      analytics.revenue.slice(-6).map((r) => ({
        month: r.month.replace(/\s\d{4}$/, ""),
        amount: r.amount / 100000,
      })),
    []
  )

  const bookingTypeData = useMemo(() => {
    const types: Record<string, number> = {}
    branchBookings.forEach((b) => { types[b.type] = (types[b.type] || 0) + 1 })
    return Object.entries(types).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [branchBookings])

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6 p-6">
      <div className="relative">
        <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rounded-full" />
        <PageHeader
          title="Branch Dashboard"
        description={`${branch?.name || "Branch"} - Operational overview`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/bookings/walk-in">
                <CalendarDays className="mr-1 h-4 w-4" />
                New booking
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/samples/sample-collection-queue">
                <Beaker className="mr-1 h-4 w-4" />
                Collections
              </Link>
            </Button>
          </div>
        }
      />
      </div>

      {branch && (
        <Card className="card-hover border-primary/20 bg-primary/5">
          <CardContent className="flex flex-wrap items-center gap-6 p-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{branch.address}, {branch.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{branch.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{branch.email}</span>
            </div>
            <Badge variant="success" className="ml-auto">
              Active
            </Badge>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className="stat-highlight"
          icon={<Beaker className="h-5 w-5" />}
          label="Today's Tests"
          value={dailyTests}
          trend={{ value: 10, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Banknote className="h-5 w-5" />}
          label="Revenue Today"
          value={formatCurrency(dailyRevenue)}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Users className="h-5 w-5" />}
          label="Walk-ins"
          value={walkIns}
          trend={{ value: 20, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<CalendarDays className="h-5 w-5" />}
          label="Collections"
          value={collections}
          trend={{ value: 5, positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent pb-2">
            <CardTitle className="text-base">Weekly Performance</CardTitle>
            <CardDescription>Revenue and test volume for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="revGradBranch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="testsGradBranch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    </linearGradient>
                    <filter id="barShadowBranch">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar yAxisId="left" dataKey="revenue" name="Revenue (₹)" fill="url(#revGradBranch)" radius={[6, 6, 0, 0]} filter="url(#barShadowBranch)" maxBarSize={36} />
                  <Bar yAxisId="right" dataKey="tests" name="Tests" fill="url(#testsGradBranch)" radius={[6, 6, 0, 0]} filter="url(#barShadowBranch)" maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent pb-2">
            <CardTitle className="text-base">Booking Types</CardTitle>
            <CardDescription>Distribution by booking type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadowBranch">
                      <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <Pie
                    data={bookingTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {bookingTypeData.map((_, idx) => (
                      <Cell key={idx} fill={PIECHART_COLORS[idx % PIECHART_COLORS.length]} filter="url(#pieShadowBranch)" />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-1">
              {bookingTypeData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIECHART_COLORS[idx % PIECHART_COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Month-to-date revenue</span>
              <span className="font-medium text-foreground">
                {formatCurrency(branch?.monthlyRevenue || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Today's Schedule</CardTitle>
              <CardDescription>Patient appointments for today</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bookings/queue">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                <CalendarDays className="mb-2 h-8 w-8" />
                <p>No appointments scheduled for today.</p>
              </div>
            ) : (
              <DataTable
                columns={scheduleColumns}
                data={todaySchedule}
                pageSize={7}
                pageSizeOptions={[7]}
                filterPlaceholder="Search..."
                exportable
              />
            )}
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Staff on Duty</CardTitle>
            <CardDescription>Active staff members at this branch</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[280px] pr-3">
              <div className="space-y-3">
                {staffOnDuty.map((staff) => (
                  <div key={staff.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent hover:shadow-sm hover:-translate-y-0.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">{getInitials(staff.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{staff.name}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {staff.role.replace(/_/g, " ")}
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0 text-[10px]">
                      On duty
                    </Badge>
                  </div>
                ))}
                {staffOnDuty.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No staff assigned to this branch.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total staff: {staffOnDuty.length}</span>
              <span>Monthly tests: {branch?.monthlyTests || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader className="card-header-accent">
          <CardTitle className="text-base">Revenue Trend (6 Months)</CardTitle>
          <CardDescription>Monthly revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="branchRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <filter id="areaShadowBranch">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--chart-1)" floodOpacity="0.15" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                <RechartsTooltip
                  formatter={(value: unknown) => formatCurrency(Number(value) * 100000)}
                  contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                  cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  fill="url(#branchRevenueGrad)"
                  filter="url(#areaShadowBranch)"
                  activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2, fill: "var(--chart-1)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
