"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  Mail,
  MessageSquare,
  Send,
  Smartphone,
  CheckCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import type { Notification } from "@/types"
import { notifications } from "@/mock/data/notifications"
import { cn, formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@/components/ui/data-table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const notificationTypeIcons: Record<string, typeof Mail> = {
  email: Mail,
  sms: MessageSquare,
  whatsapp: Send,
  push: Smartphone,
}

const notificationTypeLabels: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  push: "Push",
}

const statusStyles: Record<string, "success" | "secondary" | "destructive"> = {
  sent: "success",
  pending: "secondary",
  failed: "destructive",
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

export default function NotificationCenter() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sendOpen, setSendOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: "push",
    title: "",
    message: "",
    recipient: "",
  })

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    if (activeTab === "unread") {
      filtered = filtered.filter((n) => n.readBy.length === 0)
    } else if (activeTab !== "all") {
      filtered = filtered.filter((n) => n.type === activeTab)
    }

    if (dateFilter !== "all") {
      const now = new Date()
      const days = dateFilter === "today" ? 1 : dateFilter === "week" ? 7 : 30
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((n) => new Date(n.sentAt) >= cutoff)
    }

    return filtered
  }, [activeTab, dateFilter])

  const stats = useMemo(() => {
    const unread = notifications.filter((n) => n.readBy.length === 0).length
    const today = new Date().toISOString().slice(0, 10)
    const sentToday = notifications.filter(
      (n) => n.sentAt.slice(0, 10) === today
    ).length
    const failed = notifications.filter((n) => n.status === "failed").length
    return {
      total: notifications.length,
      unread,
      sentToday,
      failed,
    }
  }, [])

  const typeDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    notifications.forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name: notificationTypeLabels[name] || name, value }))
  }, [])

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    notifications.forEach((n) => {
      counts[n.status] = (counts[n.status] || 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [])

  const handleMarkAllRead = () => {
    toast({
      title: "All notifications marked as read",
      variant: "success",
    })
  }

  const handleMarkRead = (id: string) => {
    toast({
      title: "Notification marked as read",
      variant: "success",
    })
  }

  const handleRetry = (notification: Notification) => {
    toast({
      title: "Retrying notification",
      description: notification.title,
      variant: "success",
    })
  }

  const handleSend = () => {
    toast({
      title: "Notification sent",
      description: formData.title,
      variant: "success",
    })
    setSendOpen(false)
    setFormData({ type: "push", title: "", message: "", recipient: "" })
  }

  const notificationLogColumns: ColumnDef<Notification>[] = [
    {
      id: "type",
      header: "Type",
      cell: (notification) => (
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "rounded p-1",
              notification.type === "email" && "text-blue-600",
              notification.type === "sms" && "text-green-600",
              notification.type === "whatsapp" && "text-emerald-600",
              notification.type === "push" && "text-purple-600"
            )}
          >
            {getTypeIcon(notification.type)}
          </div>
          <span className="text-xs text-muted-foreground">
            {notificationTypeLabels[notification.type]}
          </span>
        </div>
      ),
    },
    {
      id: "title",
      header: "Title",
      cell: (notification) => (
        <span className="font-medium text-sm">{notification.title}</span>
      ),
    },
    {
      id: "recipient",
      header: "Recipient",
      cell: (notification) => (
        <span className="text-xs text-muted-foreground">
          {notification.recipients.join(", ")}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (notification) => (
        <Badge variant={statusStyles[notification.status]}>
          {notification.status}
        </Badge>
      ),
    },
    {
      id: "sentAt",
      header: "Sent At",
      cell: (notification) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(notification.sentAt, "datetime")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      sortable: false,
      filterable: false,
      className: "w-[100px]",
      cell: (notification) => (
        <div className="flex items-center gap-1">
          {notification.status === "failed" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleRetry(notification)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {notification.readBy.length === 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleMarkRead(notification.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ]

  const getTypeIcon = (type: string) => {
    const Icon = notificationTypeIcons[type] || Bell
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notification Center"
        description="View and manage all system notifications"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleMarkAllRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
            <Dialog open={sendOpen} onOpenChange={setSendOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                  <DialogDescription>
                    Send a new notification to recipients
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="send-type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger id="send-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="push">Push</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="send-recipient">Recipient(s)</Label>
                    <Input
                      id="send-recipient"
                      value={formData.recipient}
                      onChange={(e) =>
                        setFormData({ ...formData, recipient: e.target.value })
                      }
                      placeholder="Email, phone, or user ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="send-title">Title</Label>
                    <Input
                      id="send-title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="send-message">Message</Label>
                    <Textarea
                      id="send-message"
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSendOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSend}>Send</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Bell className="h-5 w-5" />} label="Total Notifications" value={stats.total} />
        <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Unread" value={stats.unread} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Sent Today" value={stats.sentToday} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Failed" value={stats.failed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notification Distribution</CardTitle>
            <CardDescription>By type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                  >
                    {typeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>Sent, pending, and failed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <RechartsTooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {statusDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "sent"
                            ? "#10b981"
                            : entry.name === "failed"
                              ? "#ef4444"
                              : "#f59e0b"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="all">
                  All
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms">
                  <MessageSquare className="mr-1 h-3 w-3" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="whatsapp">
                  <Send className="mr-1 h-3 w-3" />
                  WhatsApp
                </TabsTrigger>
                <TabsTrigger value="push">
                  <Smartphone className="mr-1 h-3 w-3" />
                  Push
                </TabsTrigger>
              </TabsList>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {filteredNotifications.length === 0 ? (
                <EmptyState
                  icon={<Bell className="h-6 w-6" />}
                  title="No notifications"
                  description="No notifications match your current filters."
                />
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => {
                    const isExpanded = expandedId === notification.id
                    const isUnread = notification.readBy.length === 0
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "rounded-lg border p-4 transition-colors",
                          isUnread && "border-l-2 border-l-primary bg-muted/20"
                        )}
                      >
                        <div
                          className="flex cursor-pointer items-start justify-between"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : notification.id)
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={cn(
                                "mt-0.5 rounded-lg p-2",
                                notification.type === "email" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
                                notification.type === "sms" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
                                notification.type === "whatsapp" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
                                notification.type === "push" && "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
                              )}
                            >
                              {getTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    isUnread && "font-semibold"
                                  )}
                                >
                                  {notification.title}
                                </span>
                                {isUnread && (
                                  <span className="h-2 w-2 rounded-full bg-primary" />
                                )}
                                <Badge variant={statusStyles[notification.status]}>
                                  {notification.status}
                                </Badge>
                              </div>
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                {notification.message}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  {getTypeIcon(notification.type)}
                                  {notificationTypeLabels[notification.type]}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(notification.sentAt, "datetime")}
                                </span>
                                <span>
                                  {notification.recipients.length} recipient(s)
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleMarkRead(notification.id)
                                }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 border-t pt-3">
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                Recipients:
                              </span>
                              {notification.recipients.map((r) => (
                                <Badge key={r} variant="outline" className="text-xs">
                                  {r}
                                </Badge>
                              ))}
                            </div>
                            {notification.status === "failed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                onClick={() => handleRetry(notification)}
                              >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Retry
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DataTable columns={notificationLogColumns} data={notifications} pageSize={10} exportable />
    </div>
  )
}
