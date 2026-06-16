import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/shared/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { StatCard } from "@/shared/ui/stat-card"
import { Users, FlaskConical, Clock, TrendingUp } from "lucide-react"

export default function PiDashboard() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`PI Dashboard`}
        description={`Welcome, ${user?.firstName ?? "PI"}`}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-6 w-6" />} label="Group Members" value={8} />
        <StatCard icon={<FlaskConical className="h-6 w-6" />} label="Active Projects" value={3} />
        <StatCard icon={<Clock className="h-6 w-6" />} label="Pending Approvals" value={2} />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Usage (This Month)" value="342h" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Group Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Your group's recent activity and usage metrics will appear here.</p>
        </CardContent>
      </Card>
    </div>
  )
}
