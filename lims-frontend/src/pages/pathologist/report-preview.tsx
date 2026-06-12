"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  User,
  Calendar,
  Hash,
  FlaskConical,
  Stethoscope,
  Building2,
  ShieldCheck,
  QrCode,
  ChevronLeft,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import type { Result } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { patients as mockPatients } from "@/mock/data/patients"

export default function ReportPreviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const resultId = searchParams.get("id") || "RES001"
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Result | null>(null)
  const [pathologistComments, setPathologistComments] = useState("")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Pathologist" },
      { label: "Report Preview" },
    ])
    const timer = setTimeout(() => {
      const found = mockResults.find((r) => r.id === resultId)
      setResult(found || null)
      setPathologistComments(found?.pathologistComments || "")
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs, resultId])

  const patient = useMemo(() => {
    if (!result) return null
    return mockPatients.find((p) => p.id === result.patientId) || null
  }, [result])

  const handleApproveAndPublish = () => {
    toast({ title: "Report approved & published", description: `Report ${result?.id} has been approved and published.`, variant: "success" })
    navigate("/pathologist/queue")
  }

  const handleDownloadPDF = () => {
    const link = document.createElement("a")
    link.download = `report-${result?.id ?? "unknown"}.pdf`
    link.click()
    toast({ title: "Downloading PDF", description: "Your report is being downloaded.", variant: "default" })
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Preview" description="Professional report preview" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader title="Report Preview" description="Professional report preview" actions={<Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>} />
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Report not found" description="The requested report could not be found." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Preview"
        description={`Report ID: ${result.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleApproveAndPublish}>
              <CheckCircle2 className="mr-2 h-4 w-4" />Approve & Publish
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />Print
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border bg-white shadow-card overflow-hidden print:shadow-none print:border-none">
        <div className="bg-[#1a56db] p-6 text-white print:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">LifSys Diagnostics</h2>
                <p className="text-sm text-white/80">NABL & ISO 15189 Accredited Laboratory</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Report ID: {result.id}</p>
              <p className="text-xs text-white/70">Issued: {formatDate(result.enteredAt, "datetime")}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><User className="h-3 w-3" />Patient Name</div>
              <p className="font-medium">{result.patientName}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />Age / Gender</div>
              <p className="font-medium">{result.patientAge || "--"} yrs / {result.patientGender || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Hash className="h-3 w-3" />Patient ID</div>
              <p className="font-mono text-sm">{result.patientId || "--"}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Stethoscope className="h-3 w-3" />Ref. Doctor</div>
              <p className="font-medium">Dr. {patient ? "Referring" : "N/A"}</p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">{result.testName}</h3>
              {result.isCritical && <Badge variant="destructive">Critical</Badge>}
              {result.isAbnormal && !result.isCritical && <Badge variant="warning">Abnormal</Badge>}
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Parameter</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Result</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Unit</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Reference Range</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.parameters.map((param) => (
                    <tr key={param.parameterId} className={cn(param.isAbnormal && "bg-destructive/5")}>
                      <td className="px-4 py-2.5 font-medium">{param.parameterName}</td>
                      <td className={cn("px-4 py-2.5 font-mono font-medium", param.isAbnormal && "text-destructive")}>
                        {param.value}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{param.unit}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{param.referenceRange}</td>
                      <td className="px-4 py-2.5 text-center">
                        {param.isAbnormal ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            {parseFloat(param.value) > 0 ? "HIGH" : "LOW"}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0">Normal</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Pathologist Comments</h4>
            <Textarea
              placeholder="Add your professional comments on this report..."
              value={pathologistComments}
              onChange={(e) => setPathologistComments(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Digitally Signed</p>
                <p className="text-xs text-muted-foreground">Dr. Current User - Pathologist</p>
                <p className="text-xs text-muted-foreground">{formatDate(new Date().toISOString(), "datetime")}</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                <QrCode className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <span className="text-[10px] text-muted-foreground">Scan to Verify</span>
            </div>
          </div>
        </div>

        <div className="border-t bg-muted/30 p-4 text-center text-xs text-muted-foreground">
          <p>This report is electronically generated and does not require a physical signature.</p>
          <p>Results should be interpreted by a qualified physician.</p>
          <p className="mt-1">LifSys Diagnostics &bull; 123 Medical Complex, MG Road, Mumbai &bull; +91 22 4123 4001 &bull; www.lifsyslab.com</p>
        </div>
      </div>
    </div>
  )
}
