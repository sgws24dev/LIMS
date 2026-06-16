import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/shared/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { StatCard } from "@/shared/ui/stat-card"
import { Calendar, FlaskConical, Clock, AlertCircle } from "lucide-react"

export default function ResearcherDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.firstName ?? "Researcher"}`}
        description="Your research dashboard"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Calendar className="h-6 w-6" />} label="My Bookings" value={12} />
        <StatCard icon={<FlaskConical className="h-6 w-6" />} label="Active Requests" value={3} />
        <StatCard icon={<Clock className="h-6 w-6" />} label="Pending Approvals" value={1} />
        <StatCard icon={<AlertCircle className="h-6 w-6" />} label="Overdue Returns" value={0} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your upcoming equipment bookings will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
