"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { ChangeEvent } from "react"
import { useNavigate } from "react-router"
import { ClipboardList, Save, Send, ChevronLeft, CheckCircle2, FlaskConical, ClipboardCheck } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, generateId } from "@/lib/utils"
import type { Result } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { samples as mockSamples } from "@/mock/data/samples"
import { useAppStore } from "@/store/appStore"

interface BatchEntry {
  resultId: string
  patientName: string
  testName: string
  sampleId: string
  values: Record<string, string>
}

export default function BulkResultEntryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBreadcrumbs([{ label: "Results", href: "/results" }, { label: "Bulk Entry" }])
  }, [])
  const [saving, setSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchMode, setBatchMode] = useState(false)
  const [batchEntries, setBatchEntries] = useState<BatchEntry[]>([])
  const [activeTab, setActiveTab] = useState("")

  const draftResults = useMemo(() => mockResults.filter((r) => r.status === "draft"), [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === draftResults.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(draftResults.map((r) => r.id)))
    }
  }, [draftResults, selectedIds])

  const handleStartBatch = useCallback(() => {
    const selected = draftResults.filter((r) => selectedIds.has(r.id))
    const entries: BatchEntry[] = selected.map((r) => ({
      resultId: r.id,
      patientName: r.patientName,
      testName: r.testName,
      sampleId: r.sampleId,
      values: Object.fromEntries(r.parameters.map((p) => [p.parameterId, p.value])),
    }))
    setBatchEntries(entries)
    if (entries.length > 0) {
      setActiveTab(entries[0].resultId)
    }
    setBatchMode(true)
  }, [draftResults, selectedIds])

  const handleValueChange = useCallback((resultId: string, paramId: string, value: string) => {
    setBatchEntries((prev) =>
      prev.map((e) =>
        e.resultId === resultId
          ? { ...e, values: { ...e.values, [paramId]: value } }
          : e
      )
    )
  }, [])

  const handleSaveAll = useCallback(
    async (submitForReview: boolean) => {
      setSaving(true)
      await new Promise((r) => setTimeout(r, 1200))
      toast({
        title: submitForReview ? "Submitted for review" : "Drafts saved",
        description: `${batchEntries.length} result${batchEntries.length > 1 ? "s" : ""} ${submitForReview ? "submitted for review" : "saved as draft"}.`,
        variant: "success",
      })
      setSaving(false)
      setBatchMode(false)
      setBatchEntries([])
      setSelectedIds(new Set())
    },
    [batchEntries, toast]
  )

  const progressValue = batchEntries.length > 0
    ? Math.round((batchEntries.filter((e) =>
        Object.values(e.values).every((v) => v.trim() !== "")
      ).length / batchEntries.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Bulk Result Entry" description="Enter results for multiple samples" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (batchMode) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Bulk Result Entry"
          description={`Editing ${batchEntries.length} result${batchEntries.length > 1 ? "s" : ""}`}
          actions={
            <Button variant="outline" onClick={() => setBatchMode(false)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Selection
            </Button>
          }
        />

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Progress</span>
                <Progress value={progressValue} className="w-48" variant={progressValue === 100 ? "success" : "default"} />
                <span className="text-sm text-muted-foreground">{progressValue}%</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => handleSaveAll(false)} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save All"}
                </Button>
                <Button onClick={() => handleSaveAll(true)} disabled={saving}>
                  <Send className="mr-2 h-4 w-4" />
                  {saving ? "Submitting..." : "Submit All"}
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <ScrollArea className="mb-4">
                <TabsList className="inline-flex w-max">
                  {batchEntries.map((entry) => {
                    const isComplete = Object.values(entry.values).every((v) => v.trim() !== "")
                    return (
                      <TabsTrigger key={entry.resultId} value={entry.resultId} className="gap-2">
                        {isComplete && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        <span className="max-w-[120px] truncate">{entry.patientName}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </ScrollArea>

              {batchEntries.map((entry) => {
                const result = draftResults.find((r) => r.id === entry.resultId)
                return (
                  <TabsContent key={entry.resultId} value={entry.resultId} className="mt-4">
                    <div className="mb-4 rounded-lg border bg-muted/50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{entry.patientName}</p>
                          <p className="text-sm text-muted-foreground">{entry.testName}</p>
                        </div>
                        <Badge variant="outline">Sample: {entry.sampleId}</Badge>
                      </div>
                    </div>
                    {result?.parameters.map((param) => (
                      <div key={param.parameterId} className="mb-3 rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <Label>{param.parameterName}</Label>
                            <div className="flex items-center gap-3">
                              <Input
                                type="text"
                                value={entry.values[param.parameterId] ?? ""}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                  handleValueChange(entry.resultId, param.parameterId, e.target.value)
                                }
                                className="w-40 font-mono"
                                placeholder="Enter value"
                              />
                              <span className="text-sm text-muted-foreground">{param.unit}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <Label className="text-xs text-muted-foreground">Reference Range</Label>
                            <p className="text-sm">{param.referenceRange}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Result Entry"
        description="Select multiple pending samples for batch result entry"
        actions={
          <Button variant="outline" onClick={() => navigate("/results")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Single Entry
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              Pending Results ({draftResults.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === draftResults.length ? "Deselect All" : "Select All"}
              </Button>
              <Button
                size="sm"
                onClick={handleStartBatch}
                disabled={selectedIds.size === 0}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Enter Results ({selectedIds.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {draftResults.length === 0 ? (
            <EmptyState
              icon={<FlaskConical className="h-12 w-12" />}
              title="No pending results"
              description="All results have been entered. Check back later for new samples."
              action={
                <Button variant="outline" onClick={() => navigate("/results")}>
                  Go to Single Entry
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-4 border-b pb-2 text-xs font-medium text-muted-foreground">
                <div />
                <span>Patient</span>
                <span>Test</span>
                <span>Sample ID</span>
                <span>Parameters</span>
              </div>
              {draftResults.map((result) => (
                <div
                  key={result.id}
                  className={cn(
                    "grid grid-cols-[40px_1fr_1fr_1fr_1fr] gap-4 rounded-lg border p-3 transition-colors",
                    selectedIds.has(result.id) && "border-primary bg-accent"
                  )}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIds.has(result.id)}
                      onCheckedChange={() => handleToggleSelect(result.id)}
                    />
                  </div>
                  <div className="flex items-center font-medium">{result.patientName}</div>
                  <div className="flex items-center text-sm text-muted-foreground">{result.testName}</div>
                  <div className="flex items-center text-sm text-muted-foreground">{result.sampleId}</div>
                  <div className="flex items-center text-sm text-muted-foreground">{result.parameters.length} params</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
