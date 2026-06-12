"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit, Shield, Check, X } from "lucide-react"
import type { Role } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { roles } from "@/mock/data/roles"

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

const mockUsersByRole: Record<string, { name: string; email: string }[]> = {
  super_admin: [
    { name: "Dr. Ananya Sharma", email: "ananya.sharma@lifsys.com" },
  ],
  lab_admin: [
    { name: "Rajesh Patil", email: "rajesh.patil@lifsys.com" },
    { name: "Priya Mehta", email: "priya.mehta@lifsys.com" },
  ],
  branch_manager: [
    { name: "Vikram Joshi", email: "vikram.joshi@lifsys.com" },
    { name: "Neha Gupta", email: "neha.gupta@lifsys.com" },
    { name: "Arun Kumar", email: "arun.kumar@lifsys.com" },
  ],
  technician: [
    { name: "Sneha Reddy", email: "sneha.reddy@lifsys.com" },
    { name: "Ajay Verma", email: "ajay.verma@lifsys.com" },
    { name: "Deepa Nair", email: "deepa.nair@lifsys.com" },
    { name: "Rohit Singh", email: "rohit.singh@lifsys.com" },
    { name: "Kavita Desai", email: "kavita.desai@lifsys.com" },
    { name: "Manoj Pillai", email: "manoj.pillai@lifsys.com" },
  ],
  doctor: [
    { name: "Dr. Sunita Rao", email: "sunita.rao@lifsys.com" },
    { name: "Dr. Kartik Iyer", email: "kartik.iyer@lifsys.com" },
    { name: "Dr. Meera Chopra", email: "meera.chopra@lifsys.com" },
    { name: "Dr. Anjali Menon", email: "anjali.menon@lifsys.com" },
  ],
  receptionist: [
    { name: "Pooja Sharma", email: "pooja.sharma@lifsys.com" },
    { name: "Rahul Jain", email: "rahul.jain@lifsys.com" },
    { name: "Smita Kulkarni", email: "smita.kulkarni@lifsys.com" },
  ],
  phlebotomist: [
    { name: "Sunil Yadav", email: "sunil.yadav@lifsys.com" },
    { name: "Rekha Thomas", email: "rekha.thomas@lifsys.com" },
    { name: "Vijay Pandey", email: "vijay.pandey@lifsys.com" },
    { name: "Asha Joseph", email: "asha.joseph@lifsys.com" },
  ],
  billing: [
    { name: "Sandeep Bhat", email: "sandeep.bhat@lifsys.com" },
    { name: "Fatima Khan", email: "fatima.khan@lifsys.com" },
    { name: "Gaurav Shetty", email: "gaurav.shetty@lifsys.com" },
  ],
}

const actionKeys = ["canView", "canCreate", "canEdit", "canDelete"] as const
const actionLabels: Record<string, string> = {
  canView: "View",
  canCreate: "Create",
  canEdit: "Edit",
  canDelete: "Delete",
}

export default function RoleDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBreadcrumbs([{ label: "Roles & Permissions", href: "/roles" }, { label: "Role Details" }])
  }, [])

  useEffect(() => {
    if (!id) return
    const found = roles.find((r) => r.id === id)
    if (found) {
      setRole(found)
    } else {
      toast({ title: "Role not found", variant: "destructive" })
      navigate("/roles")
    }
    setLoading(false)
  }, [id, navigate, toast])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  if (!role) return null

  const assignedUsers = mockUsersByRole[role.name] || []

  return (
    <div className="space-y-6">
      <PageHeader
        title={roleLabels[role.name] || role.name}
        description={role.description}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/roles")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Roles
            </Button>
            <Button onClick={() => navigate(`/roles/${role.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Role Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <dt className="text-sm text-muted-foreground">Role ID</dt>
              <dd className="mt-1 font-medium">{role.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="mt-1 font-medium capitalize">{role.name.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Users</dt>
              <dd className="mt-1 font-medium">{role.userCount} assigned</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Created</dt>
              <dd className="mt-1 font-medium">{new Date(role.createdAt).toLocaleDateString()}</dd>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permission Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[180px_repeat(4,72px)] gap-y-2 gap-x-1 items-center text-sm">
              <div className="font-medium text-muted-foreground">Module</div>
              {actionKeys.map((key) => (
                <div key={key} className="text-center font-medium text-muted-foreground">
                  {actionLabels[key]}
                </div>
              ))}
              <Separator className="col-span-5 my-1" />
              {role.permissions.map((perm) => (
                <div key={perm.module} className="contents">
                  <span className="text-sm">{perm.module}</span>
                  {actionKeys.map((key) => (
                    <div key={key} className="flex justify-center">
                      {perm[key] ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground/40" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Users ({assignedUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users assigned to this role.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {assignedUsers.map((user) => (
                <div
                  key={user.email}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {roleLabels[role.name] || role.name}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
