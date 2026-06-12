"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createDoctorSchema, type CreateDoctorForm } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import { FormSection } from "@/components/forms/form-section"
import { PageContainer } from "@/components/shared/page-container"
import { createDoctor } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const specializationOptions = [
  { value: "Cardiologist", label: "Cardiologist" },
  { value: "Dermatologist", label: "Dermatologist" },
  { value: "Endocrinologist", label: "Endocrinologist" },
  { value: "Gastroenterologist", label: "Gastroenterologist" },
  { value: "General Physician", label: "General Physician" },
  { value: "Gynecologist", label: "Gynecologist" },
  { value: "Neurologist", label: "Neurologist" },
  { value: "Oncologist", label: "Oncologist" },
  { value: "Orthopedic", label: "Orthopedic" },
  { value: "Pediatrician", label: "Pediatrician" },
  { value: "Psychiatrist", label: "Psychiatrist" },
  { value: "Pulmonologist", label: "Pulmonologist" },
  { value: "Radiologist", label: "Radiologist" },
  { value: "Urologist", label: "Urologist" },
]

export default function CreateDoctor() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [submitting, setSubmitting] = useState(false)

  const methods = useForm<CreateDoctorForm>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      specialization: "",
      hospital: "",
      city: "",
      commission: "",
    },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Doctors", href: "/doctors" }, { label: "Add Doctor" }])
  }, [])

  const onSubmit = async (data: CreateDoctorForm) => {
    setSubmitting(true)
    try {
      await createDoctor({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        specialization: data.specialization,
        hospital: data.hospital.trim(),
        city: data.city.trim(),
        commission: Number(data.commission),
        patientsReferred: 0,
        totalRevenue: 0,
        isActive: true,
        avatar: "",
      })
      toast({ title: "Doctor added successfully", variant: "success" })
      navigate("/doctors")
    } catch {
      toast({ title: "Failed to add doctor", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer
      title="Add Doctor"
      description="Register a new referring doctor"
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
              <FormInput name="name" label="Full Name *" placeholder="Dr. Rajesh Kumar" />
              <FormInput name="email" label="Email *" type="email" placeholder="doctor@hospital.com" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="phone" label="Phone *" placeholder="+91 98765 43210" />
              <FormSelect name="specialization" label="Specialization *" placeholder="Select specialization" options={specializationOptions} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="hospital" label="Hospital / Clinic *" placeholder="Hospital or clinic name" />
              <FormInput name="city" label="City *" placeholder="Mumbai" />
            </div>
            <FormInput name="commission" label="Commission Rate (%) *" type="number" placeholder="15" />
          </FormSection>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Doctor"}
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
