"use client"

import { useMemo, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
} from "recharts"
import {
  FlaskRoundIcon as Flask, Beaker, Clock, CheckCircle2,
  AlertTriangle, Barcode, FileText, Activity,
  ChevronRight, ArrowUpRight, ArrowRight, Scan,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { samples } from "@/mock/data/samples"
import { results } from "@/mock/data/results"
import { bookings } from "@/mock/data/bookings"
import { users } from "@/mock/data/users"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"

import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"

const PIECHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]

const sampleStatusVariant: Record<string, "success" | "warning" | "default" | "secondary" | "destructive"> = {
  completed: "success",
  processing: "warning",
  collected: "secondary",
  received: "default",
  rejected: "destructive",
}

const resultStatusVariant: Record<string, "success" | "warning" | "default" | "secondary"> = {
  approved: "success",
  published: "success",
  review: "warning",
  draft: "secondary",
}

interface SampleQueueItem {
  id: string
  patientName: string
  testName: string
  barcode: string
  type: string
  status: string
  collectedAt?: string
  priority: string
}

interface PendingResultItem {
  id: string
  patientName: string
  testName: string
  status: string
  enteredAt: string
  isCritical: boolean
}

export default function TechnicianDashboard() {
  const { toast } = useToast()
  const techName = "Ananya Gupta"
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [])

  const todayStr = new Date().toISOString().split("T")[0]

  const assignedSamples = useMemo(
    () => samples.filter((s) => s.collectedBy === techName || !s.collectedBy),
    []
  )

  const todayCollections = useMemo(
    () => samples.filter((s) => s.collectedBy === techName || s.collectedAt?.startsWith(todayStr)),
    [techName, todayStr]
  )

  const pendingResultsList = useMemo(
    () => results.filter((r) => (r.enteredBy === techName || r.status === "draft") && r.status !== "approved" && r.status !== "published"),
    [techName]
  )

  const completedToday = useMemo(
    () => results.filter((r) => r.enteredBy === techName && r.enteredAt?.startsWith(todayStr) && (r.status === "approved" || r.status === "published")).length,
    [techName, todayStr]
  )

  const sampleQueue: SampleQueueItem[] = useMemo(
    () =>
      assignedSamples
        .filter((s) => s.status !== "completed" && s.status !== "rejected")
        .slice(0, 8)
        .map((s) => ({
          id: s.id,
          patientName: s.patientName,
          testName: s.testName,
          barcode: s.barcode,
          type: s.type,
          status: s.status,
          collectedAt: s.collectedAt,
          priority: s.status === "received" ? "high" : s.status === "processing" ? "medium" : "low",
        })),
    [assignedSamples]
  )

  const pendingResults: PendingResultItem[] = useMemo(
    () =>
      pendingResultsList.slice(0, 6).map((r) => ({
        id: r.id,
        patientName: r.patientName,
        testName: r.testName,
        status: r.status,
        enteredAt: r.enteredAt,
        isCritical: r.isCritical,
      })),
    [pendingResultsList]
  )

  const sampleStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { collected: 0, received: 0, processing: 0, completed: 0 }
    assignedSamples.forEach((s) => { if (counts[s.status] !== undefined) counts[s.status]++ })
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [assignedSamples])

  const dailyPerformance = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    return days.map((day) => ({
      day,
      collected: Math.floor(Math.random() * 12 + 5),
      processed: Math.floor(Math.random() * 10 + 3),
    }))
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive"
      case "medium": return "text-amber-500"
      default: return "text-muted-foreground"
    }
  }

  const quickActions = [
    { label: "Collection Queue", icon: Scan, href: "/samples/sample-collection-queue", color: "text-sky-600 dark:text-sky-400" },
    { label: "Enter Results", icon: FileText, href: "/results", color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Bulk Entry", icon: Beaker, href: "/results/bulk", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Processing Queue", icon: Activity, href: "/samples", color: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="relative">
        <div className="absolute -top-6 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent rounded-full" />
        <PageHeader
          title="Technician Dashboard"
          description="Welcome back, Ananya! Manage your samples and results."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: "Barcode Scanner", description: "Camera scanner would open here", variant: "default" })}>
                <Barcode className="mr-1 h-4 w-4" />
                Scan barcode
              </Button>
              <Button size="sm" asChild>
                <Link to="/results">
                  <Flask className="mr-1 h-4 w-4" />
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
          icon={<Beaker className="h-5 w-5" />}
          label="Assigned Samples"
          value={assignedSamples.length}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<Clock className="h-5 w-5" />}
          label="Pending Results"
          value={pendingResultsList.length}
          trend={{ value: 8, positive: false }}
        />
        <StatCard
          className="stat-highlight"
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed Today"
          value={completedToday}
          trend={{ value: 25, positive: true }}
        />
        <StatCard
          className="stat-highlight"
          icon={<CalendarDaysIcon className="h-5 w-5" />}
          label="Today's Collections"
          value={todayCollections.length}
          trend={{ value: 10, positive: true }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Sample Processing Queue</CardTitle>
              <CardDescription>Samples awaiting processing</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/samples">
                View all <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sampleQueue.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-8 w-8" />}
                title="All caught up!"
                description="No samples pending in your queue."
              />
            ) : (
              <div className="space-y-2">
                {sampleQueue.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:bg-accent hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        item.status === "received"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                          : item.status === "processing"
                            ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Beaker className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.patientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.testName}</p>
                      <p className="text-[10px] text-muted-foreground">Barcode: {item.barcode}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={sampleStatusVariant[item.status] || "default"} className="shrink-0 text-[10px]">
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                      <span className={cn("text-[10px] font-medium", getPriorityColor(item.priority))}>
                        {item.priority} priority
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Sample Status Overview</CardTitle>
            <CardDescription>Your sample processing status</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleStatusCounts.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-sm text-muted-foreground">
                <Beaker className="mb-2 h-8 w-8" />
                <p>No samples assigned.</p>
              </div>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        <filter id="pieShadowTech">
                          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
                        </filter>
                      </defs>
                      <Pie
                        data={sampleStatusCounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={68}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="var(--background)"
                      >
                        {sampleStatusCounts.map((_, idx) => (
                          <Cell key={idx} fill={PIECHART_COLORS[idx % PIECHART_COLORS.length]} filter="url(#pieShadowTech)" />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--border)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-1 space-y-1">
                  {sampleStatusCounts.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIECHART_COLORS[idx % PIECHART_COLORS.length] }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Rejected samples</span>
              <span className="font-medium text-destructive">
                {assignedSamples.filter((s) => s.status === "rejected").length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="card-hover lg:col-span-4">
          <CardHeader className="card-header-accent flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">Pending Results Entry</CardTitle>
              <CardDescription>Results that need to be entered or finalized</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/results">
                Enter results <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingResults.length === 0 ? (
              <EmptyState
                icon={<CheckCircle2 className="h-8 w-8" />}
                title="All results entered"
                description="All pending results have been submitted."
              />
            ) : (
              <div className="space-y-2">
                {pendingResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-all duration-200 hover:bg-accent hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.patientName}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.testName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.isCritical && (
                        <Badge variant="destructive" className="shrink-0 text-[10px]">
                          <AlertTriangle className="mr-0.5 h-3 w-3" />
                          Critical
                        </Badge>
                      )}
                      <Badge variant={resultStatusVariant[item.status] || "default"} className="shrink-0 text-[10px]">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-hover lg:col-span-3">
          <CardHeader className="card-header-accent">
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common technician tasks</CardDescription>
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
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Daily Stats</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Samples processed</span>
                <span className="font-medium">{completedToday}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg. processing time</span>
                <span className="font-medium">18 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Efficiency score</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function CalendarDaysIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
      <path d="M16 18h.01" />
    </svg>
  )
}
