"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { generateId } from "@/lib/utils"
import type { Permission } from "@/types"
import { useEffect } from "react"

const modules = [
  "Dashboard", "Users", "Patients", "Doctors", "Branches", "Tests",
  "Bookings", "Samples", "Results", "Reports", "Instruments",
  "Quality Control", "Billing", "Inventory", "Settings", "Notifications",
]

const actions = ["canView", "canCreate", "canEdit", "canDelete"] as const
const actionLabels: Record<string, string> = {
  canView: "View",
  canCreate: "Create",
  canEdit: "Edit",
  canDelete: "Delete",
}

function makeEmptyPermissions() {
  return modules.map((module) => ({
    module,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  }))
}

export default function CreateRolePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [permissions, setPermissions] = useState<Permission[]>(makeEmptyPermissions)

  useEffect(() => {
    setBreadcrumbs([{ label: "Roles & Permissions", href: "/roles" }, { label: "Create Role" }])
  }, [])

  const handleToggle = (module: string, action: keyof Permission) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module === module ? { ...p, [action]: !p[action] } : p
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast({ title: "Role name is required", variant: "destructive" })
      return
    }
    const newRole = {
      id: generateId(),
      name: name.trim().toLowerCase().replace(/\s+/g, "_"),
      description: description.trim(),
      permissions,
      userCount: 0,
      createdAt: new Date().toISOString(),
    }
    console.log("Created role:", newRole)
    toast({ title: "Role created successfully", variant: "success" })
    navigate("/roles")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Role"
        description="Add a new system role"
        actions={
          <Button variant="outline" onClick={() => navigate("/roles")}>
            Cancel
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Role Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                placeholder="e.g. Lab Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role's responsibilities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[200px_repeat(4,80px)] gap-y-3 gap-x-2 items-center">
              <div className="text-sm font-medium text-muted-foreground">Module</div>
              {actions.map((action) => (
                <div key={action} className="text-center text-sm font-medium text-muted-foreground">
                  {actionLabels[action]}
                </div>
              ))}
              <Separator className="col-span-5" />
              {modules.map((module) => {
                const perm = permissions.find((p) => p.module === module)
                return (
                  <div key={module} className="contents">
                    <Label className="text-sm font-normal">{module}</Label>
                    {actions.map((action) => (
                      <div key={action} className="flex justify-center">
                        <Checkbox
                          checked={perm?.[action] ?? false}
                          onCheckedChange={() => handleToggle(module, action)}
                          aria-label={`${module} ${actionLabels[action]}`}
                        />
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit">Create Role</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/roles")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
