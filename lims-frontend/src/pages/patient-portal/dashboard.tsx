"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FileText,
  CalendarClock,
  Users,
  Bell,
  ChevronRight,
  Microscope,
  Clock,
  Home,
  CreditCard,
  UserPlus,
  HeartPulse,
  AlertCircle,
  Pill,
  Activity,
  Droplets,
  ArrowRight,
  X,
  Menu,
} from "lucide-react"
import { cn, formatDate, formatCurrency, generateId } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { StatCard } from "@/components/ui/stat-card"
import { useToast } from "@/hooks/use-toast"

const patientInfo = {
  name: "Rajesh Sharma",
  email: "rajesh.sharma@email.com",
  phone: "+91 98765 43210",
  avatar: "/avatars/rajesh.jpg",
  memberSince: "Jan 2023",
}

const stats = [
  { icon: <Microscope className="h-5 w-5" />, label: "Total Tests Done", value: 48 },
  { icon: <Clock className="h-5 w-5" />, label: "Pending Reports", value: 2 },
  { icon: <CalendarClock className="h-5 w-5" />, label: "Upcoming Appointments", value: 1 },
  { icon: <Users className="h-5 w-5" />, label: "Family Members", value: 4 },
]

const recentReports = [
  { id: "RPT001", testName: "Complete Blood Count", date: "2026-06-08T10:30:00Z", status: "completed" as const },
  { id: "RPT002", testName: "Lipid Profile", date: "2026-06-08T10:30:00Z", status: "completed" as const },
  { id: "RPT003", testName: "Liver Function Test", date: "2026-06-05T09:00:00Z", status: "completed" as const },
  { id: "RPT004", testName: "HbA1c", date: "2026-06-01T08:00:00Z", status: "completed" as const },
  { id: "RPT005", testName: "Thyroid Profile", date: "2026-05-28T11:00:00Z", status: "pending" as const },
  { id: "RPT006", testName: "Vitamin D & B12", date: "2026-05-28T11:00:00Z", status: "pending" as const },
]

const quickActions = [
  { icon: <FileText className="h-5 w-5" />, label: "Book a Test", color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" },
  { icon: <FileText className="h-5 w-5" />, label: "View Reports", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" },
  { icon: <Users className="h-5 w-5" />, label: "Family Management", color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300" },
  { icon: <CreditCard className="h-5 w-5" />, label: "Payment History", color: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" },
]

const upcomingAppointments = [
  {
    id: "APT001",
    type: "Home Collection",
    date: "2026-06-15",
    time: "07:00 - 09:00",
    tests: ["Fasting Blood Sugar", "Lipid Profile"],
    address: "42, MG Road, Bangalore - 560001",
    status: "confirmed",
  },
]

const familyMembers = [
  { id: "FM001", name: "Suresh Sharma", relation: "Father", initials: "SS" },
  { id: "FM002", name: "Meena Sharma", relation: "Mother", initials: "MS" },
  { id: "FM003", name: "Rahul Sharma", relation: "Brother", initials: "RS" },
  { id: "FM004", name: "Anita Sharma", relation: "Wife", initials: "AS" },
]

const notifications = [
  { id: "N001", title: "Report Ready", message: "Your Complete Blood Count report is ready", time: "2 hours ago", read: false },
  { id: "N002", title: "Appointment Reminder", message: "Home Collection tomorrow at 7 AM", time: "5 hours ago", read: false },
  { id: "N003", title: "Health Insight", message: "Your HbA1c levels need attention", time: "1 day ago", read: true },
  { id: "N004", title: "Payment Receipt", message: "Payment of ₹2,500 confirmed", time: "2 days ago", read: true },
]

const healthInsights = {
  summary: "Your overall health markers show improvement compared to last quarter. Blood sugar levels are stabilizing with current medication. Continue your regular exercise routine.",
  highlights: [
    { label: "Blood Sugar", status: "stable", icon: <Droplets className="h-4 w-4" /> },
    { label: "Cholesterol", status: "needs-attention", icon: <Activity className="h-4 w-4" /> },
    { label: "Vitamin D", status: "low", icon: <Pill className="h-4 w-4" /> },
  ],
}

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "outline" }> = {
    completed: { label: "Completed", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
  }
  const s = map[status] ?? { label: status, variant: "outline" }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function PatientPortalDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationCount] = useState(notifications.filter((n) => !n.read).length)

  const handleViewReport = (id: string) => {
    toast({ title: "Opening Report", description: `Loading report ${id}`, variant: "default" })
  }

  const handleQuickAction = (label: string) => {
    if (label === "View Reports") {
      navigate("/patient-portal/reports")
    } else {
      toast({ title: label, description: `Navigating to ${label.toLowerCase()}...`, variant: "default" })
    }
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/10">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
              <AvatarImage src={patientInfo.avatar} alt={patientInfo.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(patientInfo.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome back, <span className="text-primary">{patientInfo.name.split(" ")[0]}</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Member since {patientInfo.memberSince} &middot; {patientInfo.phone}
              </p>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-full"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {notificationCount}
                </span>
              )}
            </Button>
            {showNotifications && (
              <Card className="absolute right-0 top-12 z-50 w-80 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                  <CardTitle className="text-base">Notifications</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotifications(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="max-h-72">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent",
                          !n.read && "bg-primary/5"
                        )}
                      >
                        <div className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-primary")} />
                        <div className="flex-1 space-y-0.5">
                          <p className={cn("text-sm", !n.read && "font-medium")}>{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className="cursor-pointer transition-all hover:shadow-md"
                onClick={() => handleQuickAction(action.label)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={cn("rounded-lg p-3", action.color)}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{action.label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Reports */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Your latest test reports</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/patient-portal/reports")}>
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{report.testName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(report.date, "short")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {statusBadge(report.status)}
                      {report.status === "completed" && (
                        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleViewReport(report.id)}>
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Upcoming Appointment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="rounded-full px-3">
                        <Home className="mr-1 h-3 w-3" />
                        {apt.type}
                      </Badge>
                      <Badge variant="secondary">{apt.status}</Badge>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{formatDate(apt.date, "long")}</p>
                      <p className="text-sm text-muted-foreground">{apt.time}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Tests:</p>
                      <div className="flex flex-wrap gap-1">
                        {apt.tests.map((test) => (
                          <Badge key={test} variant="outline" className="text-xs">
                            {test}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-xs text-muted-foreground">{apt.address}</p>
                    </div>
                    <Button className="w-full" size="sm">
                      <Home className="mr-2 h-4 w-4" />
                      Track Collection
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Health Insights */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Health Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{healthInsights.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {healthInsights.highlights.map((h) => {
                    const colorMap: Record<string, string> = {
                      stable: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
                      "needs-attention": "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
                      low: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                    }
                    return (
                      <div key={h.label} className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", colorMap[h.status])}>
                        {h.icon}
                        {h.label}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Family Members */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Family Members</h2>
            <Button variant="ghost" size="sm">
              <UserPlus className="mr-1 h-4 w-4" />
              Add Member
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {familyMembers.map((member) => (
              <Card key={member.id} className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.relation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
