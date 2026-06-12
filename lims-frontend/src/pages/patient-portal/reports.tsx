"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Download,
  Share2,
  Printer,
  QrCode,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  X,
  RotateCcw,
  ArrowLeft,
} from "lucide-react"
import { cn, formatDate, generateId } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

type ReportStatus = "completed" | "pending" | "review"
type TestCategory = "Biochemistry" | "Hematology" | "Immunology" | "Microbiology" | "Endocrinology"

interface ReportParameter {
  name: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
  isCritical: boolean
}

interface Report {
  id: string
  testName: string
  category: TestCategory
  date: string
  status: ReportStatus
  labName: string
  parameters: ReportParameter[]
  summary?: string
}

const reportsData: Report[] = [
  {
    id: "RPT001",
    testName: "Complete Blood Count",
    category: "Hematology",
    date: "2026-06-08T10:30:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "Hemoglobin", value: "14.2", unit: "g/dL", referenceRange: "13.0 - 17.0", isAbnormal: false, isCritical: false },
      { name: "RBC Count", value: "5.1", unit: "M/uL", referenceRange: "4.5 - 5.5", isAbnormal: false, isCritical: false },
      { name: "WBC Count", value: "7,800", unit: "/uL", referenceRange: "4,000 - 11,000", isAbnormal: false, isCritical: false },
      { name: "Platelets", value: "2.1", unit: "L/uL", referenceRange: "1.5 - 4.5", isAbnormal: false, isCritical: false },
      { name: "Neutrophils", value: "62", unit: "%", referenceRange: "40 - 80", isAbnormal: false, isCritical: false },
      { name: "Lymphocytes", value: "28", unit: "%", referenceRange: "20 - 40", isAbnormal: false, isCritical: false },
    ],
    summary: "All parameters are within normal ranges. No abnormalities detected.",
  },
  {
    id: "RPT002",
    testName: "Lipid Profile",
    category: "Biochemistry",
    date: "2026-06-08T10:30:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "Total Cholesterol", value: "218", unit: "mg/dL", referenceRange: "< 200", isAbnormal: true, isCritical: false },
      { name: "Triglycerides", value: "185", unit: "mg/dL", referenceRange: "< 150", isAbnormal: true, isCritical: false },
      { name: "HDL Cholesterol", value: "38", unit: "mg/dL", referenceRange: "> 40", isAbnormal: true, isCritical: false },
      { name: "LDL Cholesterol", value: "142", unit: "mg/dL", referenceRange: "< 130", isAbnormal: true, isCritical: false },
      { name: "VLDL Cholesterol", value: "37", unit: "mg/dL", referenceRange: "< 30", isAbnormal: true, isCritical: false },
    ],
    summary: "Elevated cholesterol and triglycerides detected. Dietary changes and exercise recommended.",
  },
  {
    id: "RPT003",
    testName: "Fasting Blood Sugar",
    category: "Biochemistry",
    date: "2026-06-05T09:00:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "Glucose (Fasting)", value: "95", unit: "mg/dL", referenceRange: "70 - 110", isAbnormal: false, isCritical: false },
    ],
    summary: "Fasting blood sugar is within normal range.",
  },
  {
    id: "RPT004",
    testName: "HbA1c",
    category: "Biochemistry",
    date: "2026-06-01T08:00:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "HbA1c", value: "6.8", unit: "%", referenceRange: "< 5.7", isAbnormal: true, isCritical: false },
      { name: "eAG", value: "148", unit: "mg/dL", referenceRange: "< 117", isAbnormal: true, isCritical: false },
    ],
    summary: "HbA1c is elevated, indicating prediabetes. Continue monitoring and follow dietary guidelines.",
  },
  {
    id: "RPT005",
    testName: "Thyroid Profile",
    category: "Endocrinology",
    date: "2026-05-28T11:00:00Z",
    status: "pending",
    labName: "Central Lab - Bangalore",
    parameters: [],
  },
  {
    id: "RPT006",
    testName: "Vitamin D & B12",
    category: "Biochemistry",
    date: "2026-05-28T11:00:00Z",
    status: "pending",
    labName: "Central Lab - Bangalore",
    parameters: [],
  },
  {
    id: "RPT007",
    testName: "Liver Function Test",
    category: "Biochemistry",
    date: "2026-06-05T09:00:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "ALT (SGPT)", value: "32", unit: "U/L", referenceRange: "10 - 40", isAbnormal: false, isCritical: false },
      { name: "AST (SGOT)", value: "28", unit: "U/L", referenceRange: "10 - 35", isAbnormal: false, isCritical: false },
      { name: "ALP", value: "85", unit: "U/L", referenceRange: "44 - 147", isAbnormal: false, isCritical: false },
      { name: "Total Bilirubin", value: "0.8", unit: "mg/dL", referenceRange: "0.3 - 1.2", isAbnormal: false, isCritical: false },
      { name: "Total Protein", value: "7.2", unit: "g/dL", referenceRange: "6.0 - 8.0", isAbnormal: false, isCritical: false },
      { name: "Albumin", value: "4.1", unit: "g/dL", referenceRange: "3.5 - 5.0", isAbnormal: false, isCritical: false },
    ],
    summary: "All liver function parameters are within normal ranges.",
  },
  {
    id: "RPT008",
    testName: "Serum Creatinine",
    category: "Biochemistry",
    date: "2026-05-20T08:00:00Z",
    status: "completed",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "Serum Creatinine", value: "1.1", unit: "mg/dL", referenceRange: "0.7 - 1.3", isAbnormal: false, isCritical: false },
      { name: "BUN", value: "18", unit: "mg/dL", referenceRange: "7 - 25", isAbnormal: false, isCritical: false },
    ],
    summary: "Kidney function markers are within normal range.",
  },
  {
    id: "RPT009",
    testName: "Iron Studies",
    category: "Biochemistry",
    date: "2026-05-15T10:00:00Z",
    status: "review",
    labName: "Central Lab - Bangalore",
    parameters: [
      { name: "Serum Iron", value: "45", unit: "ug/dL", referenceRange: "60 - 170", isAbnormal: true, isCritical: false },
      { name: "Ferritin", value: "22", unit: "ng/mL", referenceRange: "30 - 400", isAbnormal: true, isCritical: false },
      { name: "TIBC", value: "420", unit: "ug/dL", referenceRange: "250 - 450", isAbnormal: false, isCritical: false },
    ],
  },
]

const categories: TestCategory[] = ["Biochemistry", "Hematology", "Immunology", "Microbiology", "Endocrinology"]

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "secondary" }> = {
  completed: { label: "Completed", variant: "success" },
  pending: { label: "Pending", variant: "warning" },
  review: { label: "Under Review", variant: "secondary" },
}

export default function PatientPortalReports() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [showShareOptions, setShowShareOptions] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredReports = useMemo(() => {
    return reportsData.filter((r) => {
      const matchesSearch = !search || r.testName.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = categoryFilter === "all" || r.category === categoryFilter
      const matchesStatus = statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [search, categoryFilter, statusFilter])

  const recentCompleted = useMemo(() =>
    reportsData.filter((r) => r.status === "completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [])

  const aiSummary = useMemo(() => {
    if (recentCompleted.length === 0) return null
    const latest = recentCompleted[0]
    const abnormalCount = latest.parameters.filter((p) => p.isAbnormal).length
    const totalCount = latest.parameters.length
    return {
      testName: latest.testName,
      date: latest.date,
      summary: latest.summary,
      normalCount: totalCount - abnormalCount,
      abnormalCount,
      totalCount,
    }
  }, [recentCompleted])

  const toggleExpand = (id: string) => {
    setExpandedReport(expandedReport === id ? null : id)
    setShowShareOptions(null)
  }

  const handleDownload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toast({ title: "Downloading Report", description: "Your report is being downloaded as PDF", variant: "default" })
  }

  const handlePrint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    toast({ title: "Printing Report", description: "Sending report to printer", variant: "default" })
  }

  const handleShare = (id: string, method: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareOptions(null)
    toast({ title: "Sharing Report", description: `Report shared via ${method}`, variant: "default" })
  }

  const getStatusBadge = (status: ReportStatus) => {
    const config = statusConfig[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Reports"
        description="View and manage your test reports"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Downloading All", description: "Preparing ZIP of all reports", variant: "default" })}>
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        }
      />

      {/* AI Report Summary */}
      {aiSummary && (
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2.5 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">AI Report Summary</h3>
                  <Badge variant="secondary" className="text-[10px]">Latest Report</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{aiSummary.summary}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-muted-foreground">{aiSummary.normalCount} Normal</span>
                  </span>
                  {aiSummary.abnormalCount > 0 && (
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      <span className="text-muted-foreground">{aiSummary.abnormalCount} Needs Attention</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on {aiSummary.testName} &middot; {formatDate(aiSummary.date, "short")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by test name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
              </SelectContent>
            </Select>
            {(search || categoryFilter !== "all" || statusFilter !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategoryFilter("all"); setStatusFilter("all") }}>
                <RotateCcw className="mr-1 h-3 w-3" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="No reports found"
          description="Try adjusting your search or filter criteria"
        />
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report) => {
            const isExpanded = expandedReport === report.id
            return (
              <Card
                key={report.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  isExpanded && "ring-1 ring-primary",
                  report.status === "pending" && "opacity-70"
                )}
                onClick={() => report.status === "completed" && toggleExpand(report.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "rounded-lg p-2.5",
                        report.status === "completed" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300" :
                        report.status === "pending" ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300" :
                        "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{report.testName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDate(report.date, "short")}</span>
                          <span>&middot;</span>
                          <span>{report.labName}</span>
                          <span>&middot;</span>
                          <Badge variant="outline" className="text-[10px] px-1.5">{report.category}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(report.status)}
                      {report.status === "completed" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDownload(report.id, e)} title="Download PDF">
                            <Download className="h-4 w-4" />
                          </Button>
                          <div className="relative">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setShowShareOptions(showShareOptions === report.id ? null : report.id) }} title="Share">
                              <Share2 className="h-4 w-4" />
                            </Button>
                            {showShareOptions === report.id && (
                              <Card className="absolute right-0 top-8 z-50 w-40 shadow-xl" onClick={(e) => e.stopPropagation()}>
                                <CardContent className="p-1.5">
                                  {["WhatsApp", "Email", "SMS"].map((method) => (
                                    <Button key={method} variant="ghost" className="w-full justify-start text-sm" size="sm" onClick={(e) => handleShare(report.id, method, e)}>
                                      {method}
                                    </Button>
                                  ))}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handlePrint(report.id, e)} title="Print">
                            <Printer className="h-4 w-4" />
                          </Button>
                          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                        </>
                      )}
                      {report.status === "pending" && <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Report Details */}
                  {isExpanded && report.status === "completed" && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                      {/* Parameters Table */}
                      <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/50">
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Parameter</th>
                              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Result</th>
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Unit</th>
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Reference Range</th>
                              <th className="px-3 py-2 text-center font-medium text-muted-foreground">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {report.parameters.map((param, idx) => (
                              <tr key={idx} className={cn(param.isAbnormal && "bg-amber-50 dark:bg-amber-950/20")}>
                                <td className="px-3 py-2 font-medium">{param.name}</td>
                                <td className={cn("px-3 py-2 text-right font-mono", param.isAbnormal ? "text-amber-600 dark:text-amber-400" : "", param.isCritical ? "text-destructive font-bold" : "")}>
                                  {param.value}
                                </td>
                                <td className="px-3 py-2 text-muted-foreground">{param.unit}</td>
                                <td className="px-3 py-2 text-muted-foreground">{param.referenceRange}</td>
                                <td className="px-3 py-2 text-center">
                                  {param.isAbnormal && (
                                    <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                      <AlertTriangle className="h-3 w-3" />
                                      {param.isCritical ? "Critical" : "Abnormal"}
                                    </span>
                                  )}
                                  {!param.isAbnormal && (
                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Normal
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* QR Code & Actions */}
                      <div className="flex items-start gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-white dark:bg-black">
                            <QrCode className="h-14 w-14 text-primary" />
                          </div>
                          <span className="text-[10px] text-muted-foreground">Scan to verify</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {report.summary && (
                            <div className="rounded-lg bg-muted p-3">
                              <p className="text-xs font-medium text-muted-foreground">Clinical Note</p>
                              <p className="text-sm">{report.summary}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={(e) => handleDownload(report.id, e)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                            <Button size="sm" variant="outline" onClick={(e) => handlePrint(report.id, e)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
