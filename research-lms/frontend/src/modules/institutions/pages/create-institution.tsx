import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput, FormSelect, FormErrorSummary, FormActions } from "@/shared/forms"
import { ArrowLeft } from "lucide-react"
import { createTenant } from "@/services/api/tenants"

const subscriptionPlanOptions = [
  { value: "Free", label: "Free" },
  { value: "Starter", label: "Starter" },
  { value: "Professional", label: "Professional" },
  { value: "Enterprise", label: "Enterprise" },
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required").regex(/^[a-zA-Z0-9]+$/, "Code must be alphanumeric"),
  domain: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  subscriptionPlan: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateInstitutionPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "", domain: "", contactEmail: "", subscriptionPlan: "" },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Institutions", href: "/institutions" }, { label: "Create Institution" }])
  }, [setBreadcrumbs])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await createTenant(values)
      navigate("/institutions")
    } catch {
      setSubmitError("Failed to create institution. Please try again.")
    }
  }

  return (
    <PageContainer
      title="Create Institution"
      description="Add a new institution to the platform"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/institutions")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
          {submitError && <FormErrorSummary />}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput name="name" label="Name" placeholder="Institution name" required />
            <FormInput name="code" label="Code" placeholder="e.g. INST001" required />
          </div>

          <FormInput name="domain" label="Domain" placeholder="e.g. institution.edu" />

          <FormInput name="contactEmail" label="Contact Email" type="email" placeholder="admin@institution.edu" />

          <FormSelect
            name="subscriptionPlan"
            label="Subscription Plan"
            placeholder="Select a plan"
            options={subscriptionPlanOptions}
          />

          <FormActions
            submitLabel="Create Institution"
            loading={form.formState.isSubmitting}
            onCancel={() => navigate("/institutions")}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
