import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { FormInput, FormSelect, FormSwitch, FormErrorSummary, FormActions } from "@/shared/forms"
import { ArrowLeft, Plus, X } from "lucide-react"
import { getFacilities, createAsset, type Facility } from "@/services/api/facilities"

const categoryOptions = [
  { value: "Instruments", label: "Instruments" },
  { value: "Equipment", label: "Equipment" },
  { value: "Vehicles", label: "Vehicles" },
  { value: "Other", label: "Other" },
]

const depreciationOptions = [
  { value: "StraightLine", label: "Straight Line" },
  { value: "DecliningBalance", label: "Declining Balance" },
]

const protocolOptions = [
  { value: "HTTP", label: "HTTP" },
  { value: "MQTT", label: "MQTT" },
  { value: "ModbusTCP", label: "Modbus TCP" },
  { value: "OPC_UA", label: "OPC UA" },
  { value: "Serial", label: "Serial" },
]

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  identifier: z.string().min(1, "Identifier is required").max(100),
  category: z.string().min(1, "Category is required"),
  facilityId: z.string().min(1, "Facility is required"),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  location: z.string().optional(),
  acquisitionDate: z.string().optional(),
  acquisitionCost: z.coerce.number().min(0).optional().or(z.literal("")),
  salvageValue: z.coerce.number().min(0).optional().or(z.literal("")),
  usefulLifeYears: z.coerce.number().int().positive().optional().or(z.literal("")),
  depreciationMethod: z.string().optional(),
  qrCode: z.string().optional(),
  rfidTag: z.string().optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  ipAddress: z.string().optional(),
  port: z.coerce.number().int().min(1).max(65535).optional().or(z.literal("")),
  connectionProtocol: z.string().optional(),
  firmware: z.string().optional(),
  lastCalibrationDate: z.string().optional(),
  nextCalibrationDate: z.string().optional(),
  maintenanceIntervalDays: z.coerce.number().int().positive().optional().or(z.literal("")),
  iotEnabled: z.boolean().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function CreateAssetPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "", identifier: "", category: "", facilityId: "",
      model: "", manufacturer: "", location: "",
      acquisitionDate: "", acquisitionCost: "" as any, salvageValue: "" as any,
      usefulLifeYears: "" as any, depreciationMethod: "", qrCode: "", rfidTag: "",
      customFields: [],
      ipAddress: "", port: "" as any, connectionProtocol: "", firmware: "",
      lastCalibrationDate: "", nextCalibrationDate: "",
      maintenanceIntervalDays: "" as any, iotEnabled: false,
    },
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "customFields" })

  const category = form.watch("category")
  const isInstrument = category === "Instruments"

  useEffect(() => {
    setBreadcrumbs([{ label: "Facilities" }, { label: "Assets", href: "/facilities/assets" }, { label: "Add Asset" }])
    getFacilities({ page: 1, pageSize: 100 })
      .then((r) => setFacilities(r.items))
      .catch(() => {})
  }, [setBreadcrumbs])

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      const customFields: Record<string, string> = {}
      values.customFields?.forEach((f) => { if (f.key) customFields[f.key] = f.value })

      await createAsset({
        ...values,
        acquisitionCost: values.acquisitionCost ? Number(values.acquisitionCost) : undefined,
        salvageValue: values.salvageValue ? Number(values.salvageValue) : undefined,
        usefulLifeYears: values.usefulLifeYears ? Number(values.usefulLifeYears) : undefined,
        port: values.port ? Number(values.port) : undefined,
        maintenanceIntervalDays: values.maintenanceIntervalDays ? Number(values.maintenanceIntervalDays) : undefined,
        customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
      })
      navigate("/facilities/assets")
    } catch {
      setSubmitError("Failed to create asset. Please try again.")
    }
  }

  const facilityOptions = facilities.map((f) => ({ value: f.id, label: f.name }))

  return (
    <PageContainer
      title="Add Asset"
      description="Register a new asset or instrument"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/facilities/assets")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 max-w-3xl">
          {submitError && <FormErrorSummary />}
          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
            <h3 className="font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput name="name" label="Name" placeholder="Asset name" required />
              <FormInput name="identifier" label="Identifier / Serial No." placeholder="e.g. SN-001" required />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelect name="category" label="Category" placeholder="Select category" options={categoryOptions} />
              <FormSelect name="facilityId" label="Facility" placeholder="Select facility" options={facilityOptions} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput name="model" label="Model" placeholder="Model number" />
              <FormInput name="manufacturer" label="Manufacturer" placeholder="Manufacturer name" />
            </div>
            <FormInput name="location" label="Location" placeholder="Building, floor, room" />
          </div>

          <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
            <h3 className="font-medium">Financial Details</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormInput name="acquisitionDate" label="Acquisition Date" type="date" />
              <FormInput name="acquisitionCost" label="Acquisition Cost ($)" type="number" placeholder="0.00" />
              <FormInput name="salvageValue" label="Salvage Value ($)" type="number" placeholder="0.00" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput name="usefulLifeYears" label="Useful Life (years)" type="number" placeholder="e.g. 10" />
              <FormSelect name="depreciationMethod" label="Depreciation Method" placeholder="Select method" options={depreciationOptions} />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
            <h3 className="font-medium">Tracking</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput name="qrCode" label="QR Code" placeholder="QR code data" />
              <FormInput name="rfidTag" label="RFID Tag" placeholder="RFID tag ID" />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Custom Fields</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                <Plus className="mr-1 h-3 w-3" /> Add Field
              </Button>
            </div>
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">No custom fields defined.</p>
            )}
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormInput name={`customFields.${index}.key` as any} placeholder="Key" />
                <FormInput name={`customFields.${index}.value` as any} placeholder="Value" />
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {isInstrument && (
            <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-4">
              <h3 className="font-medium">Instrument Configuration</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput name="ipAddress" label="IP Address" placeholder="192.168.1.1" />
                <FormInput name="port" label="Port" type="number" placeholder="8080" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormSelect name="connectionProtocol" label="Connection Protocol" placeholder="Select protocol" options={protocolOptions} />
                <FormInput name="firmware" label="Firmware" placeholder="v1.0.0" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput name="lastCalibrationDate" label="Last Calibration" type="date" />
                <FormInput name="nextCalibrationDate" label="Next Calibration" type="date" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput name="maintenanceIntervalDays" label="Maintenance Interval (days)" type="number" placeholder="e.g. 90" />
                <FormSwitch name="iotEnabled" label="IoT Enabled" />
              </div>
            </div>
          )}

          <FormActions
            submitLabel="Create Asset"
            loading={form.formState.isSubmitting}
            onCancel={() => navigate("/facilities/assets")}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
