"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router"
import {
  FileText,
  Download,
  Printer,
  Share2,
  Building2,
  User,
  Calendar,
  Hash,
  FlaskConical,
  Stethoscope,
  ShieldCheck,
  QrCode,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Result } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { patients as mockPatients } from "@/mock/data/patients"
import { reportTemplates } from "@/mock/data/report-templates"

export default function PdfPreviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const resultId = searchParams.get("id") || "RES001"
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<Result | null>(null)
  const [page, setPage] = useState(1)
  const totalPages = 1

  const template = reportTemplates.find((t) => t.isDefault) || reportTemplates[0]

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "Preview" },
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

  const handleDownload = () => {
    const link = document.createElement("a")
    link.download = "report-preview.pdf"
    link.click()
    toast({ title: "Downloading PDF", description: "Report PDF is being downloaded.", variant: "default" })
  }
  const handlePrint = () => window.print()
  const handleShare = () => toast({ title: "Share link copied", description: "Report share link has been copied to clipboard.", variant: "success" })

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="PDF Preview" description="Professional PDF-style report preview" />
        <Skeleton className="h-[700px] w-full rounded-xl" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="space-y-6">
        <PageHeader title="PDF Preview" actions={<Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>} />
        <EmptyState icon={<FileText className="h-12 w-12" />} title="Report not found" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="PDF Preview"
        description={`Report: ${result.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />Download</Button>
            <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
            <Button variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4" />Share</Button>
          </div>
        }
      />

      <div className="rounded-xl border bg-white shadow-card overflow-hidden print:shadow-none print:border-none" style={{ fontFamily: template.fontFamily }}>
        <div className="p-6" style={{ backgroundColor: template.headerColor }}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/20">
                {template.logoUrl ? (
                  <img src={template.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                  <Building2 className="h-7 w-7" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold">LifSys Diagnostics</h1>
                <p className="text-sm text-white/80">NABL & ISO 15189 Accredited</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Report ID: {result.id}</p>
              <p className="text-xs text-white/70">Issued: {formatDate(result.enteredAt, "datetime")}</p>
              <StatusBadge status={result.status} />
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
              <p className="font-medium">Dr. Referring Physician</p>
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">{result.testName}</h3>
              {result.isCritical && <Badge variant="destructive">Critical</Badge>}
            </div>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Parameter</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Result</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Unit</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Reference Range</th>
                    <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.parameters.map((param, idx) => (
                    <tr key={param.parameterId} className={cn(param.isAbnormal && "bg-destructive/5")}>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-medium">{param.parameterName}</td>
                      <td className={cn("px-4 py-2.5 font-mono font-semibold", param.isAbnormal && "text-destructive")}>
                        {param.value}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{param.unit}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{param.referenceRange}</td>
                      <td className="px-4 py-2.5 text-center">
                        {param.isAbnormal ? (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Abnormal</Badge>
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

          {result.pathologistComments && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="text-sm font-medium mb-1">Pathologist Comments</h4>
              <p className="text-sm text-muted-foreground">{result.pathologistComments}</p>
            </div>
          )}

          {result.notes && (
            <div className="rounded-lg border bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800 p-4">
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">Clinical Notes</h4>
              <p className="text-sm text-amber-600/80 dark:text-amber-400/80">{result.notes}</p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">
                  {result.approvedBy ? `Dr. ${result.approvedBy}` : "Pending Signature"}
                </p>
                <p className="text-xs text-muted-foreground">Pathologist</p>
                {result.approvedAt && (
                  <p className="text-xs text-muted-foreground">{formatDate(result.approvedAt, "datetime")}</p>
                )}
              </div>
            </div>
            {template.showQR && (
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30">
                  <QrCode className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <span className="text-[10px] text-muted-foreground">Scan to Verify</span>
              </div>
            )}
          </div>
        </div>

        <div className="border-t bg-muted/30 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>{template.footer}</p>
            <p>Page {page} of {totalPages}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
