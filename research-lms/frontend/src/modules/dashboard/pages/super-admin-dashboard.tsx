import { useEffect, useState } from "react"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/shared/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { StatCard } from "@/shared/ui/stat-card"
import { Skeleton } from "@/shared/ui/skeleton"
import { Users, Building2, FlaskConical, DollarSign, Activity, CalendarCheck, ShieldAlert } from "lucide-react"
import { getUsers } from "@/services/api/users"
import { getTenants } from "@/services/api/tenants"
import { getRoles } from "@/services/api/roles"

export default function SuperAdminDashboard() {
  const { setBreadcrumbs } = useUIStore()

  const [userCount, setUserCount] = useState<number | null>(null)
  const [tenantCount, setTenantCount] = useState<number | null>(null)
  const [roleCount, setRoleCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        const [usersRes, tenantsRes, rolesRes] = await Promise.all([
          getUsers({ page: 1, pageSize: 1 }),
          getTenants(),
          getRoles(),
        ])
        if (cancelled) return
        setUserCount(usersRes.totalCount)
        setTenantCount(tenantsRes.length)
        setRoleCount(rolesRes.length)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Failed to load dashboard data")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of the Research LMS platform" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="h-10 w-10 text-destructive mb-3" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of the Research LMS platform" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {loading ? (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard icon={<Building2 className="h-4 w-4" />} label="Institutions" value={tenantCount ?? 0} />
            <StatCard icon={<Users className="h-4 w-4" />} label="Active Users" value={userCount ?? 0} />
            <StatCard icon={<Building2 className="h-4 w-4" />} label="Roles" value={roleCount ?? 0} />
            <StatCard icon={<FlaskConical className="h-4 w-4" />} label="Active Projects" value={86} trend={{ value: 5, positive: true }} />
            <StatCard icon={<CalendarCheck className="h-4 w-4" />} label="Bookings Today" value={34} trend={{ value: 3, positive: false }} />
            <StatCard icon={<Activity className="h-4 w-4" />} label="Utilization" value="78%" trend={{ value: 4, positive: true }} />
            <StatCard icon={<DollarSign className="h-4 w-4" />} label="Revenue (MTD)" value="₹2.4M" trend={{ value: 15, positive: true }} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Activity feed coming soon.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Quick actions coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
