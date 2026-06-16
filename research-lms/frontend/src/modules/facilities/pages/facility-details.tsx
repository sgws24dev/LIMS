import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/shared/status-badge"
import { getFacilityById, getRoomsByFacility, type Facility, type Room } from "@/services/api/facilities"
import { ArrowLeft, Pencil, Loader2, MapPin, Building2, DoorOpen, Users } from "lucide-react"

export default function FacilityDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [facility, setFacility] = useState<Facility | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Facilities", href: "/facilities" }, { label: "Facility Details" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      getFacilityById(id),
      getRoomsByFacility(id),
    ])
      .then(([facility, rooms]) => {
        setFacility(facility)
        setRooms(rooms)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <PageContainer title="Facility Details" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (notFound || !facility) {
    return (
      <PageContainer title="Facility Details" description="Facility not found">
        <p className="text-sm text-muted-foreground">The requested facility could not be found.</p>
      </PageContainer>
    )
  }

  const totalCapacity = rooms.reduce((sum, r) => sum + r.capacity, 0)
  const avgUtilization = rooms.length > 0
    ? Math.round(rooms.reduce((sum, r) => sum + r.utilization, 0) / rooms.length)
    : 0

  const detailItems = [
    { icon: Building2, label: "Type", value: facility.type },
    { icon: MapPin, label: "Location", value: facility.location || "—" },
    { icon: DoorOpen, label: "Rooms", value: rooms.length },
    { icon: Users, label: "Total Capacity", value: totalCapacity },
  ]

  return (
    <PageContainer
      title={facility.name}
      description="Facility details"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/facilities")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button size="sm" onClick={() => navigate(`/facilities/${facility.id}/edit`)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Overview</h3>
            <StatusBadge status={facility.isActive ? "active" : "inactive"} />
          </div>
          <div className="space-y-3">
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground min-w-[100px]">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
          <h4 className="font-medium">Rooms ({rooms.length})</h4>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">No rooms configured for this facility.</p>
          ) : (
            <div className="space-y-2">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{room.name}</span>
                    {room.roomNumber && (
                      <span className="text-muted-foreground">({room.roomNumber})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>Cap: {room.capacity}</span>
                    <span>{room.utilization}% utilized</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  )
}
