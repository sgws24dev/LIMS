"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Booking } from "@/types"
import { bookings as allBookings } from "@/mock/data/bookings"
import { formatDate, formatCurrency, cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import {
  Calendar,
  Download,
  FileText,
  TrendingUp,
  XCircle,
  ClipboardList,
  Clock,
  List,
  Layout,
  Search,
  RotateCcw,
} from "lucide-react"

const statusBadge = (status: Booking["status"]) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
    pending: { label: "Pending", variant: "warning" },
    registered: { label: "Registered", variant: "secondary" },
    sample_collected: { label: "Collected", variant: "default" },
    in_progress: { label: "In Progress", variant: "default" },
    completed: { label: "Completed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  }
  return <Badge variant={map[status]?.variant ?? "outline"}>{map[status]?.label ?? status}</Badge>
}

export default function BookingHistoryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Bookings", href: "/bookings" }, { label: "History" }])
  }, [])
  const [view, setView] = useState<"table" | "timeline">("table")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "name">("date")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const stats = useMemo(() => {
    const total = allBookings.length
    const thisMonth = allBookings.filter((b) => {
      const d = new Date(b.createdAt)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
    const cancelled = allBookings.filter((b) => b.status === "cancelled").length
    const avgValue = total > 0
      ? allBookings.reduce((s, b) => s + b.totalAmount, 0) / total
      : 0
    return { total, thisMonth, cancelled, avgValue }
  }, [])

  const filtered = useMemo(() => {
    let data = [...allBookings]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (b) =>
          b.patientName.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          b.patientPhone.includes(q)
      )
    }
    if (statusFilter !== "all") data = data.filter((b) => b.status === statusFilter)
    if (typeFilter !== "all") data = data.filter((b) => b.type === typeFilter)
    data.sort((a, b) => {
      let cmp = 0
      if (sortBy === "date") cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      else if (sortBy === "amount") cmp = a.totalAmount - b.totalAmount
      else cmp = a.patientName.localeCompare(b.patientName)
      return sortDir === "asc" ? cmp : -cmp
    })
    return data
  }, [search, statusFilter, typeFilter, sortBy, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleExport = () => {
    toast({ title: "Export Started", description: "Your booking history export is being prepared.", variant: "success" })
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Booking History" description="View complete booking history" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Booking History"
        description="View and analyze complete booking history"
        actions={
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={<ClipboardList className="h-5 w-5" />}
          label="Total Bookings"
          value={stats.total}
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="This Month"
          value={stats.thisMonth}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Cancelled"
          value={stats.cancelled}
          trend={{ value: 3, positive: false }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg Value"
          value={formatCurrency(Math.round(stats.avgValue))}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">History</CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as "table" | "timeline")} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="table" className="text-xs"><List className="mr-1 h-3 w-3" /> Table</TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs"><Layout className="mr-1 h-3 w-3" /> Timeline</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patient/ID/phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="sample_collected">Collected</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="walkin">Walk-in</SelectItem>
                <SelectItem value="existing">Existing</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "amount" | "name")}>
              <SelectTrigger className="w-[130px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="name">Patient Name</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            >
              {sortDir === "asc" ? "↑ Asc" : "↓ Desc"}
            </Button>
            {(search || statusFilter !== "all" || typeFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setCurrentPage(1) }}>
                <RotateCcw className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {view === "table" ? (
            <>
              {paginated.length === 0 ? (
                <EmptyState icon={<FileText className="h-6 w-6" />} title="No history found" description="No bookings match your current filters." />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Tests</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono text-xs">{b.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{b.patientName}</div>
                            <div className="text-xs text-muted-foreground">{b.patientPhone}</div>
                          </TableCell>
                          <TableCell>{b.tests.length} test(s)</TableCell>
                          <TableCell className="font-medium">{formatCurrency(b.totalAmount)}</TableCell>
                          <TableCell>{statusBadge(b.status)}</TableCell>
                          <TableCell><Badge variant="outline">{b.type}</Badge></TableCell>
                          <TableCell className="text-xs whitespace-nowrap">{formatDate(b.createdAt, "datetime")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {paginated.length === 0 ? (
                <EmptyState icon={<FileText className="h-6 w-6" />} title="No history found" description="No bookings match your current filters." />
              ) : (
                paginated.map((b) => (
                  <div key={b.id} className="relative flex gap-4 pl-6 pb-4 border-l-2 border-muted last:pb-0">
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-primary bg-background" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{b.patientName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(b.createdAt, "datetime")}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{b.id}</span>
                        <span>•</span>
                        <span>{b.tests.length} tests</span>
                        <span>•</span>
                        <span>{formatCurrency(b.totalAmount)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {statusBadge(b.status)}
                        <Badge variant="outline">{b.type}</Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>Page {safePage} of {totalPages}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
