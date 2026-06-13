import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput } from "@/shared/forms/form-input"
import { FormCheckbox } from "@/shared/forms/form-checkbox"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { getRoles } from "@/services/api/roles"
import { getUserById, updateUser } from "@/services/api/users"
import { useToast } from "@/hooks/use-toast"
import type { Role, User } from "@/types"
import { ArrowLeft, Loader2 } from "lucide-react"

const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
  isActive: z.boolean(),
})

type EditUserForm = z.infer<typeof editUserSchema>

function toUserRole(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_")
}

export default function EditUserPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const form = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      roleIds: [],
      isActive: true,
    },
  })

  const { handleSubmit, control, reset, formState: { errors } } = form

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Users", href: "/users" }, { label: "Edit User" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    let userData: User | null = null

    Promise.all([
      getUserById(id).catch(() => { setNotFound(true); return null }),
      getRoles().catch(() => [] as Role[]),
    ]).then(([user, roleList]) => {
      userData = user
      setRoles(roleList)
      if (user) {
        const userRoleValues = user.role.map((r) => r.toLowerCase())
        const selectedRoleIds = roleList
          .filter((r) => userRoleValues.includes(toUserRole(r.name)))
          .map((r) => r.id)
        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || "",
          roleIds: selectedRoleIds,
          isActive: user.isActive,
        })
      }
      setLoading(false)
    })
  }, [id, reset])

  const onSubmit = async (data: EditUserForm) => {
    if (!id) return
    setSubmitting(true)
    try {
      await updateUser(id, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        roleIds: data.roleIds,
        isActive: data.isActive,
      })
      toast({ title: "User updated", variant: "success" })
      navigate("/users")
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" })
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer title="Edit User" description="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (notFound) {
    return (
      <PageContainer title="Edit User" description="User not found">
        <p className="text-sm text-muted-foreground">The requested user could not be found.</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Edit User"
      description="Update user details"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormInput name="firstName" label="First Name" placeholder="John" />
              <FormInput name="lastName" label="Last Name" placeholder="Doe" />
            </div>
            <FormInput name="phone" label="Phone (optional)" placeholder="+1 (555) 123-4567" />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Roles</Label>
            <Controller
              name="roleIds"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="flex items-center gap-2">
                      <Checkbox
                        id={role.id}
                        checked={field.value.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...field.value, role.id])
                          } else {
                            field.onChange(field.value.filter((id) => id !== role.id))
                          }
                        }}
                      />
                      <Label htmlFor={role.id} className="text-sm font-normal cursor-pointer">
                        {role.name}
                      </Label>
                    </div>
                  ))}
                  {errors.roleIds && (
                    <p className="text-xs text-destructive">{errors.roleIds.message}</p>
                  )}
                </div>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="isActive"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Active
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/users")}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  )
}
