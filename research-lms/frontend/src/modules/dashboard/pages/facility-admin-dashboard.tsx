import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/shared/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { StatCard } from "@/shared/ui/stat-card"
import { Building2, Users, Wrench, DollarSign } from "lucide-react"

export default function FacilityAdminDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Facility Dashboard`}
        description={`Welcome, ${user?.firstName ?? "Admin"}`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Building2 className="h-6 w-6" />} label="Instruments" value={24} />
        <StatCard icon={<Users className="h-6 w-6" />} label="Active Users" value={156} />
        <StatCard icon={<Wrench className="h-6 w-6" />} label="Maintenance Due" value={3} />
        <StatCard icon={<DollarSign className="h-6 w-6" />} label="Revenue (MTD)" value="48.2K" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Instrument Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Instrument utilization charts will appear here.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Pending booking and request approvals will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
