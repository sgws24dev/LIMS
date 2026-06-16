"use client"

import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm, FormProvider, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useUIStore } from "@/store/uiStore"
import { PageContainer } from "@/shared/shared/page-container"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { FormInput } from "@/shared/forms/form-input"
import { FormSelect } from "@/shared/forms/form-select"
import { FormSwitch } from "@/shared/forms/form-switch"
import { FormActions } from "@/shared/forms/form-actions"
import { Input } from "@/shared/ui/input"
import { ArrowLeft, X } from "lucide-react"
import { getInstrumentConfig, updateInstrumentConfig, type InstrumentConfigResponse } from "@/services/api/facilities"

const configSchema = z.object({
  ipAddress: z.string().regex(/^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/, "Valid IPv4 or IPv6 required").optional().or(z.literal("")),
  port: z.coerce.number().int().min(1, "Port 1-65535").max(65535, "Port 1-65535").nullable().optional(),
  connectionProtocol: z.string().optional(),
  firmware: z.string().optional(),
  maintenanceIntervalDays: z.coerce.number().int().min(0).nullable().optional(),
  iotEnabled: z.boolean(),
})

const configResolver = zodResolver(configSchema) as unknown as Resolver<ConfigForm>

type ConfigForm = z.infer<typeof configSchema>

const protocolOptions = [
  { value: "", label: "None" },
  { value: "HTTP", label: "HTTP" },
  { value: "MQTT", label: "MQTT" },
  { value: "ModbusTCP", label: "Modbus TCP" },
  { value: "OPC_UA", label: "OPC UA" },
  { value: "Serial", label: "Serial" },
]

export default function InstrumentConfigPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { setBreadcrumbs } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [metricKeys, setMetricKeys] = useState<string[]>([])
  const [newKey, setNewKey] = useState("")

  const form = useForm<ConfigForm>({
    resolver: configResolver,
    defaultValues: {
      ipAddress: "",
      port: null,
      connectionProtocol: "",
      firmware: "",
      maintenanceIntervalDays: null,
      iotEnabled: false,
    },
  })

  useEffect(() => {
    setBreadcrumbs([
      { label: "Facilities" },
      { label: "Instruments", href: "/facilities/instruments" },
      { label: "Configuration" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getInstrumentConfig(id)
      .then((config) => {
        form.reset({
          ipAddress: config.ipAddress ?? "",
          port: config.port ?? null,
          connectionProtocol: config.connectionProtocol ?? "",
          firmware: config.firmware ?? "",
          maintenanceIntervalDays: config.maintenanceIntervalDays ?? null,
          iotEnabled: config.iotEnabled,
        })
        setMetricKeys(config.metricKeys ?? [])
      })
      .catch(() => navigate("/facilities/instruments"))
      .finally(() => setLoading(false))
  }, [id, form, navigate])

  const addMetricKey = () => {
    const key = newKey.trim()
    if (key && !metricKeys.includes(key)) {
      setMetricKeys([...metricKeys, key])
      setNewKey("")
    }
  }

  const removeMetricKey = (key: string) => {
    setMetricKeys(metricKeys.filter((k) => k !== key))
  }

  const onSubmit = async (values: ConfigForm) => {
    if (!id) return
    setSaving(true)
    try {
      await updateInstrumentConfig(id, {
        ipAddress: values.ipAddress || undefined,
        port: values.port ?? undefined,
        connectionProtocol: values.connectionProtocol || undefined,
        firmware: values.firmware || undefined,
        maintenanceIntervalDays: values.maintenanceIntervalDays ?? undefined,
        iotEnabled: values.iotEnabled,
        metricKeys,
      })
      navigate(`/facilities/instruments/${id}`)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer
      title="Instrument Configuration"
      description="Configure instrument connection and telemetry settings"
      status={loading ? "loading" : "success"}
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate(`/facilities/instruments/${id}`)}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
          <Card>
            <CardHeader><CardTitle>Connection Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormInput name="ipAddress" label="IP Address" placeholder="192.168.1.1" />
                <FormInput name="port" label="Port" type="number" placeholder="502" />
              </div>
              <FormSelect name="connectionProtocol" label="Connection Protocol" options={protocolOptions} />
              <FormInput name="firmware" label="Firmware Version" placeholder="v2.1.0" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Telemetry Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormSwitch name="iotEnabled" label="Enable IoT Telemetry" />
              <FormInput name="maintenanceIntervalDays" label="Maintenance Interval (Days)" type="number" placeholder="90" />
              
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Metric Keys</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type key and press Enter"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMetricKey() } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addMetricKey}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {metricKeys.map((key) => (
                    <span key={key} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {key}
                      <button type="button" onClick={() => removeMetricKey(key)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <FormActions
            submitLabel="Save Configuration"
            loading={saving}
            onCancel={() => navigate(`/facilities/instruments/${id}`)}
          />
        </form>
      </FormProvider>
    </PageContainer>
  )
}
