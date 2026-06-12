"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import type { Booking } from "@/types"
import { bookings as allBookings } from "@/mock/data/bookings"
import { branches } from "@/mock/data/branches"
import { tests } from "@/mock/data/tests"
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Syringe,
  UserCheck,
  Search,
  X,
  RotateCcw,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
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
} from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const statusBadge = (status: Booking["status"]) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
    pending: { label: "Pending", variant: "warning" },
    registered: { label: "Registered", variant: "secondary" },
    sample_collected: { label: "Sample Collected", variant: "default" },
    in_progress: { label: "In Progress", variant: "default" },
    completed: { label: "Completed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  }
  const s = map[status] ?? { label: status, variant: "outline" }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

const typeBadge = (type: Booking["type"]) => {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "warning" }> = {
    walkin: { label: "Walk-in", variant: "default" },
    existing: { label: "Existing", variant: "secondary" },
    corporate: { label: "Corporate", variant: "outline" },
    insurance: { label: "Insurance", variant: "warning" },
  }
  const t = map[type] ?? { label: type, variant: "outline" }
  return <Badge variant={t.variant}>{t.label}</Badge>
}

function BookingDetailCard({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const getTestName = (id: string) => tests.find((t) => t.id === id)?.name ?? id
  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name ?? id

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{booking.patientName}</h3>
            <p className="text-sm text-muted-foreground">Booking ID: {booking.id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Phone:</span> {booking.patientPhone}
          </div>
          <div>
            <span className="text-muted-foreground">Date:</span>{" "}
            {formatDate(booking.scheduledDate, "long")}
          </div>
          <div>
            <span className="text-muted-foreground">Branch:</span> {getBranchName(booking.branchId)}
          </div>
          <div>
            <span className="text-muted-foreground">Collection:</span>{" "}
            {booking.collectionType === "lab" ? "Lab" : "Home Collection"}
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>{" "}
            {formatCurrency(booking.totalAmount)}
          </div>
          <div>
            <span className="text-muted-foreground">Paid:</span>{" "}
            {formatCurrency(booking.paidAmount)}
          </div>
        </div>
        <div className="mt-3">
          <span className="text-sm font-medium">Tests:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {booking.tests.map((t) => (
              <Badge key={t} variant="outline">
                {getTestName(t)}
              </Badge>
            ))}
          </div>
        </div>
        {booking.notes && (
          <div className="mt-2 text-sm">
            <span className="text-muted-foreground">Notes:</span> {booking.notes}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function BookingsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [search, setSearch] = useState("")

  useEffect(() => {
    setBreadcrumbs([{ label: "Bookings" }])
  }, [])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const filtered = useMemo(() => {
    let data = [...allBookings]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        (b) =>
          b.id.toLowerCase().includes(q) ||
          b.patientName.toLowerCase().includes(q) ||
          b.patientPhone.includes(q)
      )
    }
    if (statusFilter !== "all") data = data.filter((b) => b.status === statusFilter)
    if (typeFilter !== "all") data = data.filter((b) => b.type === typeFilter)
    if (branchFilter !== "all") data = data.filter((b) => b.branchId === branchFilter)
    return data
  }, [search, statusFilter, typeFilter, branchFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleRegister = (id: string) => {
    toast({ title: "Booking Registered", description: `Booking ${id} has been registered.`, variant: "success" })
    navigate(`/bookings/${id}`)
  }

  const handleCollectSample = (id: string) => {
    toast({ title: "Sample Collection", description: `Sample collection initiated for ${id}.`, variant: "default" })
    navigate(`/bookings/${id}`)
  }

  const handleView = (id: string) => {
    navigate(`/bookings/${id}`)
  }

  const handleEdit = (id: string) => {
    navigate(`/bookings/${id}`)
  }

  const handleDelete = (id: string) => {
    toast({ title: "Booking Deleted", description: `Booking ${id} has been cancelled.`, variant: "destructive" })
  }

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Bookings" description="Manage patient bookings and registrations" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Bookings"
        description="Manage patient bookings and registrations"
        actions={
          <Button onClick={() => navigate("/bookings/walk-in")}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient/ID/phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="registered">Registered</SelectItem>
            <SelectItem value="sample_collected">Sample Collected</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="walkin">Walk-in</SelectItem>
            <SelectItem value="existing">Existing</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
          </SelectContent>
        </Select>
        <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setCurrentPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(search || statusFilter !== "all" || typeFilter !== "all" || branchFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("")
              setStatusFilter("all")
              setTypeFilter("all")
              setBranchFilter("all")
              setCurrentPage(1)
            }}
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {paginated.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No bookings found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <div className="space-y-2">
          {paginated.map((booking) => {
            const isExpanded = expandedId === booking.id
            return (
              <div key={booking.id}>
                <Card
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-accent/50",
                    isExpanded && "border-primary"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.patientName}</span>
                        <span className="text-xs text-muted-foreground">({booking.id})</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{booking.patientPhone}</span>
                        <span>{booking.tests.length} test(s)</span>
                        <span>{formatCurrency(booking.totalAmount)}</span>
                      </div>
                    </div>
                    <div className="hidden items-center gap-2 md:flex">
                      {statusBadge(booking.status)}
                      {typeBadge(booking.type)}
                    </div>
                    <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(booking.createdAt, "short")}
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <DropdownActionMenu
                        status={booking.status}
                        onRegister={() => handleRegister(booking.id)}
                        onCollectSample={() => handleCollectSample(booking.id)}
                        onView={() => handleView(booking.id)}
                        onEdit={() => handleEdit(booking.id)}
                        onDelete={() => handleDelete(booking.id)}
                      />
                    </div>
                    <div className="text-muted-foreground">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardContent>
                </Card>
                {isExpanded && (
                  <BookingDetailCard
                    booking={booking}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DropdownActionMenu({
  status,
  onRegister,
  onCollectSample,
  onView,
  onEdit,
  onDelete,
}: {
  status: Booking["status"]
  onRegister: () => void
  onCollectSample: () => void
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      {status === "pending" && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRegister} title="Register">
          <UserCheck className="h-4 w-4" />
        </Button>
      )}
      {status === "registered" && (
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCollectSample} title="Collect Sample">
          <Syringe className="h-4 w-4" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onView} title="View">
        <Eye className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Edit">
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onDelete} title="Cancel">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
