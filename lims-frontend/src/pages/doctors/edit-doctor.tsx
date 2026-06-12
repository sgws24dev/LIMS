"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { editDoctorSchema, type EditDoctorForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormSection } from "@/components/forms/form-section"
import { PageContainer, type PageStatus } from "@/components/shared/page-container"
import { getDoctorById, updateDoctor } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const specializationOptions = [
  { value: "Cardiologist", label: "Cardiologist" },
  { value: "Dermatologist", label: "Dermatologist" },
  { value: "Endocrinologist", label: "Endocrinologist" },
  { value: "General Physician", label: "General Physician" },
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Neurologist", label: "Neurologist" },
  { value: "Orthopedic", label: "Orthopedic" },
  { value: "Pediatrician", label: "Pediatrician" },
  { value: "Radiologist", label: "Radiologist" },
]

const statusOptions = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
]

export default function EditDoctor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [submitting, setSubmitting] = useState(false)
  const [pageStatus, setPageStatus] = useState<PageStatus>("loading")

  const methods = useForm<EditDoctorForm>({
    resolver: zodResolver(editDoctorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      hospital: "",
      city: "",
      commission: "",
      isActive: true,
    },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Doctors", href: "/doctors" }, { label: "Edit Doctor" }])
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const doctor = await getDoctorById(id!)
        if (!doctor) { setPageStatus("error"); return }
        methods.reset({
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          city: doctor.city,
          commission: String(doctor.commission),
          isActive: doctor.isActive,
        })
        setPageStatus("success")
      } catch {
        setPageStatus("error")
      }
    }
    load()
  }, [id, methods])

  const onSubmit = async (data: EditDoctorForm) => {
    setSubmitting(true)
    try {
      await updateDoctor(id!, {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        specialization: data.specialization,
        hospital: data.hospital.trim(),
        city: data.city.trim(),
        commission: Number(data.commission),
        isActive: data.isActive,
      })
      toast({ title: "Doctor updated successfully", variant: "success" })
      navigate(`/doctors/${id}`)
    } catch {
      toast({ title: "Failed to update doctor", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="Edit Doctor"
      description="Update referring doctor information"
      status={pageStatus}
      onRetry={() => window.location.reload()}
      actions={
        <Button variant="outline" onClick={() => navigate("/doctors")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSection title="Doctor Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="name" label="Full Name *" />
              <FormInput name="email" label="Email *" type="email" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="phone" label="Phone *" />
              <FormSelect name="specialization" label="Specialization *" placeholder="Select specialization" options={specializationOptions} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="hospital" label="Hospital / Clinic *" />
              <FormInput name="city" label="City *" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="commission" label="Commission Rate (%) *" type="number" />
              <FormSelect name="isActive" label="Status" options={statusOptions} />
            </div>
          </FormSection>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Update Doctor"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/doctors")}>
              Cancel
            </Button>
          </div>
        </form>
      </FormProvider>
    </PageContainer>
  )
}
