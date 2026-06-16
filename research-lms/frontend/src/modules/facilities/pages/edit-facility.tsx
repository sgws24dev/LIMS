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
import { getFacilityById, updateFacility } from "@/services/api/facilities"

const facilityTypeOptions = [
  { value: "core_facility", label: "Core Facility" },
  { value: "research_lab", label: "Research Lab" },
  { value: "teaching_lab", label: "Teaching Lab" },
  { value: "biosafety_lab", label: "Biosafety Lab" },
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  location: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditFacilityPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { setBreadcrumbs } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", type: "", location: "" },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Facilities", href: "/facilities" }, { label: "Edit Facility" }])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    const fetchFacility = async () => {
      try {
        const facility = await getFacilityById(id)
        form.reset({
          name: facility.name,
          type: facility.type,
          location: facility.location ?? "",
        })
      } catch {
        setFetchError("Failed to load facility.")
      } finally {
        setLoading(false)
      }
    }
    fetchFacility()
  }, [id, form])

  const onSubmit = async (values: FormValues) => {
    if (!id) return
    setSubmitError(null)
    try {
      await updateFacility(id, { ...values, isActive: true })
      navigate("/facilities")
    } catch {
      setSubmitError("Failed to update facility. Please try again.")
    }
  }

  if (loading) {
    return (
      <PageContainer title="Edit Facility" description="Loading...">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (fetchError) {
    return (
      <PageContainer
        title="Edit Facility"
        description="Error loading facility"
        status="error"
        errorMessage={fetchError}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <PageContainer
      title="Edit Facility"
      description="Update facility details"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/facilities")}>
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
            <FormInput name="name" label="Name" placeholder="Facility name" required />
            <FormSelect
              name="type"
              label="Type"
              placeholder="Select facility type"
              options={facilityTypeOptions}
            />
          </div>

          <FormInput name="location" label="Location" placeholder="Building, floor, room" />

          <FormActions
            submitLabel="Save Changes"
            loading={form.formState.isSubmitting}
            onCancel={() => navigate("/facilities")}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
