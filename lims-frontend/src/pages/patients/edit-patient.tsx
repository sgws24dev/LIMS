"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { editPatientSchema, type EditPatientForm } from "@/lib/validations"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormSelect } from "@/components/forms/form-select"
import { FormRadioGroup } from "@/components/forms/form-radio-group"
import { FormSection } from "@/components/forms/form-section"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { generateId } from "@/lib/utils"
import { getPatientById, updatePatient } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
]

export default function EditPatient() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [medicalTag, setMedicalTag] = useState("")

  const methods = useForm<EditPatientForm>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dob: "",
      gender: "male",
      bloodGroup: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      medicalHistory: [],
      familyMembers: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "familyMembers",
  })

  const medicalHistory = methods.watch("medicalHistory") ?? []

  useEffect(() => {
    setBreadcrumbs([{ label: "Patients", href: "/patients" }, { label: "Edit Patient" }])
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPatientById(id).then((patient) => {
      if (!patient) {
        toast({ title: "Patient not found", variant: "destructive" })
        navigate("/patients")
        return
      }
      methods.reset({
        name: patient.name,
        email: patient.email || "",
        phone: patient.phone,
        dob: patient.dob,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        address: patient.address || "",
        city: patient.city,
        state: patient.state,
        pincode: patient.pincode || "",
        medicalHistory: patient.medicalHistory || [],
        familyMembers: (patient.familyMembers || []).map((fm) => ({ id: fm.id, name: fm.name, relation: fm.relation, phone: fm.phone, dob: fm.dob })),
      })
      setLoading(false)
    })
  }, [id, navigate, toast, methods])

  const addMedicalTag = () => {
    const tag = medicalTag.trim()
    if (tag && !medicalHistory.includes(tag)) {
      methods.setValue("medicalHistory", [...medicalHistory, tag])
      setMedicalTag("")
    }
  }

  const removeMedicalTag = (tag: string) => {
    methods.setValue("medicalHistory", medicalHistory.filter((t) => t !== tag))
  }

  const onSubmit = async (data: EditPatientForm) => {
    setSubmitting(true)
    try {
      await updatePatient(id!, {
        name: data.name.trim(),
        email: data.email ?? "",
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        address: data.address ?? "",
        city: data.city.trim(),
        state: data.state.trim(),
        pincode: data.pincode ?? "",
        medicalHistory: data.medicalHistory ?? [],
        familyMembers: ((data.familyMembers ?? []).filter((m) => m.name?.trim()) as import("@/types").FamilyMember[]),
      })
      toast({ title: "Patient updated successfully", variant: "success" })
      navigate("/patients")
    } catch {
      toast({ title: "Failed to update patient", variant: "destructive" })
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
            {Array.from({ length: 8 }).map((_, i) => (
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
        title="Edit Patient"
        description={`Editing ${methods.watch("name")}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/patients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormSection title="Personal Information">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput name="name" label="Full Name *" placeholder="Enter full name" />
              <FormInput name="dob" label="Date of Birth *" type="date" />
            </div>
            <FormRadioGroup
              name="gender"
              label="Gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormSelect name="bloodGroup" label="Blood Group *" placeholder="Select blood group" options={bloodGroupOptions} />
              <FormInput name="phone" label="Phone *" placeholder="Enter phone number" />
            </div>
            <FormInput name="email" label="Email" type="email" placeholder="Enter email" />
          </FormSection>

          <FormSection title="Address" className="mt-4">
            <FormTextarea name="address" label="Address" placeholder="Enter address" />
            <div className="grid gap-4 sm:grid-cols-3">
              <FormInput name="city" label="City *" placeholder="Enter city" />
              <FormInput name="state" label="State *" placeholder="Enter state" />
              <FormInput name="pincode" label="Pincode" placeholder="Enter pincode" />
            </div>
          </FormSection>

          <FormSection title="Medical History" className="mt-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type a condition and press Add"
                value={medicalTag}
                onChange={(e) => setMedicalTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addMedicalTag() }
                }}
              />
              <Button type="button" variant="outline" onClick={addMedicalTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {medicalHistory.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {medicalHistory.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeMedicalTag(tag)} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                ))}
              </div>
            )}
          </FormSection>

          <FormSection title="Family Members" className="mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {fields.length === 0 ? "No family members added." : `${fields.length} member(s)`}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ id: generateId(), name: "", relation: "", phone: "", dob: "" })}>
                <Plus className="mr-1 h-4 w-4" />
                Add Member
              </Button>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Family Member {idx + 1}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(idx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput name={`familyMembers.${idx}.name` as const} placeholder="Name" />
                  <FormInput name={`familyMembers.${idx}.relation` as const} placeholder="Relation" />
                  <FormInput name={`familyMembers.${idx}.phone` as const} placeholder="Phone" />
                  <FormInput name={`familyMembers.${idx}.dob` as const} type="date" />
                </div>
              </div>
            ))}
          </FormSection>

          <div className="mt-6 flex items-center gap-3">
            <Button type="submit" disabled={submitting}>
              <Save className="mr-2 h-4 w-4" />
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/patients")}>Cancel</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
