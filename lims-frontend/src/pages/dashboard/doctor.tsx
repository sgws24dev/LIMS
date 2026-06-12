"use client"

import { useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
} from "recharts"
import {
  Users, FileText, Banknote, Activity, TrendingUp,
  UserPlus, ChevronRight, ArrowUpRight, CalendarDays,
  FlaskRoundIcon as Flask, Award, Stethoscope,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { doctors } from "@/mock/data/doctors"
import { patients } from "@/mock/data/patients"
import { bookings } from "@/mock/data/bookings"
import { results } from "@/mock/data/results"
import { analytics } from "@/mock/data/analytics"
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

const statusBadgeVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  completed: "success",
  in_progress: "warning",
  sample_collected: "secondary",
  registered: "default",
  pending: "secondary",
  cancelled: "destructive",
}

interface ReferralRow {
  id: string
  patientName: string
  tests: string
  date: string
  status: string
  amount: number
}

const referralColumns: ColumnDef<ReferralRow>[] = [
  { id: "patientName", header: "Patient", accessorKey: "patientName", sortable: true },
  { id: "tests", header: "Tests", accessorKey: "tests" },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell: (row) => formatDate(row.date, "datetime"),
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
    id: "amount",
    header: "Amount",
    accessorKey: "amount",
    cell: (row) => formatCurrency(row.amount),
    sortable: true,
  },
]

export default function DoctorDashboard() {
  const doctorId = "DOC001"
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [])

  const doctor = doctors.find((d) => d.id === doctorId)

  const referredPatients = useMemo(
    () => patients.filter((p) => p.visits.some((v) => v.doctor.includes(doctor?.name?.split(" ")[1] || ""))),
    [doctor]
  )

  const referredBookings = useMemo(
    () => bookings.filter((b) => b.doctorId === doctorId),
    [doctorId]
  )

  const pendingReports = useMemo(
    () => results.filter((r) => r.status === "review" || r.status === "draft").length,
    []
  )

  const monthlyCommission = useMemo(() => {
    const monthlyRevenue = referredBookings
      .filter((b) => b.status === "completed")
      .reduce((sum, b) => sum + b.totalAmount, 0)
    return monthlyRevenue * ((doctor?.commission || 15) / 100)
  }, [referredBookings, doctor])

  const totalRevenue = useMemo(
    () => referredBookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.totalAmount, 0),
    [referredBookings]
  )

  const recentReferrals: ReferralRow[] = useMemo(
    () =>
      referredBookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8)
        .map((b) => ({
          id: b.id,
          patientName: b.patientName,
          tests: `${b.tests.length} test${b.tests.length > 1 ? "s" : ""}`,
          date: b.createdAt,
          status: b.status,
          amount: b.totalAmount,
        })),
    [referredBookings]
  )

  const monthlyReferralData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    return months.map((month) => ({
      month,
      referrals: Math.floor(Math.random() * 15 + 5),
      revenue: Math.floor(Math.random() * 80000 + 20000),
    }))
  }, [])

  const commissionData = useMemo(
    () =>
      analytics.branchPerformance.slice(0, 5).map((bp) => ({
        name: bp.branch,
        value: bp.revenue,
      })),
    []
  )

  const referralTrendData = useMemo(
    () =>
      analytics.patients.slice(-6).map((p) => ({
        month: p.month.replace(/\s\d{4}$/, ""),
        referrals: Math.floor(p.count * 0.08),
      })),
    []
  )

  const specializationData = useMemo(
    () =>
      doctors.slice(0, 6).map((d) => ({
        name: d.name.split(" ").slice(0, 2).join(" "),
        referrals: d.patientsReferred,
        revenue: d.totalRevenue / 100000,
      })),
    []
  )

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6 p-6">
      <div className="relative">
        <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rounded-full" />
        <PageHeader
          title="Doctor Dashboard"
          description={`${doctor?.name || "Doctor"} - Referral and performance overview`}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/doctors">
                  <Stethoscope className="mr-1 h-4 w-4" />
                  Doctor profile
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/doctors/referral-tracking">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  Referral tracking
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      {doctor && (
        <Card className="border-primary/20 bg-primary/5 card-hover">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-sm">{getInitials(doctor.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{doctor.name}</p>
              <p className="text-sm text-muted-foreground">
                {doctor.specialization} &middot; {doctor.hospital} &middot; {doctor.city}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Commission</p>
                <p className="font-semibold">{doctor.commission}%</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Referred</p>
                <p className="font-semibold">{doctor.patientsReferred}</p>
              </div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="font-semibold">{formatCurrency(doctor.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Patients Referred"
          value={referredPatients.length || doctor?.patientsReferred || 0}
          trend={{ value: 18, positive: true }}
          className="stat-highlight"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Pending Reports"
          value={pendingReports}
          trend={{ value: 5, positive: false }}
          className="stat-highlight"
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Commission (Month)"
          value={formatCurrency(monthlyCommission)}
          trend={{ value: 12, positive: true }}
          className="stat-highlight"
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Total Referrals Value"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 15, positive: true }}
          className="stat-highlight"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-hover">
          <CardHeader className="pb-2 card-header-accent">
            <CardTitle className="text-base">Monthly Referrals & Revenue</CardTitle>
            <CardDescription>Your referral performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReferralData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="refGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="revGradDoc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    </linearGradient>
                    <filter id="barShadowDoc">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    formatter={(value: unknown, name: unknown) =>
                      name === "revenue" ? [formatCurrency(Number(value)), "Revenue"] : [String(value), "Referrals"]
                    }
                    contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }}
                    cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar yAxisId="left" dataKey="referrals" name="Referrals" fill="url(#refGrad)" radius={[6, 6, 0, 0]} filter="url(#barShadowDoc)" maxBarSize={36} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="url(#revGradDoc)" radius={[6, 6, 0, 0]} filter="url(#barShadowDoc)" maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Referral Trend</CardTitle>
            <CardDescription>Patient referral growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={referralTrendData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="referralGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <filter id="areaShadowDoc">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="var(--chart-1)" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4" }} />
                  <Area
                    type="monotone"
                    dataKey="referrals"
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    fill="url(#referralGradient)"
                    filter="url(#areaShadowDoc)"
                    activeDot={{ r: 5, stroke: "var(--background)", strokeWidth: 2, fill: "var(--chart-1)" }}
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
              <CardTitle className="text-base">Recent Referrals</CardTitle>
              <CardDescription>Latest patients referred for testing</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctors/referral-tracking">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={referralColumns}
              data={recentReferrals}
              pageSize={8}
              pageSizeOptions={[8]}
              filterPlaceholder="Search patients..."
              exportable
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-hover">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Doctor Rankings</CardTitle>
            <CardDescription>Top referring doctors by performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-3">
                {specializationData.map((doc, idx) => (
                  <div
                    key={doc.name}
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-accent hover:shadow-sm hover:-translate-y-0.5",
                      idx === 0 && "ring-1 ring-amber-400/30 bg-amber-50 dark:bg-amber-950/20"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        idx === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.referrals} referrals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(doc.revenue * 100000)}</p>
                      <p className="text-[10px] text-muted-foreground">revenue</p>
                    </div>
                    {idx === 0 && <Award className="h-4 w-4 text-amber-500 shrink-0" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Your rank: #1</span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="h-3 w-3" />
                Top performer
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
