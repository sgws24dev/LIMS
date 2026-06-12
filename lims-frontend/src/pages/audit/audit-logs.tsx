"use client"

import { useState, useMemo, useCallback } from "react"
import {
  Shield, Download, Filter, Search, Clock, AlertTriangle,
  LogIn, LogOut, Eye, UserCheck, Radio, Globe, MapPin,
  Activity, Ban, KeyRound, SearchX,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { SearchInput } from "@/components/ui/search-input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface AuditLog {
  id: string
  timestamp: string
  user: string
  userRole: string
  action: "created" | "updated" | "deleted" | "viewed" | "login" | "logout"
  module: string
  description: string
  ipAddress: string
  status: "success" | "failure" | "warning"
  severity: "low" | "medium" | "high" | "critical"
}

const generateLogs = (count: number): AuditLog[] => {
  const users = [
    { name: "Dr. Rajesh Mehta", role: "lab_admin" },
    { name: "Priya Sharma", role: "technician" },
    { name: "Amit Kumar", role: "branch_manager" },
    { name: "Sneha Patel", role: "receptionist" },
    { name: "Vikram Singh", role: "super_admin" },
    { name: "Neha Gupta", role: "billing" },
    { name: "Unknown", role: "unknown" },
  ]
  const actions: AuditLog["action"][] = ["created", "updated", "deleted", "viewed", "login", "logout"]
  const modules = ["Patients", "Tests", "Results", "Bookings", "Users", "Settings", "Billing", "Reports", "Instruments", "Inventory"]
  const descriptions = [
    "Created new patient record", "Updated test results", "Deleted booking",
    "Viewed patient history", "User logged in", "User logged out",
    "Modified system settings", "Generated monthly report", "Updated inventory count",
    "Failed login attempt", "Unauthorized access attempt", "Password changed",
    "Approved test results", "Assigned sample to technician",
  ]
  const actionsWithDescriptions: Record<AuditLog["action"], string[]> = {
    created: ["Created new patient record", "Created new booking", "Created new test order", "Added new user"],
    updated: ["Updated patient details", "Modified test results", "Updated booking status", "Changed system settings"],
    deleted: ["Deleted patient record", "Removed test from catalog", "Cancelled booking", "Removed user"],
    viewed: ["Viewed patient reports", "Accessed audit logs", "Viewed financial reports", "Checked instrument status"],
    login: ["User logged in", "Successful login from new IP"],
    logout: ["User logged out", "Session expired"],
  }

  const logs: AuditLog[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[Math.floor(Math.random() * actions.length)]
    const module = modules[Math.floor(Math.random() * modules.length)]
    const actionDescs = actionsWithDescriptions[action]
    const description = actionDescs[Math.floor(Math.random() * actionDescs.length)]
    const isFailure = action === "login" && Math.random() > 0.7
    const isWarning = action === "updated" && Math.random() > 0.8
    const d = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    const severities: AuditLog["severity"][] = ["low", "low", "medium", "high", "critical"]
    logs.push({
      id: `AUD-${String(i + 1).padStart(4, "0")}`,
      timestamp: d.toISOString(),
      user: user.name,
      userRole: user.role,
      action,
      module,
      description,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      status: isFailure ? "failure" : isWarning ? "warning" : "success",
      severity: isFailure ? "critical" : isWarning ? "medium" : severities[Math.floor(Math.random() * severities.length)],
    })
  }
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const allLogs = generateLogs(150)

const actionIcons: Record<AuditLog["action"], React.ReactNode> = {
  created: <Badge variant="success">Created</Badge>,
  updated: <Badge variant="warning">Updated</Badge>,
  deleted: <Badge variant="destructive">Deleted</Badge>,
  viewed: <Badge variant="secondary">Viewed</Badge>,
  login: <Badge variant="default">Login</Badge>,
  logout: <Badge variant="outline">Logout</Badge>,
}

const statusIcons: Record<AuditLog["status"], React.ReactNode> = {
  success: <div className="h-2 w-2 rounded-full bg-emerald-500" />,
  failure: <div className="h-2 w-2 rounded-full bg-destructive" />,
  warning: <div className="h-2 w-2 rounded-full bg-amber-500" />,
}

const severityColors: Record<AuditLog["severity"], "success" | "warning" | "destructive" | "default"> = {
  low: "success",
  medium: "warning",
  high: "destructive",
  critical: "destructive",
}

const modules = [...new Set(allLogs.map((l) => l.module))]

const securityEvents: AuditLog[] = allLogs.filter(
  (l) => l.status === "failure" || l.severity === "critical" || l.severity === "high"
)

const currentSessions = [
  { user: "Dr. Rajesh Mehta", role: "Lab Admin", ip: "192.168.1.100", loginTime: "2026-06-11T08:30:00Z", location: "Mumbai, IN", device: "Chrome / Windows" },
  { user: "Priya Sharma", role: "Technician", ip: "192.168.1.102", loginTime: "2026-06-11T09:15:00Z", location: "Mumbai, IN", device: "Chrome / macOS" },
  { user: "Amit Kumar", role: "Branch Manager", ip: "192.168.2.50", loginTime: "2026-06-11T08:45:00Z", location: "Delhi, IN", device: "Firefox / Windows" },
  { user: "Sneha Patel", role: "Receptionist", ip: "192.168.1.105", loginTime: "2026-06-11T09:00:00Z", location: "Mumbai, IN", device: "Edge / Windows" },
  { user: "Neha Gupta", role: "Billing", ip: "192.168.1.108", loginTime: "2026-06-11T09:30:00Z", location: "Mumbai, IN", device: "Chrome / Windows" },
]

const getActionLabel = (action: AuditLog["action"]) => {
  const labels: Record<string, string> = {
    created: "Created", updated: "Updated", deleted: "Deleted",
    viewed: "Viewed", login: "Login", logout: "Logout",
  }
  return labels[action] || action
}

export default function AuditLogs() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [userFilter, setUserFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")
  const [moduleFilter, setModuleFilter] = useState("all")
  const [tab, setTab] = useState("all")

  const users = useMemo(() => [...new Set(allLogs.map((l) => l.user))], [])
  const actions = useMemo(() => [...new Set(allLogs.map((l) => l.action))], [])

  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      if (tab === "security") return securityEvents.includes(log)
      if (tab === "user-activity") return ["created", "updated", "deleted", "viewed"].includes(log.action)
      if (tab === "access") return ["login", "logout"].includes(log.action)
      return true
    }).filter((log) => {
      const matchesSearch = !search ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.module.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase()) ||
        log.ipAddress.includes(search)
      const matchesUser = userFilter === "all" || log.user === userFilter
      const matchesAction = actionFilter === "all" || log.action === actionFilter
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter
      return matchesSearch && matchesUser && matchesAction && matchesModule
    })
  }, [search, userFilter, actionFilter, moduleFilter, tab])

  const securityFiltered = useMemo(() => {
    return securityEvents.filter((log) => {
      const matchesSearch = !search ||
        log.user.toLowerCase().includes(search.toLowerCase()) ||
        log.description.toLowerCase().includes(search.toLowerCase())
      const matchesUser = userFilter === "all" || log.user === userFilter
      const matchesAction = actionFilter === "all" || log.action === actionFilter
      const matchesModule = moduleFilter === "all" || log.module === moduleFilter
      return matchesSearch && matchesUser && matchesAction && matchesModule
    })
  }, [search, userFilter, actionFilter, moduleFilter])

  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayEvents = allLogs.filter((l) => new Date(l.timestamp).toDateString() === today)
    return {
      totalToday: todayEvents.length,
      securityToday: todayEvents.filter((l) => l.status === "failure" || l.severity === "critical").length,
      activeSessions: currentSessions.length,
      loginAttempts: todayEvents.filter((l) => l.action === "login").length,
    }
  }, [])

  const handleExport = useCallback(() => {
    toast({ title: "Export started", description: "Audit logs will be exported as CSV.", variant: "success" })
  }, [toast])

  const columns: ColumnDef<AuditLog>[] = [
    {
      id: "timestamp",
      header: "Timestamp",
      accessorKey: "timestamp",
      cell: (row) => <span className="whitespace-nowrap text-sm">{formatDate(row.timestamp, "datetime")}</span>,
    },
    {
      id: "user",
      header: "User",
      accessorKey: "user",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.user}</span>
        </div>
      ),
    },
    {
      id: "action",
      header: "Action",
      accessorKey: "action",
      cell: (row) => actionIcons[row.action] || <Badge>{row.action}</Badge>,
    },
    {
      id: "module",
      header: "Module",
      accessorKey: "module",
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
      className: "max-w-xs truncate",
    },
    {
      id: "ipAddress",
      header: "IP Address",
      accessorKey: "ipAddress",
      cell: (row) => <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{row.ipAddress}</code>,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {statusIcons[row.status]}
          <span className="text-sm capitalize">{row.status}</span>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit & Compliance"
        description="Real-time audit trail and compliance monitoring for HIPAA / NABL"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs">
              <Radio className="h-3 w-3 animate-pulse text-emerald-500" />
              <span className="text-muted-foreground">Live</span>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export Logs
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Events Today" value={stats.totalToday} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Security Events" value={stats.securityToday} icon={<Shield className="h-5 w-5" />} trend={{ value: 12, positive: false }} />
        <StatCard label="Active Sessions" value={stats.activeSessions} icon={<UserCheck className="h-5 w-5" />} />
        <StatCard label="Login Attempts" value={stats.loginAttempts} icon={<LogIn className="h-5 w-5" />} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="access">Access Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by user, module, description or IP..."
              value={search}
              onSearch={setSearch}
              className="w-72"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{getActionLabel(a)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredLogs.length === 0 ? (
            <EmptyState icon={<SearchX className="h-8 w-8" />} title="No logs found" description="No audit logs match your current filters." />
          ) : (
            <DataTable columns={columns} data={filteredLogs as any} pageSize={15} exportable />
          )}
        </TabsContent>

        <TabsContent value="user-activity" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search activities..."
              value={search}
              onSearch={setSearch}
              className="w-72"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {modules.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {filteredLogs.length === 0 ? (
            <EmptyState icon={<SearchX className="h-8 w-8" />} title="No activity found" description="No user activity matches your current filters." />
          ) : (
            <DataTable columns={columns} data={filteredLogs as any} pageSize={15} exportable />
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search security events..."
              value={search}
              onSearch={setSearch}
              className="w-72"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a}>{getActionLabel(a)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Security Incident Report</CardTitle>
                <Badge variant="destructive">{securityFiltered.length} Events</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {securityFiltered.length === 0 ? (
                <div className="p-6">
                  <EmptyState icon={<Shield className="h-8 w-8" />} title="No security events" description="No security incidents match your current filters." />
                </div>
              ) : (
                <DataTable columns={columns} data={securityFiltered as any} pageSize={10} exportable />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {currentSessions.map((session, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
                        <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{session.user}</p>
                        <p className="text-xs text-muted-foreground">{session.role}</p>
                      </div>
                    </div>
                    <div className="hidden items-center gap-4 md:flex">
                      <div className="text-xs text-muted-foreground">
                        <span className="block">{session.ip}</span>
                        <span className="block">{session.device}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Logged in {formatDate(session.loginTime, "time")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-emerald-600">Active</span>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive">
                        <Ban className="mr-1 h-3 w-3" />
                        Terminate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Session Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Globe className="h-8 w-8" />
                  <span className="text-sm">Map View (geolocation tracking)</span>
                  <span className="text-xs">Mumbai | Delhi | Bangalore</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
