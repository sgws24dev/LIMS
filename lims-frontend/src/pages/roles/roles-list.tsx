"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Users, ChevronDown, ChevronUp, Lock } from "lucide-react"
import type { Role } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getRoles } from "@/mock/services"
import { useAppStore } from "@/store/appStore"

const roleColors: Record<string, string> = {
  super_admin: "destructive",
  lab_admin: "default",
  branch_manager: "warning",
  technician: "secondary",
  doctor: "success",
  receptionist: "secondary",
  phlebotomist: "secondary",
  billing: "secondary",
}

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

export default function RolesList() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setBreadcrumbs([{ label: "Roles & Permissions" }])
  }, [])

  useEffect(() => {
    getRoles().then((data) => {
      setRoles(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and their permissions"
        actions={
          <Button onClick={() => navigate("/roles/permission-matrix")}>
            <Lock className="mr-2 h-4 w-4" />
            Permission Matrix
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const totalPerms = role.permissions.length
          const viewPerms = role.permissions.filter((p) => p.canView).length
          const createPerms = role.permissions.filter((p) => p.canCreate).length
          const editPerms = role.permissions.filter((p) => p.canEdit).length
          const deletePerms = role.permissions.filter((p) => p.canDelete).length
          const isExpanded = expandedId === role.id

          return (
            <Card
              key={role.id}
              className="cursor-pointer transition-colors hover:border-primary/50"
              onClick={() =>
                setExpandedId(isExpanded ? null : role.id)
              }
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base capitalize">
                      {roleLabels[role.name] || role.name}
                    </CardTitle>
                  </div>
                  <Badge variant={roleColors[role.name] as any || "secondary"} className="capitalize">
                    {role.name.replace(/_/g, " ")}
                  </Badge>
                </div>
                <CardDescription className="mt-1">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{role.userCount} users</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <Separator className="my-3" />
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-md bg-muted p-2">
                          <p className="font-medium text-foreground">{totalPerms}</p>
                          <p className="text-muted-foreground">Modules</p>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <p className="font-medium text-foreground">{viewPerms}</p>
                          <p className="text-muted-foreground">View</p>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <p className="font-medium text-foreground">{createPerms}</p>
                          <p className="text-muted-foreground">Create</p>
                        </div>
                        <div className="rounded-md bg-muted p-2">
                          <p className="font-medium text-foreground">{editPerms}</p>
                          <p className="text-muted-foreground">Edit</p>
                        </div>
                      </div>

                      <ScrollArea className="h-48">
                        <div className="space-y-1">
                          {role.permissions.map((perm) => (
                            <div
                              key={perm.module}
                              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                            >
                              <span>{perm.module}</span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    perm.canView
                                      ? "bg-emerald-500"
                                      : "bg-muted-foreground/30"
                                  }`}
                                />
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    perm.canCreate
                                      ? "bg-blue-500"
                                      : "bg-muted-foreground/30"
                                  }`}
                                />
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    perm.canEdit
                                      ? "bg-amber-500"
                                      : "bg-muted-foreground/30"
                                  }`}
                                />
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    perm.canDelete
                                      ? "bg-destructive"
                                      : "bg-muted-foreground/30"
                                  }`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
