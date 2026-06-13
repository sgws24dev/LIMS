import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput } from "@/shared/forms/form-input"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"
import { getRoles } from "@/services/api/roles"
import { createUser } from "@/services/api/users"
import { useToast } from "@/hooks/use-toast"
import type { Role } from "@/types"
import { ArrowLeft, Loader2 } from "lucide-react"

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "At least one role is required"),
})

type CreateUserForm = z.infer<typeof createUserSchema>

export default function CreateUserPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      roleIds: [],
    },
  })

  const { handleSubmit, control, formState: { errors } } = form

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Users", href: "/users" }, { label: "Create User" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    getRoles().then(setRoles).catch(() => setRoles([]))
  }, [])

  const onSubmit = async (data: CreateUserForm) => {
    setSubmitting(true)
    try {
      await createUser({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        roleIds: data.roleIds,
      })
      toast({ title: "User created", variant: "success" })
      navigate("/users")
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" })
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="Create User"
      description="Add a new user to the platform"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-6">
          <div className="space-y-4">
            <FormInput name="email" label="Email" type="email" placeholder="user@example.com" />
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

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Create User
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
