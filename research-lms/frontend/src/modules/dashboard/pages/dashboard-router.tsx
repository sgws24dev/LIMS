import { useAuthStore } from "@/store/authStore"
import type { User } from "@/types"
import SuperAdminDashboard from "./super-admin-dashboard"
import FacilityAdminDashboard from "./facility-admin-dashboard"
import PiDashboard from "./pi-dashboard"
import ResearcherDashboard from "./researcher-dashboard"

const DASHBOARD_MAP: Record<string, React.ComponentType> = {
  "System Administrator": SuperAdminDashboard,
  "Institution Admin": FacilityAdminDashboard,
  "Facility Admin": FacilityAdminDashboard,
  "Lab Admin": FacilityAdminDashboard,
  "Principal Investigator": PiDashboard,
  "PI": PiDashboard,
  "Trainer": FacilityAdminDashboard,
  "Researcher": ResearcherDashboard,
  "Student": ResearcherDashboard,
  "Technician": FacilityAdminDashboard,
  "Billing Admin": FacilityAdminDashboard,
}

function getPrimaryRole(user: User | null): string {
  if (!user) return "Researcher"
  if (user.roleName) return user.roleName
  if (Array.isArray(user.role) && user.role.length > 0) return user.role[0]
  return "Researcher"
}

export default function DashboardRouter() {
  const user = useAuthStore((s) => s.user)
  const primaryRole = getPrimaryRole(user)
  const Dashboard = DASHBOARD_MAP[primaryRole] ?? SuperAdminDashboard
  return <Dashboard />
}
