import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput } from "@/shared/forms/form-input"
import { FormTextarea } from "@/shared/forms/form-textarea"
import { FormCheckbox } from "@/shared/forms/form-checkbox"
import { FormActions } from "@/shared/forms/form-actions"
import { getRoleById, updateRole } from "@/services/api/roles"
import { ArrowLeft } from "lucide-react"
import type { UpdateRoleRequest } from "@/services/api/roles"
import type { Permission } from "@/types"

const MODULES = [
  "Users",
  "Roles",
  "Institutions",
  "Facilities",
  "Instruments",
  "Bookings",
  "Reports",
  "Settings",
] as const

const permissionSchema = z.object({
  module: z.string(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
})

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissions: z.array(permissionSchema),
})

type FormData = z.infer<typeof formSchema>

export default function EditRolePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [fetching, setFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: MODULES.map((m) => ({
        module: m,
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      })),
    },
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Administration" },
      { label: "Roles", href: "/roles" },
      { label: "Edit Role" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    loadRole()
  }, [id])

  async function loadRole() {
    setFetching(true)
    setFetchError(null)
    try {
      const role = await getRoleById(id!)
      const mergedPermissions = MODULES.map((m) => {
        const existing = role.permissions.find((p) => p.module === m)
        return existing ?? { module: m, canView: false, canCreate: false, canEdit: false, canDelete: false }
      })
      form.reset({
        name: role.name,
        description: role.description,
        permissions: mergedPermissions,
      })
    } catch {
      setFetchError("Failed to load role")
    } finally {
      setFetching(false)
    }
  }

  async function onSubmit(data: FormData) {
    if (!id) return
    const request: UpdateRoleRequest = {
      name: data.name,
      description: data.description || "",
      permissions: data.permissions,
    }
    await updateRole(id, request)
    navigate("/roles")
  }

  if (fetchError) {
    return (
      <PageContainer
        title="Edit Role"
        description="Error loading role"
        status="error"
        errorMessage={fetchError}
        onRetry={loadRole}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/roles")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <PageContainer
      title="Edit Role"
      description="Update role details and permissions"
      status={fetching ? "loading" : "success"}
      loadingType="detail"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/roles")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 rounded-xl border p-6">
            <h3 className="text-lg font-semibold">Details</h3>
            <FormInput name="name" label="Role Name" placeholder="e.g. Lab Manager" />
            <FormTextarea
              name="description"
              label="Description"
              placeholder="Describe the role's purpose"
              rows={3}
            />
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
                  {MODULES.map((module, index) => (
                    <tr key={module} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{module}</td>
                      <td className="py-3 pr-4">
                        <FormCheckbox name={`permissions.${index}.canView`} label="" />
                      </td>
                      <td className="py-3 pr-4">
                        <FormCheckbox name={`permissions.${index}.canCreate`} label="" />
                      </td>
                      <td className="py-3 pr-4">
                        <FormCheckbox name={`permissions.${index}.canEdit`} label="" />
                      </td>
                      <td className="py-3">
                        <FormCheckbox name={`permissions.${index}.canDelete`} label="" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <FormActions
            submitLabel="Update Role"
            loading={fetching}
            onCancel={() => navigate("/roles")}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
