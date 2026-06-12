"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createBranchSchema, type CreateBranchForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSection } from "@/components/forms/form-section"
import { createBranch } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

export default function CreateBranch() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Branches", href: "/branches" }, { label: "Create Branch" }])
  }, [])

  const methods = useForm<CreateBranchForm>({
    resolver: zodResolver(createBranchSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
    },
  })

  const onSubmit = async (data: CreateBranchForm) => {
    setIsSubmitting(true)
    try {
      await createBranch({
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        isActive: true,
        staffCount: 0,
        monthlyTests: 0,
        monthlyRevenue: 0,
      })
      toast({ title: "Branch created successfully", variant: "success" })
      navigate("/branches")
    } catch {
      toast({ title: "Failed to create branch", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Branch"
        description="Add a new laboratory branch"
        actions={
          <Button variant="outline" onClick={() => navigate("/branches")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Branches
          </Button>
        }
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSection title="Branch Information">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="name" label="Branch Name" placeholder="e.g. LifSys Diagnostics - Mumbai HQ" />
              <FormInput name="code" label="Branch Code" placeholder="e.g. LSD-MUM" />
            </div>
            <FormTextarea name="address" label="Address" placeholder="Enter full address" className="min-h-[80px]" />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="city" label="City" placeholder="e.g. Mumbai" />
              <FormInput name="state" label="State" placeholder="e.g. Maharashtra" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="phone" label="Phone" placeholder="e.g. +91 22 4123 4001" />
              <FormInput name="email" label="Email" type="email" placeholder="e.g. mumbai@lifsyslab.com" />
            </div>
          </FormSection>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/branches")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Branch"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
