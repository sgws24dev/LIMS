import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getRoles, getRoleById } from "@/services/api/roles"
import type { Role } from "@/types"
import { PageHeader } from "@/shared/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/shared/ui/table"
import { Badge } from "@/shared/ui/badge"
import { Check, X, Loader2, AlertCircle } from "lucide-react"

const MODULES = [
  "Users", "Roles", "Institutions", "Facilities",
  "Instruments", "Bookings", "Reports", "Settings",
]

const ACTIONS = ["View", "Create", "Edit", "Delete"] as const

export default function PermissionMatrix() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await getRoles()
        setRoles(data)
      } catch {
        setError("Failed to load roles.")
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  const getPermission = (role: Role, module: string, action: string) => {
    const perm = role.permissions?.find(p => p.module === module)
    if (!perm) return null
    switch (action) {
      case "View": return perm.canView
      case "Create": return perm.canCreate
      case "Edit": return perm.canEdit
      case "Delete": return perm.canDelete
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Matrix"
        description="View all roles and their permissions across modules."
      />
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Role</TableHead>
                {MODULES.map(module => (
                  <TableHead key={module} className="text-center min-w-[100px]" colSpan={4}>
                    {module}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                <TableHead />
                {MODULES.map(module => (
                  ACTIONS.map(action => (
                    <TableHead key={`${module}-${action}`} className="text-center text-xs font-normal px-1">
                      {action}
                    </TableHead>
                  ))
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map(role => (
                <TableRow
                  key={role.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/roles/${role.id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem && <Badge variant="outline" className="text-xs">System</Badge>}
                    </div>
                  </TableCell>
                  {MODULES.map(module => (
                    ACTIONS.map(action => {
                      const value = getPermission(role, module, action)
                      return (
                        <TableCell key={`${role.id}-${module}-${action}`} className="text-center px-1">
                          {value === true && <Check className="h-4 w-4 text-green-500 mx-auto" />}
                          {value === false && <X className="h-4 w-4 text-red-400 mx-auto" />}
                          {value === null && <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      )
                    })
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
