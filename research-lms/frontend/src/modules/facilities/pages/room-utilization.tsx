import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { getFacilities, getRoomsByFacility, type Facility, type Room } from "@/services/api/facilities"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select"

interface RoomWithUtilization extends Room {
  facilityName: string
}

export default function RoomUtilizationPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [rooms, setRooms] = useState<RoomWithUtilization[]>([])
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Room Utilization" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    setLoading(true)
    getFacilities({ page: 1, pageSize: 100 })
      .then((result) => setFacilities(result.items))
      .catch(() => setError("Failed to load facilities."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedFacilityId) {
      setRooms([])
      return
    }
    setLoadingRooms(true)
    getRoomsByFacility(selectedFacilityId)
      .then((data) => {
        const facilityName = facilities.find((f) => f.id === selectedFacilityId)?.name ?? ""
        setRooms(data.map((r) => ({ ...r, facilityName })))
      })
      .catch(() => setError("Failed to load rooms."))
      .finally(() => setLoadingRooms(false))
  }, [selectedFacilityId, facilities])

  const utilizationColor = (value: number) => {
    if (value >= 80) return "bg-red-500"
    if (value >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  return (
    <PageContainer
      title="Room Utilization"
      description="View room capacity and usage across facilities"
      status={error ? "error" : loading ? "loading" : "success"}
      errorMessage={error ?? undefined}
      onRetry={() => window.location.reload()}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/facilities")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Facilities
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="max-w-xs">
          <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a facility..." />
            </SelectTrigger>
            <SelectContent>
              {facilities.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!selectedFacilityId && !loading && (
          <p className="text-sm text-muted-foreground">Select a facility above to view room utilization.</p>
        )}

        {loadingRooms && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loadingRooms && rooms.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
              <h3 className="text-lg font-semibold mb-4">Utilization Overview</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{room.name}</p>
                        {room.roomNumber && (
                          <p className="text-xs text-muted-foreground">{room.roomNumber}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold">{room.utilization}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-2 rounded-full transition-all ${utilizationColor(room.utilization)}`}
                        style={{ width: `${Math.min(room.utilization, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Type: {room.roomType || "N/A"}</span>
                      <span>Capacity: {room.capacity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loadingRooms && selectedFacilityId && rooms.length === 0 && (
          <p className="text-sm text-muted-foreground">No rooms found for the selected facility.</p>
        )}
      </div>
    </PageContainer>
  )
}
