"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Check, X } from "lucide-react"
import type { Role, Permission } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getRoles } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"

const actions = [
  { key: "canView", label: "View" },
  { key: "canCreate", label: "Create" },
  { key: "canEdit", label: "Edit" },
  { key: "canDelete", label: "Delete" },
] as const

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  lab_admin: "Lab Admin",
  branch_manager: "Branch Manager",
  technician: "Technician",
  doctor: "Doctor",
  receptionist: "Receptionist",
  phlebotomist: "Phlebotomist",
  billing: "Billing",
}

export default function PermissionMatrix() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [permissions, setPermissions] = useState<Record<string, Record<string, Permission>>>({})
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)

  useEffect(() => {
    getRoles().then((data) => {
      setRoles(data)
      const permMap: Record<string, Record<string, Permission>> = {}
      data.forEach((role) => {
        permMap[role.id] = {}
        role.permissions.forEach((p) => {
          permMap[role.id][p.module] = { ...p }
        })
      })
      setPermissions(permMap)
      setLoading(false)
    })
  }, [])

  const togglePermission = (
    roleId: string,
    module: string,
    action: keyof Permission
  ) => {
    setPermissions((prev) => {
      const updated = { ...prev }
      const rolePerms = { ...updated[roleId] }
      rolePerms[module] = {
        ...rolePerms[module],
        [action]: !rolePerms[module][action],
      }
      updated[roleId] = rolePerms
      return updated
    })
  }

  const allModules = roles.length > 0 ? roles[0].permissions.map((p) => p.module) : []

  const handleSave = () => {
    toast({ title: "Permissions updated successfully", variant: "success" })
    setSaveDialogOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Permission Matrix"
        description="Configure module permissions for each role"
        actions={
          <Button variant="outline" onClick={() => navigate("/roles")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Roles
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-0">
          <CardTitle>Module × Action × Role Matrix</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto pt-4">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 bg-card px-3 py-2 text-left font-medium text-muted-foreground">
                  Module
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    colSpan={4}
                    className="border-b px-1 pb-2 text-center text-xs font-medium text-muted-foreground"
                  >
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[role.name] || role.name}
                    </Badge>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="sticky left-0 bg-card" />
                {roles.map((role) =>
                  actions.map((action) => (
                    <th
                      key={`${role.id}-${action.key}`}
                      className="border-b px-1 pb-2 text-center text-xs text-muted-foreground"
                    >
                      {action.label}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody>
              {allModules.map((module) => (
                <tr key={module} className="hover:bg-muted/30">
                  <td className="sticky left-0 bg-card px-3 py-2.5 text-sm font-medium">
                    {module}
                  </td>
                  {roles.map((role) =>
                    actions.map((action) => {
                      const perm = permissions[role.id]?.[module]
                      const checked = perm?.[action.key] ?? false
                      return (
                        <td key={`${role.id}-${module}-${action.key}`} className="px-1 py-2 text-center">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() =>
                              togglePermission(role.id, module, action.key)
                            }
                            aria-label={`${module} ${action.label} - ${roleLabels[role.name] || role.name}`}
                          />
                        </td>
                      )
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Changes</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the permission matrix? This will affect
                what all users in each role can access.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Permissions</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
