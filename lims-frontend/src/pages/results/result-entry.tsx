"use client"

import { useState, useEffect, useCallback } from "react"
import type { ChangeEvent } from "react"
import { useNavigate } from "react-router"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resultEntrySchema, type ResultEntryForm } from "@/lib/validations"
import { Search, FileText, Save, Send, AlertTriangle, Stethoscope, ClipboardList, Beaker, Loader2 } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn, formatDate, generateId } from "@/lib/utils"
import { FormTextarea } from "@/components/forms/form-textarea"
import type { Result, ResultParameter, Booking, Sample } from "@/types"
import { results as mockResults } from "@/mock/data/results"
import { bookings as mockBookings } from "@/mock/data/bookings"
import { samples as mockSamples } from "@/mock/data/samples"
import { useAppStore } from "@/store/appStore"

const statusConfig = {
  draft: { label: "Draft", variant: "warning" as const },
  review: { label: "Review", variant: "default" as const },
  verified: { label: "Verified", variant: "default" as const },
  validated: { label: "Validated", variant: "success" as const },
  approved: { label: "Approved", variant: "success" as const },
  published: { label: "Published", variant: "secondary" as const },
  amended: { label: "Amended", variant: "warning" as const },
}

function evaluateAbnormality(param: ResultParameter): { isHigh: boolean; isLow: boolean; isCritical: boolean } {
  const numVal = parseFloat(param.value)
  if (isNaN(numVal)) return { isHigh: false, isLow: false, isCritical: false }

  const rangeStr = param.referenceRange
  let isHigh = false
  let isLow = false
  let isCritical = false

  if (rangeStr.startsWith("< ")) {
    const upper = parseFloat(rangeStr.replace("< ", ""))
    if (numVal > upper) isHigh = true
  } else if (rangeStr.startsWith("> ")) {
    const lower = parseFloat(rangeStr.replace("> ", ""))
    if (numVal < lower) isLow = true
  } else if (rangeStr.includes(" - ")) {
    const parts = rangeStr.split(" - ")
    const lower = parseFloat(parts[0])
    const upper = parseFloat(parts[1])
    if (numVal > upper) isHigh = true
    if (numVal < lower) isLow = true
  }

  isCritical = param.isCritical

  return { isHigh, isLow, isCritical }
}

export default function ResultEntryPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setBreadcrumbs([{ label: "Results", href: "/results" }])
  }, [])
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [criticalAlert, setCriticalAlert] = useState<{ param: ResultParameter; index: number } | null>(null)

  const methods = useForm<ResultEntryForm>({
    resolver: zodResolver(resultEntrySchema),
    defaultValues: { parameterValues: {}, notes: "" },
  })

  const pendingResults = mockResults.filter((r) => r.status === "draft" || r.status === "review")

  const bookingsMap = new Map(mockBookings.map((b) => [b.id, b]))

  const filteredBookings = searchQuery
    ? mockBookings.filter(
        (b) =>
          b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleSelectBooking = useCallback(
    (booking: Booking) => {
      setSelectedBooking(booking)
      const existing = pendingResults.find((r) => r.bookingId === booking.id)
      if (existing) {
        setSelectedResult(existing)
        const values: Record<string, string> = {}
        existing.parameters.forEach((p) => {
          values[p.parameterId] = p.value
        })
        methods.reset({ parameterValues: values, notes: existing.notes || "" })
      } else {
        setSelectedResult(null)
        methods.reset({ parameterValues: {}, notes: "" })
      }
    },
    [pendingResults]
  )

  const handleValueChange = useCallback(
    (paramId: string, value: string, param: ResultParameter) => {
      methods.setValue(`parameterValues.${paramId}`, value, { shouldDirty: true })

      const numVal = parseFloat(value)
      if (!isNaN(numVal)) {
        const rangeStr = param.referenceRange
        if (param.isCritical) {
          setCriticalAlert({ param: { ...param, value }, index: 0 })
        } else if (rangeStr.includes(" - ")) {
          const parts = rangeStr.split(" - ")
          const lower = parseFloat(parts[0])
          const upper = parseFloat(parts[1])
          if (numVal > upper * 1.5 || numVal < lower * 0.5) {
            setCriticalAlert({ param: { ...param, value }, index: 0 })
          }
        }
      }
    },
    []
  )

  const onSubmit = useCallback(
    async (data: ResultEntryForm) => {
      setSaving(true)
      await new Promise((r) => setTimeout(r, 800))
      toast({
        title: "Results saved",
        description: `Result for ${selectedBooking?.patientName} has been saved.`,
        variant: "success",
      })
      setSaving(false)
      setSelectedBooking(null)
      setSelectedResult(null)
      methods.reset({ parameterValues: {}, notes: "" })
    },
    [selectedBooking, toast]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Result Entry" description="Enter and manage test results" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Result Entry"
        description="Enter and manage test results for patient samples"
        actions={
          <Button variant="outline" onClick={() => navigate("/results/bulk")}>
            <ClipboardList className="mr-2 h-4 w-4" />
            Bulk Entry
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4" />
              Search Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by patient name or booking ID..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="mt-4 h-[400px]">
              {searchQuery ? (
                filteredBookings.length === 0 ? (
                  <EmptyState
                    icon={<Search className="h-8 w-8" />}
                    title="No bookings found"
                    description="Try a different search term"
                  />
                ) : (
                  <div className="space-y-2">
                    {filteredBookings.map((booking) => {
                      const result = pendingResults.find((r) => r.bookingId === booking.id)
                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => handleSelectBooking(booking)}
                          className={cn(
                            "w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent",
                            selectedBooking?.id === booking.id && "border-primary bg-accent"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{booking.patientName}</span>
                            {result && (
                              <Badge variant={statusConfig[result.status].variant}>
                                {statusConfig[result.status].label}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">
                            {booking.id} &middot; {formatDate(booking.scheduledDate)}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Type a patient name or booking ID to search</p>
                  {pendingResults.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <p className="mb-2 text-xs font-medium text-muted-foreground">PENDING RESULTS</p>
                      {pendingResults.map((result) => {
                        const booking = bookingsMap.get(result.bookingId)
                        return (
                          <button
                            key={result.id}
                            type="button"
                            onClick={() => booking && handleSelectBooking(booking)}
                            className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{result.patientName}</span>
                              <Badge variant={statusConfig[result.status].variant}>
                                {statusConfig[result.status].label}
                              </Badge>
                            </div>
                            <div className="mt-1 text-sm text-muted-foreground">
                              {result.testName} &middot; {formatDate(result.enteredAt, "time")}
                            </div>
                          </button>
                        )
                      })}
                    </>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Beaker className="h-4 w-4" />
              {selectedBooking ? `Test Parameters - ${selectedBooking.patientName}` : "Select a Booking"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedBooking ? (
              <EmptyState
                icon={<FileText className="h-12 w-12" />}
                title="No booking selected"
                description="Search and select a booking from the left panel to enter results"
              />
            ) : (
              <div className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Patient</Label>
                      <p className="font-medium">{selectedBooking.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Booking ID</Label>
                      <p className="font-medium">{selectedBooking.id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date</Label>
                      <p className="font-medium">{formatDate(selectedBooking.scheduledDate)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      {selectedResult ? (
                        <Badge variant={statusConfig[selectedResult.status].variant}>
                          {statusConfig[selectedResult.status].label}
                        </Badge>
                      ) : (
                        <Badge variant="outline">New</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <FormProvider {...methods}>
                  <form onSubmit={methods.handleSubmit(onSubmit)}>
                    {selectedResult && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">{selectedResult.testName}</h3>
                        {selectedResult.parameters.map((param) => {
                          const currentValue = (methods.watch(`parameterValues.${param.parameterId}`) as string) ?? param.value
                          const evalResult = evaluateAbnormality({ ...param, value: currentValue })
                          return (
                            <div key={param.parameterId} className="rounded-lg border p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Label>{param.parameterName}</Label>
                                    {evalResult.isCritical && (
                                      <Badge variant="destructive" className="animate-pulse text-[10px]">
                                        CRITICAL
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Controller
                                      name={`parameterValues.${param.parameterId}`}
                                      control={methods.control}
                                      render={({ field }) => (
                                        <Input
                                          type="text"
                                          value={(field.value as string) ?? param.value}
                                          onChange={(e) => {
                                            field.onChange(e)
                                            handleValueChange(param.parameterId, e.target.value, param)
                                          }}
                                          className={cn(
                                            "w-40 font-mono",
                                            evalResult.isCritical && "border-destructive bg-destructive/10",
                                            evalResult.isHigh && !evalResult.isCritical && "border-red-400 bg-red-50 dark:bg-red-950/20",
                                            evalResult.isLow && !evalResult.isCritical && "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                                          )}
                                        />
                                      )}
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
                          )
                        })}
                      </div>
                    )}

                    {selectedResult && (
                      <>
                        <Separator />
                        <FormTextarea name="notes" label="Notes" placeholder="Add notes or comments..." />
                        <div className="flex items-center gap-3">
                          <Button type="submit" disabled={saving}>
                            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Results</>}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </FormProvider>

                {!selectedResult && (
                  <EmptyState
                    icon={<Stethoscope className="h-12 w-12" />}
                    title="No pending results"
                    description="This booking has no pending results to enter"
                    action={
                      <Button variant="outline" onClick={() => navigate("/results/bulk")}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Go to Bulk Entry
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!criticalAlert} onOpenChange={() => setCriticalAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Critical Value Alert
            </DialogTitle>
            <DialogDescription>
              The entered value exceeds critical limits. Immediate attention required.
            </DialogDescription>
          </DialogHeader>
          {criticalAlert && (
            <div className="space-y-3">
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                <div className="space-y-1">
                  <p className="font-medium">{criticalAlert.param.parameterName}</p>
                  <p className="text-2xl font-bold text-destructive">
                    {criticalAlert.param.value} {criticalAlert.param.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Reference Range: {criticalAlert.param.referenceRange}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This value is outside the critical range. Please verify the result and notify the referring physician immediately.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCriticalAlert(null)}>
              Acknowledge
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setCriticalAlert(null)
                toast({ title: "Doctor notified", description: "Critical alert has been sent to the referring physician.", variant: "warning" })
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Notify Doctor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
