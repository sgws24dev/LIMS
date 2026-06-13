import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { getRoleById } from "@/services/api/roles"
import { ArrowLeft, Check, X, Pencil } from "lucide-react"
import type { Role, Permission } from "@/types"

export default function RoleDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Administration" },
      { label: "Roles", href: "/roles" },
      { label: "Role Details" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    loadRole()
  }, [id])

  async function loadRole() {
    setLoading(true)
    setError(null)
    try {
      const data = await getRoleById(id!)
      setRole(data)
    } catch {
      setError("Failed to load role details")
    } finally {
      setLoading(false)
    }
  }

  function renderCheck(value: boolean) {
    return value ? (
      <Check className="h-4 w-4 text-emerald-600" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground/40" />
    )
  }

  const actions = (
    <>
      <Button variant="outline" size="sm" onClick={() => navigate("/roles")}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back
      </Button>
      {role && !role.isSystem && (
        <Button size="sm" onClick={() => navigate(`/roles/${role.id}/edit`)}>
          <Pencil className="mr-1 h-4 w-4" /> Edit Role
        </Button>
      )}
    </>
  )

  return (
    <PageContainer
      title={role?.name ?? "Role Details"}
      description={role?.description}
      status={loading ? "loading" : error ? "error" : role ? "success" : "empty"}
      errorMessage={error ?? undefined}
      onRetry={loadRole}
      loadingType="detail"
      actions={actions}
    >
      {role && (
        <div className="space-y-6">
          <div className="grid gap-4 rounded-xl border p-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="mt-1 text-sm">{role.name}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <div className="mt-1">
                {role.isSystem ? (
                  <Badge variant="info">System</Badge>
                ) : (
                  <Badge variant="success">Custom</Badge>
                )}
              </div>
            </div>
            {role.description && (
              <div className="sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1 text-sm">{role.description}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted-foreground">Users</p>
              <p className="mt-1 text-sm">{role.userCount ?? 0}</p>
            </div>
          </div>

          <div className="rounded-xl border p-6">
            <h3 className="mb-4 text-lg font-semibold">Permissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Module</th>
                    <th className="pb-3 pr-4 font-medium">View</th>
                    <th className="pb-3 pr-4 font-medium">Create</th>
                    <th className="pb-3 pr-4 font-medium">Edit</th>
                    <th className="pb-3 font-medium">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {role.permissions.map((perm: Permission) => (
                    <tr key={perm.module} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{perm.module}</td>
                      <td className="py-3 pr-4">{renderCheck(perm.canView)}</td>
                      <td className="py-3 pr-4">{renderCheck(perm.canCreate)}</td>
                      <td className="py-3 pr-4">{renderCheck(perm.canEdit)}</td>
                      <td className="py-3">{renderCheck(perm.canDelete)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
