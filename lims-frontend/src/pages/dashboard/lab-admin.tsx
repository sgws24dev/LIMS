"use client"

import { useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"
import {
  CalendarDays, Beaker, Clock, Banknote, Activity,
  CheckCircle2, AlertTriangle, ArrowUpRight, FlaskRoundIcon as Flask,
  ChevronRight, Users, Loader2,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { branches } from "@/mock/data/branches"
import { bookings } from "@/mock/data/bookings"
import { samples } from "@/mock/data/samples"
import { results } from "@/mock/data/results"
import { users } from "@/mock/data/users"
import { tests } from "@/mock/data/tests"
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

const sampleStatusVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  completed: "success",
  processing: "warning",
  collected: "secondary",
  received: "default",
  rejected: "destructive",
}

const resultStatusVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  approved: "success",
  published: "success",
  review: "warning",
  draft: "secondary",
}

interface ApprovalRow {
  id: string
  patientName: string
  testName: string
  status: string
  enteredBy: string
  enteredAt: string
  isCritical: boolean
}

const approvalColumns: ColumnDef<ApprovalRow>[] = [
  { id: "patientName", header: "Patient", accessorKey: "patientName", sortable: true },
  { id: "testName", header: "Test", accessorKey: "testName" },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: (row) => (
      <Badge variant={resultStatusVariant[row.status] || "default"}>
        {row.status}
      </Badge>
    ),
  },
  {
    id: "enteredBy",
    header: "Entered By",
    accessorKey: "enteredBy",
  },
  {
    id: "isCritical",
    header: "",
    accessorKey: "isCritical",
    cell: (row) =>
      row.isCritical ? (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Critical
        </Badge>
      ) : null,
  },
]

interface ActivityItem {
  id: string
  type: "booking" | "sample" | "result" | "approval"
  message: string
  time: string
  user: string
}

export default function LabAdminDashboard() {
  const branchId = "BRH001"
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [])

  const labBookings = useMemo(() => bookings.filter((b) => b.branchId === branchId), [])
  const labSamples = useMemo(() => samples, [])
  const labResults = useMemo(() => results, [])

  const todayStr = new Date().toISOString().split("T")[0]

  const todayBookings = useMemo(
    () => labBookings.filter((b) => b.scheduledDate === todayStr).length,
    [labBookings, todayStr]
  )

  const samplesCollected = useMemo(
    () => labSamples.filter((s) => s.status === "collected" || s.status === "received" || s.status === "processing" || s.status === "completed").length,
    [labSamples]
  )

  const pendingReports = useMemo(
    () => labResults.filter((r) => r.status === "draft" || r.status === "review").length,
    [labResults]
  )

  const revenueToday = useMemo(
    () =>
      labBookings
        .filter((b) => b.scheduledDate === todayStr && b.status !== "cancelled")
        .reduce((sum, b) => sum + b.paidAmount, 0),
    [labBookings, todayStr]
  )

  const sampleStatusData = useMemo(() => {
    const counts: Record<string, number> = { collected: 0, received: 0, processing: 0, completed: 0, rejected: 0 }
    labSamples.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++ })
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  }, [labSamples])

  const technicianWorkload = useMemo(() => {
    const techs = users.filter((u) => u.role === "technician" && u.branchId === branchId)
    return techs.map((t) => ({
      name: t.name.split(" ")[0],
      samples: labSamples.filter((s) => s.collectedBy === t.name).length,
      results: labResults.filter((r) => r.enteredBy === t.name).length,
    }))
  }, [branchId])

  const pendingApprovals: ApprovalRow[] = useMemo(
    () =>
      labResults
        .filter((r) => r.status === "review" || r.status === "draft")
        .slice(0, 6)
        .map((r) => ({
          id: r.id,
          patientName: r.patientName,
          testName: r.testName,
          status: r.status,
          enteredBy: r.enteredBy,
          enteredAt: r.enteredAt,
          isCritical: r.isCritical,
        })),
    []
  )

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = []
    labBookings.slice(0, 3).forEach((b) =>
      items.push({
        id: `act-b-${b.id}`,
        type: "booking",
        message: `New booking for ${b.patientName}`,
        time: b.createdAt,
        user: "System",
      })
    )
    labSamples.slice(0, 3).forEach((s) =>
      items.push({
        id: `act-s-${s.id}`,
        type: "sample",
        message: `${s.testName} sample ${s.status === "collected" ? "collected" : s.status === "received" ? "received" : "processed"} for ${s.patientName}`,
        time: s.collectedAt || s.receivedAt || s.processedAt || "",
        user: s.collectedBy || "System",
      })
    )
    labResults.filter((r) => r.status === "approved").slice(0, 3).forEach((r) =>
      items.push({
        id: `act-r-${r.id}`,
        type: "result",
        message: `${r.testName} result approved for ${r.patientName}`,
        time: r.approvedAt || "",
        user: r.approvedBy || "System",
      })
    )
    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8)
  }, [labBookings, labSamples, labResults])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking": return <CalendarDays className="h-3.5 w-3.5 text-blue-500" />
      case "sample": return <Beaker className="h-3.5 w-3.5 text-amber-500" />
      case "result": return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      case "approval": return <Activity className="h-3.5 w-3.5 text-violet-500" />
      default: return <Activity className="h-3.5 w-3.5" />
    }
  }

  const branchRevenueData = useMemo(
    () =>
      analytics.branchPerformance.map((bp) => ({
        name: bp.branch,
        revenue: bp.revenue / 100000,
      })),
    []
  )

  return (
    <div className="space-y-6 p-6">
      <div className="relative">
        <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rounded-full" />
        <PageHeader
          title="Lab Dashboard"
          description="Mumbai HQ - Laboratory overview"
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/samples">
                  <Flask className="mr-1 h-4 w-4" />
                  Lab workflow
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/results">
                  <CheckCircle2 className="mr-1 h-4 w-4" />
                  Enter results
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          className="stat-highlight"
          icon={<CalendarDays className="h-5 w-5" />}
          label="Today's Bookings"
          value={todayBookings}
          trend={{ value: 15, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Beaker className="h-5 w-5" />}
          label="Samples Collected"
          value={samplesCollected}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Clock className="h-5 w-5" />}
          label="Pending Reports"
          value={pendingReports}
          trend={{ value: 12, positive: false }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Banknote className="h-5 w-5" />}
          label="Revenue Today"
          value={formatCurrency(revenueToday)}
          trend={{ value: 5, positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Sample Status Distribution</CardTitle>
            <CardDescription>Current status of all lab samples</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    <filter id="pieShadowLab">
                      <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <Pie
                    data={sampleStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="var(--background)"
                  >
                    {sampleStatusData.map((_, idx) => (
                      <Cell key={idx} fill={PIECHART_COLORS[idx % PIECHART_COLORS.length]} filter="url(#pieShadowLab)" />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {sampleStatusData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIECHART_COLORS[idx % PIECHART_COLORS.length] }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Technician Workload</CardTitle>
            <CardDescription>Samples processed and results entered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicianWorkload} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
                  <defs>
                    <linearGradient id="samplesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    </linearGradient>
                    <linearGradient id="resultsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.5} />
                    </linearGradient>
                    <filter id="barShadowLab">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.4} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} cursor={{ fill: "var(--muted)", opacity: 0.5 }} />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar dataKey="samples" name="Samples" fill="url(#samplesGrad)" radius={[6, 6, 0, 0]} filter="url(#barShadowLab)" maxBarSize={40} />
                  <Bar dataKey="results" name="Results" fill="url(#resultsGrad)" radius={[6, 6, 0, 0]} filter="url(#barShadowLab)" maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>Results awaiting review and approval</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/reports/approval">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingApprovals.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-500" />
                <p>All caught up! No pending approvals.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingApprovals.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-all duration-300 hover:bg-accent hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.patientName}</p>
                      <p className="text-xs text-muted-foreground">{item.testName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={resultStatusVariant[item.status] || "default"} className="shrink-0">
                        {item.status}
                      </Badge>
                      {item.isCritical && (
                        <Badge variant="destructive" className="shrink-0 gap-1">
                          <AlertTriangle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest lab operations</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[340px] pr-3">
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ring-1 ring-border/50">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{activity.user}</span>
                        <span>&middot;</span>
                        <span>{formatDate(activity.time, "datetime")}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {activities.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total samples: {labSamples.length}</span>
              <span>Total bookings: {labBookings.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
