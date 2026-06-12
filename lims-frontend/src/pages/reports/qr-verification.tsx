"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import {
  QrCode,
  Scan,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Clock,
  User,
  FileText,
  ShieldCheck,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, generateId } from "@/lib/utils"
import type { Result } from "@/types"
import { results as mockResults } from "@/mock/data/results"

type VerificationStatus = "idle" | "verified" | "invalid" | "not_found"

interface VerificationLogEntry {
  id: string
  qrData: string
  status: VerificationStatus
  timestamp: string
  reportId?: string
}

export default function QrVerificationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)

  const [loading, setLoading] = useState(true)
  const [qrInput, setQrInput] = useState("")
  const [status, setStatus] = useState<VerificationStatus>("idle")
  const [verifiedResult, setVerifiedResult] = useState<Result | null>(null)
  const [verificationLog, setVerificationLog] = useState<VerificationLogEntry[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/dashboard" },
      { label: "Reports" },
      { label: "QR Verification" },
    ])
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [setBreadcrumbs])

  const handleVerify = () => {
    const code = qrInput.trim().toLowerCase()
    if (!code) return

    const found = mockResults.find(
      (r) =>
        r.id.toLowerCase() === code ||
        r.qrCode?.toLowerCase() === code ||
        r.bookingId.toLowerCase() === code
    )

    let newStatus: VerificationStatus
    let result: Result | null = null

    if (found) {
      newStatus = "verified"
      result = found
    } else if (code.startsWith("res") || code.startsWith("bkg")) {
      newStatus = "not_found"
      result = null
    } else {
      newStatus = "invalid"
      result = null
    }

    setStatus(newStatus)
    setVerifiedResult(result)

    const entry: VerificationLogEntry = {
      id: generateId(),
      qrData: qrInput,
      status: newStatus,
      timestamp: new Date().toISOString(),
      reportId: result?.id,
    }
    setVerificationLog((prev) => [entry, ...prev])

    if (newStatus === "verified") {
      toast({ title: "Report verified", description: `Report ${result?.id} is authentic.`, variant: "success" })
    } else if (newStatus === "not_found") {
      toast({ title: "Report not found", description: "No matching report found in the system.", variant: "destructive" })
    } else {
      toast({ title: "Invalid code", description: "The entered QR code is not valid.", variant: "destructive" })
    }
  }

  const stats = useMemo(() => {
    const total = verificationLog.length
    const verified = verificationLog.filter((e) => e.status === "verified").length
    const failed = verificationLog.filter((e) => e.status !== "verified").length
    return { total, verified, failed }
  }, [verificationLog])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="QR Verification" description="Verify report authenticity using QR codes" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[300px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="QR Verification" description="Verify report authenticity using QR codes" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Verify Report</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter QR Code or Report ID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Scan or type QR code data / Report ID..."
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
                <Button onClick={handleVerify} disabled={!qrInput.trim()}>
                  <Scan className="mr-2 h-4 w-4" />Verify
                </Button>
              </div>
            </div>

            {status !== "idle" && (
              <div className={cn("rounded-lg border p-6 text-center space-y-3", status === "verified" ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-destructive/50 bg-destructive/5")}>
                {status === "verified" ? (
                  <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500" />
                ) : status === "not_found" ? (
                  <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
                ) : (
                  <XCircle className="h-12 w-12 mx-auto text-destructive" />
                )}
                <div>
                  <p className="text-lg font-semibold">
                    {status === "verified" ? "Verified" : status === "not_found" ? "Not Found" : "Invalid Code"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {status === "verified"
                      ? "This report is authentic and registered in our system."
                      : status === "not_found"
                        ? "No matching report found. The code may be incorrect."
                        : "The entered data does not match a valid QR code format."}
                  </p>
                </div>
                {status === "verified" && verifiedResult && (
                  <div className="rounded-lg border bg-white dark:bg-background p-4 text-left space-y-2">
                    <div className="flex items-center gap-2 justify-center">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium">Report Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-xs text-muted-foreground">Report ID</span><p className="font-mono">{verifiedResult.id}</p></div>
                      <div><span className="text-xs text-muted-foreground">Patient</span><p>{verifiedResult.patientName}</p></div>
                      <div><span className="text-xs text-muted-foreground">Test</span><p>{verifiedResult.testName}</p></div>
                      <div><span className="text-xs text-muted-foreground">Status</span><p>{verifiedResult.status}</p></div>
                      <div className="col-span-2"><span className="text-xs text-muted-foreground">Issued</span><p>{formatDate(verifiedResult.enteredAt, "datetime")}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Verification Audit Log</CardTitle>
            <span className="text-xs text-muted-foreground">{stats.total} entries</span>
          </CardHeader>
          <CardContent>
            {verificationLog.length === 0 ? (
              <EmptyState icon={<QrCode className="h-12 w-12" />} title="No verifications yet" description="Verification attempts will appear here." />
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" /> {stats.verified} Verified</div>
                  <div className="flex items-center gap-1"><XCircle className="h-3 w-3 text-destructive" /> {stats.failed} Failed</div>
                  <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> Total {stats.total}</div>
                </div>
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto">
                  {verificationLog.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div className="flex items-center gap-2">
                        {entry.status === "verified" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : entry.status === "not_found" ? (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <div>
                          <p className="font-mono text-xs">{entry.qrData}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp, "datetime")}</p>
                        </div>
                      </div>
                      <Badge variant={entry.status === "verified" ? "success" : "destructive"} className="text-[10px]">
                        {entry.status === "verified" ? "Verified" : entry.status === "not_found" ? "Not Found" : "Invalid"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
