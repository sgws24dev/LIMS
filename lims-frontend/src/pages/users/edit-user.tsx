"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { editUserSchema, type EditUserForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import type { UserRole } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormCheckbox } from "@/components/forms/form-checkbox"
import { FormSection } from "@/components/forms/form-section"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { getUserById, updateUser } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const roleOptions = [
  { value: "super_admin", label: "Super Admin" },
  { value: "lab_admin", label: "Lab Admin" },
  { value: "branch_manager", label: "Branch Manager" },
  { value: "technician", label: "Technician" },
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
  { value: "phlebotomist", label: "Phlebotomist" },
  { value: "billing", label: "Billing" },
]

const branchOptions = [
  { value: "BRH001", label: "LifSys Diagnostics - Mumbai HQ" },
  { value: "BRH002", label: "LifSys Diagnostics - Delhi" },
  { value: "BRH003", label: "LifSys Diagnostics - Bangalore" },
  { value: "BRH004", label: "LifSys Diagnostics - Hyderabad" },
  { value: "BRH005", label: "LifSys Diagnostics - Chennai" },
  { value: "BRH006", label: "LifSys Diagnostics - Pune" },
]

const emptyBranchOption = { value: "", label: "No branch" }

export default function EditUser() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      branchId: "",
      isActive: true,
    },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Users", href: "/users" }, { label: "Edit User" }])
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getUserById(id).then((user) => {
      if (user) {
        methods.reset({
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          branchId: user.branchId || "",
          isActive: user.isActive,
        })
      } else {
        toast({ title: "User not found", variant: "destructive" })
        navigate("/users")
      }
      setLoading(false)
    })
  }, [id, navigate, toast, methods])

  const onSubmit = async (data: EditUserForm) => {
    setSubmitting(true)
    try {
      await updateUser(id!, {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        role: data.role as UserRole,
        branchId: data.branchId || undefined,
        isActive: data.isActive,
      })
      toast({ title: "User updated successfully", variant: "success" })
      navigate("/users")
    } catch {
      toast({ title: "Failed to update user", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit User"
        description={`Editing ${methods.watch("name")}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSection title="User Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="name" label="Full Name *" placeholder="Enter full name" />
              <FormInput name="email" label="Email *" type="email" placeholder="Enter email address" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="phone" label="Phone *" placeholder="Enter phone number" />
              <FormSelect
                name="role"
                label="Role"
                placeholder="Select role"
                options={roleOptions}
              />
            </div>
            <FormSelect
              name="branchId"
              label="Branch"
              placeholder="Select branch"
              options={[emptyBranchOption, ...branchOptions]}
            />
            <FormCheckbox name="isActive" label="Active Status" />
          </FormSection>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/users")}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
