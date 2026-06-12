"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { editBranchSchema, type EditBranchForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSelect } from "@/components/forms/form-select"
import { FormSection } from "@/components/forms/form-section"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { getBranchById, updateBranch } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export default function EditBranch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")

  const methods = useForm<EditBranchForm>({
    resolver: zodResolver(editBranchSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      isActive: true,
    },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Branches", href: "/branches" }, { label: "Edit Branch" }])
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const branch = await getBranchById(id!)
        if (!branch) { setPageStatus("error"); return }
        methods.reset({
          name: branch.name,
          code: branch.code,
          address: branch.address,
          city: branch.city,
          state: branch.state,
          phone: branch.phone,
          email: branch.email,
          isActive: branch.isActive,
        })
        setPageStatus("success")
      } catch {
        setPageStatus("error")
      }
    }
    load()
  }, [id, methods])

  const onSubmit = async (data: EditBranchForm) => {
    setIsSubmitting(true)
    try {
      await updateBranch(id!, {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        address: data.address.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        phone: data.phone.trim(),
        email: data.email.trim(),
        isActive: data.isActive,
      })
      toast({ title: "Branch updated successfully", variant: "success" })
      navigate(`/branches/${id}`)
    } catch {
      toast({ title: "Failed to update branch", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="Edit Branch"
      description="Update branch information"
      status={pageStatus}
      onRetry={() => window.location.reload()}
      actions={
        <Button variant="outline" onClick={() => navigate("/branches")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Branches
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSection title="Branch Information">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="name" label="Branch Name" />
              <FormInput name="code" label="Branch Code" />
            </div>
            <FormTextarea name="address" label="Address" className="min-h-[80px]" />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="city" label="City" />
              <FormInput name="state" label="State" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <FormInput name="phone" label="Phone" />
              <FormInput name="email" label="Email" type="email" />
            </div>
            <FormSelect name="isActive" label="Status" options={statusOptions} />
          </FormSection>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/branches")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Branch"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  )
}
