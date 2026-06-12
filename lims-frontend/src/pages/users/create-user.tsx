"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createUserSchema, type CreateUserForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import type { UserRole } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormSection } from "@/components/forms/form-section"
import { Separator } from "@/components/ui/separator"
import { createUser } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"

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

const emptyBranchOption = { value: "", label: "No branch (optional)" }

export default function CreateUser() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      branchId: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: CreateUserForm) => {
    setSubmitting(true)
    try {
      await createUser({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        role: data.role as UserRole,
        branchId: data.branchId || undefined,
        isActive: true,
        tenantId: "TNT001",
        avatar: "",
      })
      toast({ title: "User created successfully", variant: "success" })
      navigate("/users")
    } catch {
      toast({ title: "Failed to create user", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create User"
        description="Add a new user to the system"
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
                label="Role *"
                placeholder="Select role"
                options={roleOptions}
              />
            </div>
            <FormSelect
              name="branchId"
              label="Branch"
              placeholder="Select branch (optional)"
              options={[emptyBranchOption, ...branchOptions]}
            />

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="password" label="Password *" type="password" placeholder="Enter password" />
              <FormInput name="confirmPassword" label="Confirm Password *" type="password" placeholder="Confirm password" />
            </div>
          </FormSection>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
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
