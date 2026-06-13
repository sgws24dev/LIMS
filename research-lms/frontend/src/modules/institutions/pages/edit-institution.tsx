import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput, FormSelect, FormErrorSummary, FormActions } from "@/shared/forms"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getTenantById, updateTenant } from "@/services/api/tenants"

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

export default function EditInstitutionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setBreadcrumbs } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "", domain: "", contactEmail: "", subscriptionPlan: "" },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Administration" }, { label: "Institutions", href: "/institutions" }, { label: "Edit Institution" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    const fetchTenant = async () => {
      try {
        const tenant = await getTenantById(id)
        form.reset({
          name: tenant.name,
          code: tenant.code,
          domain: tenant.domain ?? "",
          contactEmail: tenant.contactEmail ?? "",
          subscriptionPlan: tenant.subscriptionPlan ?? "",
        })
      } catch {
        setFetchError("Failed to load institution.")
      } finally {
        setLoading(false)
      }
    }
    fetchTenant()
  }, [id, form])

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    setSubmitError(null)
    try {
      await updateTenant(id, values)
      navigate("/institutions")
    } catch {
      setSubmitError("Failed to update institution. Please try again.")
    }
  }

  if (loading) {
    return (
      <PageContainer title="Edit Institution" description="Loading...">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (fetchError) {
    return (
      <PageContainer
        title="Edit Institution"
        description="Error loading institution"
        status="error"
        errorMessage={fetchError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <PageContainer
      title="Edit Institution"
      description="Update institution details"
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
            submitLabel="Save Changes"
            loading={form.formState.isSubmitting}
            onCancel={() => navigate("/institutions")}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
