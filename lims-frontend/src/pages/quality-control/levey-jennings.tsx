"use client"

import { useState, useEffect, useMemo } from "react"
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getQCRecordsExtended, getLeveyJenningsData, getWestgardViolations } from "@/mock/services"
import type { QCRecord, WestgardViolation } from "@/types"

const testOptions = [
  { id: "TST001", name: "Glucose (FBS)" },
  { id: "TST004", name: "Total Cholesterol" },
  { id: "TST005", name: "ALT (SGPT)" },
  { id: "TST006", name: "Creatinine" },
  { id: "TST007", name: "Sodium" },
  { id: "TST013", name: "CRP" },
  { id: "TST015", name: "Hemoglobin" },
  { id: "TST036", name: "TSH" },
]

export default function LeveyJenningsPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testId, setTestId] = useState("TST001")
  const [records, setRecords] = useState<QCRecord[]>([])
  const [violations, setViolations] = useState<WestgardViolation[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "QC", href: "/quality-control" },
      { label: "Levey-Jennings" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [data, v] = await Promise.all([
          getLeveyJenningsData(testId, 30),
          getWestgardViolations(),
        ])
        setRecords(data)
        setViolations(v)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load QC data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [testId])

  const chartData = useMemo(() => {
    if (records.length === 0) return null
    const values = records.map((r) => r.value)
    const mean = values.reduce((s, v) => s + v, 0) / values.length
    const sqDiffs = values.map((v) => (v - mean) ** 2)
    const sd = Math.sqrt(sqDiffs.reduce((s, d) => s + d, 0) / values.length) || 1
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    return { mean, sd, values, min, max, range }
  }, [records])

  const relatedViolations = useMemo(() => {
    if (!records.length) return []
    const testName = records[0]?.testName
    return violations.filter((v) =>
      v.qcRecordIds.some((id) => records.some((r) => r.id === id))
    )
  }, [records, violations])

  const pointColor = (value: number, mean: number, sd: number): string => {
    const diff = Math.abs(value - mean)
    if (diff > 3 * sd) return "bg-red-500"
    if (diff > 2 * sd) return "bg-amber-500"
    return "bg-emerald-500"
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Levey-Jennings Chart" description="Visual QC data with control limits" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Levey-Jennings Chart" description="Visual QC data with control limits" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  const selectedTest = testOptions.find((t) => t.id === testId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Levey-Jennings Chart"
        description="Visual QC data with control limits"
      />

      <div className="flex items-center gap-3">
        <Select value={testId} onValueChange={setTestId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Select test" />
          </SelectTrigger>
          <SelectContent>
            {testOptions.map((t) => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{records.length} data points</span>
      </div>

      {!chartData || records.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No QC data"
          description="No QC records found for the selected test"
        />
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{selectedTest?.name} - Levey-Jennings Chart</CardTitle>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> In Control</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-amber-500" /> Warning (2SD)</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-red-500" /> Out (3SD)</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-72">
                <div className="absolute inset-0 flex flex-col justify-between py-2">
                  <div className="relative h-full">
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-red-400/50" style={{ top: `${((chartData.mean + 3 * chartData.sd - chartData.min) / chartData.range) * 100}%` }}>
                      <span className="absolute -top-3 left-1 text-[10px] text-red-500">+3SD</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-amber-400/50" style={{ top: `${((chartData.mean + 2 * chartData.sd - chartData.min) / chartData.range) * 100}%` }}>
                      <span className="absolute -top-3 left-1 text-[10px] text-amber-500">+2SD</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-primary" style={{ top: `${((chartData.mean - chartData.min) / chartData.range) * 100}%` }}>
                      <span className="absolute -top-3 left-1 text-[10px] text-primary">Mean ({chartData.mean.toFixed(2)})</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-amber-400/50" style={{ top: `${((chartData.mean - 2 * chartData.sd - chartData.min) / chartData.range) * 100}%` }}>
                      <span className="absolute -top-3 left-1 text-[10px] text-amber-500">-2SD</span>
                    </div>
                    <div className="absolute left-0 right-0 top-0 border-t border-dashed border-red-400/50" style={{ top: `${((chartData.mean - 3 * chartData.sd - chartData.min) / chartData.range) * 100}%` }}>
                      <span className="absolute -top-3 left-1 text-[10px] text-red-500">-3SD</span>
                    </div>
                    <div className="absolute left-10 right-4 bottom-0 top-0 flex items-end">
                      {records.map((r, i) => {
                        const yPos = ((r.value - chartData.min) / chartData.range) * 100
                        const color = pointColor(r.value, chartData.mean, chartData.sd)
                        return (
                          <div
                            key={r.id}
                            className="flex-1 flex flex-col items-center justify-end relative group"
                          >
                            <div
                              className={cn("h-2.5 w-2.5 rounded-full cursor-pointer transition-transform hover:scale-150 z-10", color)}
                              style={{ marginBottom: `${yPos}%` }}
                              title={`${r.value} (${formatDate(r.performedAt, "short")})`}
                            />
                            <div className="absolute bottom-0 left-1/2 w-px bg-muted-foreground/10 h-full -z-10" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-10 right-4 flex justify-between text-[10px] text-muted-foreground pt-1 border-t">
                  {records.filter((_, i) => i % Math.max(1, Math.floor(records.length / 5)) === 0 || i === records.length - 1).map((r) => (
                    <span key={r.id}>{formatDate(r.performedAt, "short")}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Mean</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{chartData.mean.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Standard Deviation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">{chartData.sd.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">CV%</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">
                  {chartData.mean > 0 ? ((chartData.sd / chartData.mean) * 100).toFixed(2) : "N/A"}%
                </p>
              </CardContent>
            </Card>
          </div>

          {relatedViolations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <CardTitle className="text-sm">Westgard Rules Violated</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedViolations.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={v.severity === "out_of_control" ? "destructive" : "warning"} className="text-[10px]">{v.rule}</Badge>
                      <span className="text-muted-foreground">{v.description}</span>
                    </div>
                    <Badge variant={v.severity === "out_of_control" ? "destructive" : "warning"}>{v.severity.replace(/_/g, " ")}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Data Points</CardTitle>
              <CardDescription>Last {records.length} QC results for {selectedTest?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Mean</TableHead>
                    <TableHead>SD</TableHead>
                    <TableHead>Deviation</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.slice(-20).reverse().map((r) => {
                    const dev = chartData ? ((r.value - chartData.mean) / (chartData.sd || 1)).toFixed(2) : "0"
                    return (
                      <TableRow key={r.id}>
                        <TableCell>{formatDate(r.performedAt, "short")}</TableCell>
                        <TableCell>{r.level}</TableCell>
                        <TableCell className="font-mono">{r.value}</TableCell>
                        <TableCell className="font-mono">{chartData?.mean.toFixed(2) ?? r.mean}</TableCell>
                        <TableCell className="font-mono">{chartData?.sd.toFixed(2) ?? r.sd}</TableCell>
                        <TableCell className={cn(
                          "font-mono",
                          Math.abs(Number(dev)) > 3 ? "text-red-500" : Math.abs(Number(dev)) > 2 ? "text-amber-500" : "text-emerald-500"
                        )}>
                          {dev}SD
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            r.result === "in_control" ? "success" :
                            r.result === "warning" ? "warning" : "destructive"
                          }>
                            {r.result.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
