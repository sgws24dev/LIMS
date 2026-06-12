"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useNavigate } from "react-router"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { instrumentConfigSchema, type InstrumentConfigForm } from "@/lib/validations"
import {
  ArrowLeft,
  Save,
  Wifi,
  WifiOff,
  Activity,
  Calendar,
  RefreshCw,
  Plug,
  Network,
  ClipboardList,
  AlertTriangle,
  HardDrive,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { FormInput } from "@/components/forms/form-input"
import { FormSelect } from "@/components/forms/form-select"
import type { Instrument } from "@/types"
import { instruments as mockInstruments } from "@/mock/data/instruments"
import { tests as mockTests } from "@/mock/data/tests"
import { useAppStore } from "@/store/appStore"

const statusConfig = {
  online: { label: "Online", dot: "bg-emerald-500", badge: "success" as const },
  offline: { label: "Offline", dot: "bg-gray-400", badge: "secondary" as const },
  maintenance: { label: "Maintenance", dot: "bg-amber-500", badge: "warning" as const },
  error: { label: "Error", dot: "bg-destructive", badge: "destructive" as const },
  calibrating: { label: "Calibrating", dot: "bg-blue-500", badge: "default" as const },
  idle: { label: "Idle", dot: "bg-slate-400", badge: "secondary" as const },
}

const testMap = new Map(mockTests.map((t) => [t.id, t]))

const protocolOptions = [
  { value: "TCP/IP", label: "TCP/IP" },
  { value: "RS-232", label: "RS-232 (Serial)" },
  { value: "HTTP", label: "HTTP/REST" },
  { value: "HL7", label: "HL7" },
]

export default function InstrumentConfigPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [calibrating, setCalibrating] = useState(false)
  const [instrument, setInstrument] = useState<Instrument | null>(null)

  const methods = useForm<InstrumentConfigForm>({
    resolver: zodResolver(instrumentConfigSchema),
    defaultValues: { ipAddress: "", port: "", protocol: "TCP/IP" },
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Instruments", href: "/instruments" }, { label: "Configuration" }])
  }, [])

  useEffect(() => {
    const found = mockInstruments.find((i) => i.id === id)
    setInstrument(found || null)
    if (found) {
      methods.reset({ ipAddress: found.ipAddress, port: String(found.port), protocol: "TCP/IP" })
    }
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [id])

  const connectedTestList = useMemo(
    () => (instrument ? instrument.connectedTests.map((tid) => testMap.get(tid)).filter(Boolean) : []),
    [instrument]
  )

  const onSubmit = async (data: InstrumentConfigForm) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast({ title: "Configuration saved", description: `Configuration for ${instrument?.name} has been updated.`, variant: "success" })
    setSaving(false)
  }

  const handleCalibrate = async () => {
    setCalibrating(true)
    await new Promise((r) => setTimeout(r, 2000))
    toast({ title: "Calibration started", description: `Calibration process initiated for ${instrument?.name}.`, variant: "success" })
    setCalibrating(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Instrument Configuration" description="Configure instrument settings" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!instrument) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Instrument Not Found"
          description="The requested instrument could not be found"
          actions={
            <Button variant="outline" onClick={() => navigate("/instruments")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Instruments
            </Button>
          }
        />
        <Card>
          <CardContent className="p-12 text-center">
            <HardDrive className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Instrument not found</h3>
            <p className="mt-1 text-sm text-muted-foreground">The instrument with ID {id} does not exist.</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/instruments")}>
              View All Instruments
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const st = statusConfig[instrument.status]
  const uptime = instrument.status === "online" ? "14d 6h 32m" : "0m"
  const lastComm = instrument.status === "online" ? "2 seconds ago" : "3 days ago"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instrument Configuration"
        description="Configure instrument settings and parameters"
        actions={
          <Button variant="outline" onClick={() => navigate("/instruments")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <HardDrive className="h-4 w-4" />
              {instrument.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Manufacturer</Label>
                <p className="font-medium">{instrument.manufacturer}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Model</Label>
                <p className="font-medium">{instrument.model}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Serial Number</Label>
                <p className="font-mono text-sm">{instrument.serialNumber}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", st.dot)} />
                  <Badge variant={st.badge}>{st.label}</Badge>
                </div>
              </div>
            </div>

            <Separator />

            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <h4 className="mb-3 font-semibold flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Connection Settings
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <FormInput name="ipAddress" label="IP Address" placeholder="192.168.1.100" />
                  <FormInput name="port" label="Port" placeholder="8080" />
                  <FormSelect name="protocol" label="Protocol" options={protocolOptions} />
                </div>
              </form>
            </FormProvider>

            <Separator />

            <div>
              <h4 className="mb-3 font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Test Mapping ({connectedTestList.length} tests)
              </h4>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Parameters</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connectedTestList.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                          No tests mapped to this instrument
                        </TableCell>
                      </TableRow>
                    ) : (
                      connectedTestList.map((test) =>
                        test ? (
                          <TableRow key={test.id}>
                            <TableCell className="font-medium">{test.name}</TableCell>
                            <TableCell>{test.code}</TableCell>
                            <TableCell>{test.parameters.length}</TableCell>
                            <TableCell>{test.department}</TableCell>
                          </TableRow>
                        ) : null
                      )
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4" />
                Status Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Connection</span>
                <div className="flex items-center gap-2">
                  {instrument.status === "online" ? (
                    <>
                      <Wifi className="h-4 w-4 text-emerald-500" />
                      <Badge variant="success">Connected</Badge>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="secondary">Disconnected</Badge>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Communication</span>
                <span className="text-sm">{lastComm}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="text-sm">{uptime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ping</span>
                <span className={cn(
                  "text-sm",
                  instrument.status === "online" ? "text-emerald-600" : "text-destructive"
                )}>
                  {instrument.status === "online" ? "2 ms" : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Calibration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Calibration</span>
                <span className="text-sm font-medium">{formatDate(instrument.lastCalibration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Next Calibration</span>
                <span className="text-sm font-medium">{formatDate(instrument.nextCalibration)}</span>
              </div>
              <Separator />
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCalibrate}
                disabled={calibrating}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", calibrating && "animate-spin")} />
                {calibrating ? "Calibrating..." : "Calibrate Now"}
              </Button>
            </CardContent>
          </Card>

          <Button onClick={methods.handleSubmit(onSubmit)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>
    </div>
  )
}
