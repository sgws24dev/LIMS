"use client"

import { useState, useMemo } from "react"
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  User,
  Bike,
  Car,
  CheckCircle2,
  Loader2,
  Navigation,
  Syringe,
  Home,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react"
import type { HCBooking } from "@/mock/data/home-collection"
import {
  homeCollectionBookings,
  homeCollectionAgents,
} from "@/mock/data/home-collection"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { SearchInput } from "@/components/ui/search-input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"

const bookingStatusStyles: Record<
  string,
  "secondary" | "warning" | "default" | "success" | "destructive"
> = {
  pending: "secondary",
  assigned: "warning",
  collected: "default",
  completed: "success",
  cancelled: "destructive",
}

const visitStatusSteps = [
  { key: "assigned", label: "Assigned", icon: User },
  { key: "en_route", label: "En Route", icon: Navigation },
  { key: "collecting", label: "Collecting", icon: Syringe },
  { key: "collected", label: "Collected", icon: CheckCircle2 },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
]

const timeSlots = [
  { value: "all", label: "All Slots" },
  { value: "morning", label: "Morning (6-9 AM)" },
  { value: "afternoon", label: "Afternoon (12-3 PM)" },
  { value: "evening", label: "Evening (4-7 PM)" },
]

function getAgentName(agentId?: string) {
  if (!agentId) return "Unassigned"
  return homeCollectionAgents.find((a) => a.id === agentId)?.name || "Unknown"
}

const vehicleIcons: Record<string, typeof Bike> = {
  bike: Bike,
  scooter: Bike,
  car: Car,
  van: Car,
}

function getTimeSlotValue(slot: string): string {
  switch (slot) {
    case "morning":
      return "morning"
    case "afternoon":
      return "afternoon"
    case "evening":
      return "evening"
    default:
      return slot
  }
}

export default function HomeCollection() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [agentFilter, setAgentFilter] = useState("all")
  const [timeSlotFilter, setTimeSlotFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<HCBooking | null>(null)
  const [assignmentOpen, setAssignmentOpen] = useState(false)
  const [assignAgentId, setAssignAgentId] = useState("")

  const filteredBookings = useMemo(() => {
    return homeCollectionBookings.filter((b) => {
      const matchesSearch =
        !search ||
        b.patientName.toLowerCase().includes(search.toLowerCase()) ||
        b.patientPhone.includes(search) ||
        b.address.toLowerCase().includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter
      const matchesAgent =
        agentFilter === "all" || b.agentId === agentFilter
      const matchesSlot =
        timeSlotFilter === "all" || getTimeSlotValue(b.timeSlot) === timeSlotFilter
      return matchesSearch && matchesStatus && matchesAgent && matchesSlot
    })
  }, [search, statusFilter, agentFilter, timeSlotFilter])

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayBookings = homeCollectionBookings.filter(
      (b) => b.scheduledDate === today || b.status !== "cancelled"
    ).length
    const assigned = homeCollectionBookings.filter(
      (b) => b.status === "assigned"
    ).length
    const completed = homeCollectionBookings.filter(
      (b) => b.status === "completed"
    ).length
    const pending = homeCollectionBookings.filter(
      (b) => b.status === "pending"
    ).length
    return { todayBookings, assigned, completed, pending }
  }, [])

  const bookingsByArea = useMemo(() => {
    const groups: Record<string, HCBooking[]> = {}
    filteredBookings.forEach((b) => {
      const city = b.city || "Other"
      if (!groups[city]) groups[city] = []
      groups[city].push(b)
    })
    return groups
  }, [filteredBookings])

  const handleAssignAgent = () => {
    if (!selectedBooking || !assignAgentId) return
    toast({
      title: "Agent Assigned",
      description: `${getAgentName(assignAgentId)} assigned to ${selectedBooking.patientName}`,
      variant: "success",
    })
    setAssignmentOpen(false)
  }

  const handleStatusUpdate = (
    booking: HCBooking,
    newStatus: HCBooking["status"]
  ) => {
    toast({
      title: "Status Updated",
      description: `${booking.patientName} moved to "${newStatus}"`,
      variant: "success",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home Collection"
        description="Manage home sample collection bookings and phlebotomist routing"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Today's Bookings"
          value={stats.todayBookings}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Assigned Agents"
          value={stats.assigned}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={stats.completed}
        />
        <StatCard
          icon={<AlertCircle className="h-5 w-5" />}
          label="Pending"
          value={stats.pending}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Live Tracking</CardTitle>
          <CardDescription>
            Real-time GPS positions of phlebotomists in the field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative h-64 overflow-hidden rounded-lg border bg-muted/30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] bg-repeat" />
            {homeCollectionAgents.filter((a) => a.isActive).map((agent, i) => {
              const VehicleIcon = vehicleIcons[agent.vehicleType] || Bike
              const positions = [
                { top: "15%", left: "20%" },
                { top: "25%", left: "60%" },
                { top: "55%", left: "30%" },
                { top: "65%", left: "70%" },
                { top: "40%", left: "80%" },
                { top: "75%", left: "40%" },
              ]
              const pos = positions[i % positions.length]
              return (
                <div
                  key={agent.id}
                  className="absolute z-10 flex flex-col items-center"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <div className="relative">
                    <div className="absolute -inset-2 animate-ping rounded-full bg-primary/20" />
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                      <VehicleIcon className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="mt-1 whitespace-nowrap rounded bg-background px-1.5 py-0.5 text-xs font-medium shadow-sm">
                    {agent.name.split(" ")[0]} ({agent.todayCollections})
                  </span>
                </div>
              )
            })}
            <div className="absolute bottom-3 left-3 rounded-lg bg-background/90 p-2 text-xs text-muted-foreground shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>
                  {homeCollectionAgents.filter((a) => a.isActive).length} agents
                  active
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search by patient, phone, or address..."
          value={search}
          onSearch={setSearch}
          className="w-72"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="collected">Collected</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {homeCollectionAgents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeSlotFilter} onValueChange={setTimeSlotFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time Slot" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {Object.keys(bookingsByArea).length === 0 ? (
        <EmptyState
          icon={<Home className="h-6 w-6" />}
          title="No home collection bookings found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(bookingsByArea).map(([city, bookings]) => (
            <Card key={city}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">{city}</CardTitle>
                  <Badge variant="secondary">{bookings.length} visits</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="divide-y rounded-md border">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {booking.patientName}
                          </span>
                          <Badge
                            variant={bookingStatusStyles[booking.status]}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {booking.address}
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {booking.patientPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.preferredTime || booking.timeSlot}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {booking.agentName || "Unassigned"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {booking.tests.map((test) => (
                            <Badge key={test} variant="outline" className="text-xs">
                              {test}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Dialog
                          open={
                            assignmentOpen &&
                            selectedBooking?.id === booking.id
                          }
                          onOpenChange={(open) => {
                            setAssignmentOpen(open)
                            if (open) setSelectedBooking(booking)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <User className="mr-1 h-3 w-3" />
                              Assign
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Phlebotomist</DialogTitle>
                              <DialogDescription>
                                Assign or reassign agent for{" "}
                                {booking.patientName}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label>Select Agent</Label>
                              <Select
                                value={assignAgentId}
                                onValueChange={setAssignAgentId}
                              >
                                <SelectTrigger className="mt-2">
                                  <SelectValue placeholder="Choose an agent" />
                                </SelectTrigger>
                                <SelectContent>
                                  {homeCollectionAgents
                                    .filter((a) => a.isActive)
                                    .map((a) => (
                                      <SelectItem key={a.id} value={a.id}>
                                        {a.name} ({a.area[0]}) -{" "}
                                        {a.todayCollections} today
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setAssignmentOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleAssignAgent}>
                                Assign
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {booking.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(booking, "assigned")
                            }
                          >
                            <ArrowRight className="mr-1 h-3 w-3" />
                            Assign & Start
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Visit Status Tracking</CardTitle>
          <CardDescription>
            Current stage of each home collection visit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        {booking.patientName}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {booking.agentName || "Unassigned"}
                      </span>
                    </div>
                    <Badge variant={bookingStatusStyles[booking.status]}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {visitStatusSteps.slice(0, 4).map((step, idx) => {
                      const statusOrder = [
                        "pending",
                        "assigned",
                        "collected",
                        "completed",
                      ]
                      const currentIdx = statusOrder.indexOf(booking.status)
                      const isActive = idx <= currentIdx
                      const isLast = idx === 3
                      const StepIcon = step.icon
                      return (
                        <div
                          key={step.key}
                          className="flex items-center gap-1"
                        >
                          <div
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <StepIcon className="h-3 w-3" />
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "h-0.5 w-8",
                                isActive && currentIdx > idx
                                  ? "bg-primary"
                                  : "bg-muted"
                              )}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
