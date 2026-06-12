"use client"

import { useState, useEffect, useMemo } from "react"
import type { ChangeEvent } from "react"
import {
  Beaker,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  BarChart3,
  RefreshCw,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, generateId } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import type { QCRecord, CalibrationRecord } from "@/mock/data/quality-control"
import { qcRecords as mockQcRecords, calibrationRecords as mockCalibrationRecords } from "@/mock/data/quality-control"
import { instruments as mockInstruments } from "@/mock/data/instruments"
import { useAppStore } from "@/store/appStore"

const westgardRules = [
  { rule: "1₂s", description: "1 observation exceeds 2 SD", status: "pass" as const },
  { rule: "1₃s", description: "1 observation exceeds 3 SD", status: "pass" as const },
  { rule: "2₂s", description: "2 consecutive observations exceed 2 SD", status: "pass" as const },
  { rule: "R₄s", description: "2 observations differ by > 4 SD", status: "pass" as const },
  { rule: "4₁s", description: "4 consecutive observations exceed 1 SD", status: "warn" as const },
  { rule: "10x", description: "10 consecutive observations on one side of mean", status: "pass" as const },
]

const instrumentMap = new Map(mockInstruments.map((i) => [i.id, i.name]))

export default function InternalQCPage() {
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [testFilter, setTestFilter] = useState<string>("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("qc-runs")

  const [formData, setFormData] = useState({
    testName: "",
    batchNo: "",
    controlLevel: "normal",
    measuredValue: "",
    expectedValue: "",
    performedBy: "Current User",
    instrumentId: "",
  })

  useEffect(() => {
    setBreadcrumbs([{ label: "Quality Control" }])
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const uniqueTests = useMemo(
    () => [...new Set(mockQcRecords.map((r) => r.testName))],
    []
  )

  const filteredRecords = useMemo(
    () =>
      testFilter === "all"
        ? mockQcRecords
        : mockQcRecords.filter((r) => r.testName === testFilter),
    [testFilter]
  )

  const stats = useMemo(() => {
    const total = mockQcRecords.length
    const passed = mockQcRecords.filter((r) => r.isInControl).length
    const failed = total - passed
    const failedToday = mockQcRecords.filter(
      (r) => !r.isInControl && r.date.startsWith("2026-06-02")
    ).length
    const nextCalDue = "2026-06-15"
    return {
      total,
      passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      failedToday,
      nextCalDue,
    }
  }, [])

  const handleAddQcRun = async () => {
    if (!formData.testName || !formData.measuredValue || !formData.expectedValue) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }
    await new Promise((r) => setTimeout(r, 500))
    toast({ title: "QC Run added", description: "Quality control run has been recorded.", variant: "success" })
    setAddDialogOpen(false)
    setFormData({ testName: "", batchNo: "", controlLevel: "normal", measuredValue: "", expectedValue: "", performedBy: "Current User", instrumentId: "" })
  }

  const leveyJenningsData = useMemo(() => {
    const testData = testFilter === "all"
      ? mockQcRecords.filter((r) => r.testName === "Glucose (FBS)")
      : mockQcRecords.filter((r) => r.testName === testFilter)
    return testData.slice(0, 20).map((r, i) => ({
      run: i + 1,
      value: r.measuredValue,
      mean: r.expectedValue,
      upper1SD: r.expectedValue + r.sd,
      lower1SD: r.expectedValue - r.sd,
      upper2SD: r.expectedValue + 2 * r.sd,
      lower2SD: r.expectedValue - 2 * r.sd,
      upper3SD: r.expectedValue + 3 * r.sd,
      lower3SD: r.expectedValue - 3 * r.sd,
    }))
  }, [testFilter])

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quality Control" description="Internal quality control management" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quality Control"
        description="Internal quality control monitoring and management"
        actions={
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add QC Run
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add QC Run</DialogTitle>
                <DialogDescription>Record a new quality control run</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Test Parameter *</Label>
                  <Select
                    value={formData.testName}
                    onValueChange={(v) => setFormData((p) => ({ ...p, testName: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select test" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTests.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch/Lot #</Label>
                    <Input
                      value={formData.batchNo}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData((p) => ({ ...p, batchNo: e.target.value }))
                      }
                      placeholder="QC-BATCH-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Control Level</Label>
                    <Select
                      value={formData.controlLevel}
                      onValueChange={(v) => setFormData((p) => ({ ...p, controlLevel: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="level1">Level 1</SelectItem>
                        <SelectItem value="level2">Level 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                  <Label>Measured Value *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.measuredValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData((p) => ({ ...p, measuredValue: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expected Value *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={formData.expectedValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setFormData((p) => ({ ...p, expectedValue: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Instrument</Label>
                  <Select
                    value={formData.instrumentId}
                    onValueChange={(v) => setFormData((p) => ({ ...p, instrumentId: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select instrument" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockInstruments.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddQcRun}>Add Run</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard icon={<Beaker className="h-5 w-5" />} label="Total QC Runs" value={stats.total} />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Pass Rate"
          value={`${stats.passRate}%`}
          trend={stats.passRate >= 90 ? { value: stats.passRate, positive: true } : { value: 100 - stats.passRate, positive: false }}
        />
        <StatCard
          icon={<XCircle className="h-5 w-5" />}
          label="Failed Today"
          value={stats.failedToday}
          trend={stats.failedToday > 0 ? { value: stats.failedToday, positive: false } : undefined}
        />
        <StatCard icon={<Calendar className="h-5 w-5" />} label="Next Calibration Due" value={stats.nextCalDue} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="qc-runs">QC Runs</TabsTrigger>
          <TabsTrigger value="levey-jennings">Levey-Jennings Chart</TabsTrigger>
          <TabsTrigger value="westgard-rules">Westgard Rules</TabsTrigger>
          <TabsTrigger value="calibration">Calibration Records</TabsTrigger>
        </TabsList>

        <TabsContent value="qc-runs" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {uniqueTests.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Control Level</TableHead>
                  <TableHead>Lot #</TableHead>
                  <TableHead>Measured</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>SD</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Technologist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No QC records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">{formatDate(record.date, "datetime")}</TableCell>
                      <TableCell className="font-medium">{record.testName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.controlLevel}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{record.batchNo}</TableCell>
                      <TableCell className="font-mono">{record.measuredValue}</TableCell>
                      <TableCell className="font-mono">{record.expectedValue}</TableCell>
                      <TableCell className="font-mono">{record.calculatedSD.toFixed(2)}</TableCell>
                      <TableCell>
                        {record.isInControl ? (
                          <Badge variant="success">Pass</Badge>
                        ) : (
                          <Badge variant="destructive">Fail</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{record.performedBy}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="levey-jennings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4" />
                Levey-Jennings Control Chart
                {testFilter !== "all" && (
                  <Badge variant="secondary" className="ml-2">{testFilter}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leveyJenningsData.length === 0 ? (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No data available for chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={leveyJenningsData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="run" label={{ value: "Run #", position: "insideBottom", offset: -5 }} />
                    <YAxis label={{ value: "Value", angle: -90, position: "insideLeft" }} />
                    <RechartsTooltip />
                    <Legend />
                    <ReferenceLine y={leveyJenningsData[0]?.mean} stroke="var(--primary)" strokeDasharray="5 5" label="Mean" />
                    <ReferenceLine y={leveyJenningsData[0]?.upper1SD} stroke="var(--chart-2)" strokeDasharray="3 3" />
                    <ReferenceLine y={leveyJenningsData[0]?.lower1SD} stroke="var(--chart-2)" strokeDasharray="3 3" />
                    <ReferenceLine y={leveyJenningsData[0]?.upper2SD} stroke="var(--chart-4)" strokeDasharray="3 3" />
                    <ReferenceLine y={leveyJenningsData[0]?.lower2SD} stroke="var(--chart-4)" strokeDasharray="3 3" />
                    <ReferenceLine y={leveyJenningsData[0]?.upper3SD} stroke="var(--destructive)" strokeDasharray="3 3" />
                    <ReferenceLine y={leveyJenningsData[0]?.lower3SD} stroke="var(--destructive)" strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} name="Measured Value" />
                    <Line type="monotone" dataKey="mean" stroke="var(--primary)" strokeDasharray="5 5" strokeWidth={1} name="Mean" dot={false} />
                    <Line type="monotone" dataKey="upper1SD" stroke="var(--chart-2)" strokeDasharray="3 3" strokeWidth={1} name="±1 SD" dot={false} />
                    <Line type="monotone" dataKey="lower1SD" stroke="var(--chart-2)" strokeDasharray="3 3" strokeWidth={1} name="" dot={false} />
                    <Line type="monotone" dataKey="upper2SD" stroke="var(--chart-4)" strokeDasharray="3 3" strokeWidth={1} name="±2 SD" dot={false} />
                    <Line type="monotone" dataKey="lower2SD" stroke="var(--chart-4)" strokeDasharray="3 3" strokeWidth={1} name="" dot={false} />
                    <Line type="monotone" dataKey="upper3SD" stroke="var(--destructive)" strokeDasharray="3 3" strokeWidth={1} name="±3 SD" dot={false} />
                    <Line type="monotone" dataKey="lower3SD" stroke="var(--destructive)" strokeDasharray="3 3" strokeWidth={1} name="" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="westgard-rules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-4 w-4" />
                Westgard Rules Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {westgardRules.map((rule) => (
                  <div
                    key={rule.rule}
                    className={cn(
                      "rounded-lg border p-4",
                      rule.status === "pass" && "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20",
                      rule.status === "warn" && "border-amber-200 bg-amber-50 dark:bg-amber-950/20",
                      (rule.status as string) === "fail" && "border-destructive/50 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-lg font-bold">{rule.rule}</span>
                      {rule.status === "pass" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                      {rule.status === "warn" && (
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                      )}
                      {(rule.status as string) === "fail" && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{rule.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calibration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4" />
                Calibration Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Instrument</TableHead>
                      <TableHead>Performed By</TableHead>
                      <TableHead>Next Calibration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCalibrationRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                          No calibration records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockCalibrationRecords.map((cal) => (
                        <TableRow key={cal.id}>
                          <TableCell className="text-sm">{formatDate(cal.calibrationDate)}</TableCell>
                          <TableCell className="font-medium">{cal.instrumentName}</TableCell>
                          <TableCell className="text-sm">{cal.performedBy}</TableCell>
                          <TableCell className="text-sm">{formatDate(cal.nextCalibration)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                cal.status === "completed"
                                  ? "success"
                                  : cal.status === "overdue"
                                    ? "destructive"
                                    : cal.status === "failed"
                                      ? "destructive"
                                      : "warning"
                              }
                            >
                              {cal.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                            {cal.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
