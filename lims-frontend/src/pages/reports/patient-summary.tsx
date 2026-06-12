"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  FileText,
  ChevronLeft,
  User,
  Calendar,
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  Printer,
  Download,
  Stethoscope,
  HeartPulse,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import type { Result, ResultParameter } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { patients as mockPatients } from "@/mock/data/patients"

function getSimpleStatus(param: ResultParameter): { label: string; icon: React.ReactNode; variant: "success" | "warning" | "destructive" | "secondary" } {
  if (!param.isAbnormal && !param.isCritical) {
    return { label: "Normal", icon: <Minus className="h-3.5 w-3.5" />, variant: "success" }
  }

  const num = parseFloat(param.value)
  if (isNaN(num)) return { label: "Abnormal", icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: "warning" }

  const range = param.referenceRange
  if (range.includes(" - ")) {
    const parts = range.split(" - ")
    const upper = parseFloat(parts[1])
    if (num > upper) return { label: "High", icon: <ArrowUp className="h-3.5 w-3.5" />, variant: param.isCritical ? "destructive" : "warning" }
    const lower = parseFloat(parts[0])
    if (num < lower) return { label: "Low", icon: <ArrowDown className="h-3.5 w-3.5" />, variant: param.isCritical ? "destructive" : "warning" }
  } else if (range.startsWith("< ")) {
    const upper = parseFloat(range.replace("< ", ""))
    if (num > upper) return { label: "High", icon: <ArrowUp className="h-3.5 w-3.5" />, variant: param.isCritical ? "destructive" : "warning" }
  } else if (range.startsWith("> ")) {
    const lower = parseFloat(range.replace("> ", ""))
    if (num < lower) return { label: "Low", icon: <ArrowDown className="h-3.5 w-3.5" />, variant: param.isCritical ? "destructive" : "warning" }
  }

  if (param.value.toLowerCase() !== "non-reactive" && param.referenceRange.toLowerCase().includes("non-reactive")) {
    return { label: "Detected", icon: <AlertTriangle className="h-3.5 w-3.5" />, variant: "warning" }
  }

  return { label: "Normal", icon: <Minus className="h-3.5 w-3.5" />, variant: "success" }
}

function getPlainLanguageExplanation(param: ResultParameter): string {
  const status = getSimpleStatus(param)
  if (status.label === "Normal") {
    return `Your ${param.parameterName.toLowerCase()} level of ${param.value} ${param.unit} is within the normal range.`
  }
  if (status.label === "High") {
    return `Your ${param.parameterName.toLowerCase()} level of ${param.value} ${param.unit} is higher than the normal range (${param.referenceRange}). This may need attention.`
  }
  if (status.label === "Low") {
    return `Your ${param.parameterName.toLowerCase()} level of ${param.value} ${param.unit} is lower than the normal range (${param.referenceRange}). This may need attention.`
  }
  return `Your ${param.parameterName.toLowerCase()} result of ${param.value} ${param.unit} is outside the normal range (${param.referenceRange}).`
}

export default function PatientSummaryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const resultId = searchParams.get("id") || "RES001"
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "Patient Summary" },
    ])
    const timer = setTimeout(() => {
      const found = mockResults.find((r) => r.id === resultId)
      setResult(found || null)
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs, resultId])

  const patient = useMemo(() => {
    if (!result) return null
    return mockPatients.find((p) => p.id === result.patientId) || null
  }, [result])

  const normalCount = useMemo(() => {
    if (!result) return 0
    return result.parameters.filter((p) => !p.isAbnormal).length
  }, [result])

  const abnormalCount = useMemo(() => {
    if (!result) return 0
    return result.parameters.filter((p) => p.isAbnormal && !p.isCritical).length
  }, [result])

  const criticalCount = useMemo(() => {
    if (!result) return 0
    return result.parameters.filter((p) => p.isCritical).length
  }, [result])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient Summary" description="Patient-friendly report summary" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader title="Patient Summary" actions={<Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>} />
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Report not found" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Your Test Results Summary"
        description="Plain language explanation of your lab test results"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button variant="outline" onClick={() => {
              const link = document.createElement("a")
              link.download = "patient-summary.pdf"
              link.click()
              toast({ title: "Downloading summary", description: "Patient summary is being downloaded.", variant: "default" })
            }}>
              <Download className="mr-2 h-4 w-4" />Download
            </Button>
          </div>
        }
      />

      <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-background">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{result.patientName}</h2>
              <p className="text-sm text-muted-foreground">
                {result.testName} &bull; {formatDate(result.enteredAt, "datetime")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />{normalCount} Normal
            </Badge>
            {abnormalCount > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />{abnormalCount} Needs Attention
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />{criticalCount} Critical
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {result.parameters.map((param) => {
          const status = getSimpleStatus(param)
          const explanation = getPlainLanguageExplanation(param)
          return (
            <Card key={param.parameterId} className={cn(status.variant === "destructive" && "border-destructive/30 bg-destructive/5", status.variant === "warning" && "border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/10")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", status.variant === "success" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : status.variant === "destructive" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400")}>
                        {status.icon}
                      </div>
                      <div>
                        <p className="font-medium">{param.parameterName}</p>
                        <p className="text-xs text-muted-foreground">
                          Your result: <span className="font-mono font-medium">{param.value} {param.unit}</span>
                          &nbsp;| Normal range: {param.referenceRange}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground pl-10">{explanation}</p>
                  </div>
                  <Badge variant={status.variant} className="flex items-center gap-1 shrink-0">
                    {status.icon}{status.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {result.pathologistComments && (
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Stethoscope className="h-4 w-4" />Doctor's Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{result.pathologistComments}</p>
          </CardContent>
        </Card>
      )}

      <div className="rounded-xl border bg-muted/30 p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{result.patientName}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Report ID: {result.id} &bull; Issued: {formatDate(result.enteredAt, "datetime")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          This summary is for informational purposes only. Please consult your doctor for medical advice.
        </p>
      </div>
    </div>
  )
}
