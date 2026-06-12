"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Edit,
  XCircle,
  Syringe,
  ArrowLeft,
  IndianRupee,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Hash,
  Tag,
} from "lucide-react"
import type { Booking, Patient } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { bookings } from "@/mock/data/bookings"
import { patients } from "@/mock/data/patients"
import { tests, testPackages } from "@/mock/data/tests"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"

const timelineIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Loader2,
  pending: AlertCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, string> = {
  completed: "text-emerald-500",
  in_progress: "text-amber-500",
  pending: "text-muted-foreground",
  cancelled: "text-destructive",
  registered: "text-blue-500",
  sample_collected: "text-violet-500",
}

const timelineData: { label: string; status: string; date: string }[] = [
  { label: "Booking Created", status: "completed", date: "2026-06-10T08:00:00Z" },
  { label: "Sample Collected", status: "completed", date: "2026-06-10T08:30:00Z" },
  { label: "Sample Received at Lab", status: "completed", date: "2026-06-10T09:15:00Z" },
  { label: "Testing in Progress", status: "in_progress", date: "2026-06-10T10:00:00Z" },
  { label: "Report Ready", status: "pending", date: "" },
]

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()

  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const booking = useMemo(
    () => bookings.find((b: Booking) => b.id === id) ?? null,
    [id]
  )

  const patient = useMemo(
    () => patients.find((p: Patient) => p.id === booking?.patientId) ?? null,
    [booking]
  )

  const resolvedTests = useMemo(() => {
    if (!booking) return []
    const result: { id: string; name: string; price: number }[] = []
    for (const testId of booking.tests) {
      const t = tests.find((t) => t.id === testId)
      if (t) {
        result.push({ id: t.id, name: t.name, price: t.price })
        continue
      }
      const pkg = testPackages.find((p) => p.id === testId)
      if (pkg) {
        result.push({ id: pkg.id, name: pkg.name, price: pkg.price })
      }
    }
    return result
  }, [booking])

  const totalOfTests = useMemo(
    () => resolvedTests.reduce((sum, t) => sum + t.price, 0),
    [resolvedTests]
  )

  useEffect(() => {
    setBreadcrumbs([
      { label: "Bookings", href: "/bookings" },
      { label: "Booking Details" },
    ])
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Booking Not Found"
          description="The booking you are looking for does not exist."
          actions={
            <Button variant="outline" onClick={() => navigate("/bookings")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          }
        />
        <ErrorState
          title="Booking not found"
          message={`No booking found with ID "${id}". It may have been removed or the link is incorrect.`}
        />
      </div>
    )
  }

  const dueAmount = booking.totalAmount - booking.paidAmount

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${booking.id} - ${booking.patientName}`}
        description={`${booking.status.replace(/_/g, " ")} · ${booking.type} · ${formatDate(booking.scheduledDate, "long")}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/bookings")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/bookings")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Booking
            </Button>
            {booking.status !== "cancelled" && booking.status !== "completed" && (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Booking
              </Button>
            )}
            <Button onClick={() => navigate("/samples/register")}>
              <Syringe className="mr-2 h-4 w-4" />
              Register Sample
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-muted-foreground" />
              Booking Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Booking ID</p>
                <p className="font-medium">{booking.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <StatusBadge status={booking.status} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Booking Date</p>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-medium">
                    {formatDate(booking.createdAt, "long")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled Date</p>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-medium">
                    {formatDate(booking.scheduledDate, "long")}
                    {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <Badge variant="outline" className="capitalize mt-0.5">
                  {booking.type}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Collection</p>
                <Badge variant="outline" className="capitalize mt-0.5">
                  {booking.collectionType === "home" ? "Home Collection" : "Lab Visit"}
                </Badge>
              </div>
            </div>
            {booking.barcode && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Barcode</p>
                  <p className="font-mono text-sm">{booking.barcode}</p>
                </div>
              </>
            )}
            {booking.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Patient Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium text-lg">{patient.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{patient.email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-medium capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="font-medium">{patient.city}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">State</p>
                  <p className="font-medium">{patient.state}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium text-lg">{booking.patientName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{booking.patientPhone}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-muted-foreground" />
              Selected Tests ({resolvedTests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resolvedTests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tests found.</p>
            ) : (
              <div className="divide-y">
                {resolvedTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <p className="text-sm font-medium">{test.name}</p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatCurrency(test.price)}
                    </p>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex items-center justify-between pt-1">
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-sm font-bold">
                    {formatCurrency(totalOfTests)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-muted-foreground" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Discount</p>
                <p className="font-medium text-muted-foreground">
                  {formatCurrency(0)}
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Net Amount</p>
                <p className="font-semibold">
                  {formatCurrency(booking.totalAmount)}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Paid Amount</p>
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(booking.paidAmount)}
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Due Amount</p>
                <p
                  className={`font-bold text-lg ${
                    dueAmount > 0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {formatCurrency(dueAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-0">
            {timelineData.map((item, index) => {
              const TimelineIcon = timelineIcons[item.status] || Clock
              return (
                <div key={index} className="flex gap-4 pb-8 last:pb-0 relative">
                  {index < timelineData.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      item.status === "completed"
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
                        : item.status === "in_progress"
                          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                          : "border-muted bg-muted"
                    }`}
                  >
                    <TimelineIcon
                      className={`h-4 w-4 ${
                        statusColors[item.status] || "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.date && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date, "datetime")}
                      </p>
                    )}
                    {!item.date && item.status === "pending" && (
                      <p className="text-xs text-muted-foreground">Pending</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={() => {
          toast({ title: "Booking Cancelled", description: `Booking ${booking.id} has been cancelled.`, variant: "destructive" })
          setShowCancelDialog(false)
        }}
      />
    </div>
  )
}
