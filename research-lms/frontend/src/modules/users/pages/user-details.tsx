import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { StatusBadge } from "@/shared/shared/status-badge"
import { getUserById } from "@/services/api/users"
import type { User } from "@/types"
import { ArrowLeft, Pencil, Loader2, Mail, Phone, Calendar, Shield, UserCircle } from "lucide-react"

export default function UserDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Users", href: "/users" }, { label: "User Details" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserById(id)
      .then(setUser)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <PageContainer title="User Details" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (notFound || !user) {
    return (
      <PageContainer title="User Details" description="User not found">
        <p className="text-sm text-muted-foreground">The requested user could not be found.</p>
      </PageContainer>
    )
  }

  const detailItems = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone || "—" },
    { icon: Calendar, label: "Created", value: new Date(user.createdAt).toLocaleDateString() },
    { icon: Calendar, label: "Last Login", value: user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "—" },
    { icon: Shield, label: "Tenant ID", value: user.tenantId },
  ]

  return (
    <PageContainer
      title={user.fullName}
      description="User details"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button size="sm" onClick={() => navigate(`/users/${user.id}/edit`)}>
            <Pencil className="mr-1 h-4 w-4" /> Edit
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={user.isActive ? "active" : "inactive"} />
                {user.isMfaEnabled && <StatusBadge status="info" />}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground min-w-[80px]">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
          <h4 className="font-medium">Assigned Roles</h4>
          <div className="flex flex-wrap gap-2">
            {user.role.map((r) => (
              <StatusBadge key={r} status={r} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
