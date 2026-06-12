"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sampleRegistrationSchema, type SampleRegistrationForm } from "@/lib/validations"
import type { Booking, Sample } from "@/types"
import { generateId } from "@/lib/utils"
import { getBookings, getTests, createSample } from "@/mock/services"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { Barcode, User, FlaskConical, Droplets, Beaker, ArrowLeft, Save, Loader2 } from "lucide-react"

const containers = ["Red Top", "Lavender Top", "Blue Top", "Green Top", "Gray Top", "Yellow Top", "Black Top"]
const volumes = ["2mL", "3mL", "4mL", "5mL", "7mL", "10mL"]

export default function SampleRegistrationPage() {
  const navigate = useNavigate()
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const showToast = useUIStore((s) => s.showToast)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableTests, setAvailableTests] = useState<{ id: string; name: string }[]>([])

  const methods = useForm<SampleRegistrationForm>({
    resolver: zodResolver(sampleRegistrationSchema),
    defaultValues: {
      selectedBookingId: "",
      selectedTest: "",
      container: "Red Top",
      volume: "",
      barcode: "",
      notes: "",
    },
  })
  const selectedBookingId = methods.watch("selectedBookingId")
  const selectedTest = methods.watch("selectedTest")
  const barcode = methods.watch("barcode")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Samples", href: "/samples" },
      { label: "Register" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [bkgs, testsData] = await Promise.all([
        getBookings({ status: "registered" }),
        getTests({}),
      ])
      setBookings(bkgs.data)
      setAvailableTests(testsData.data.map((t) => ({ id: t.id, name: t.name })))
      const generatedBarcode = "LSD-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9999)).padStart(4, "0")
      methods.setValue("barcode", generatedBarcode)
    } catch {
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedBookingId),
    [selectedBookingId, bookings]
  )

  const handleBookingSelect = (bookingId: string) => {
    methods.setValue("selectedBookingId", bookingId)
    methods.setValue("selectedTest", "")
    const booking = bookings.find((b) => b.id === bookingId)
    if (booking && booking.tests.length > 0) {
      methods.setValue("selectedTest", booking.tests[0])
    }
  }

  const onSubmit = async (data: SampleRegistrationForm) => {
    setSaving(true)
    try {
      const sampleData: Omit<Sample, "id"> = {
        bookingId: data.selectedBookingId,
        patientId: selectedBooking?.patientId || "",
        patientName: selectedBooking?.patientName || "",
        patientPhone: selectedBooking?.patientPhone || "",
        testName: availableTests.find((t) => t.id === data.selectedTest)?.name || data.selectedTest,
        testId: data.selectedTest,
        barcode: data.barcode,
        type: "Blood",
        container: data.container,
        volume: data.volume || "5mL",
        status: "registered",
        department: "General",
        priority: "routine",
        isAliquot: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await createSample(sampleData)
      showToast({ type: "success", title: "Sample Registered", message: `Sample ${data.barcode} has been registered.` })
      navigate("/samples/tracking")
    } catch {
      showToast({ type: "error", title: "Error", message: "Failed to register sample." })
    } finally {
      setSaving(false)
    }
  }

  const regenerateBarcode = () => {
    const newBarcode = "LSD-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 9999)).padStart(4, "0")
    methods.setValue("barcode", newBarcode)
  }

  if (loading) {
    return (
      <div className="p-6">
        <LoadingState type="detail" count={1} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    )
  }

  return (
      <div className="space-y-6 p-6">
        <PageHeader
          title="Sample Registration"
          description="Register a new sample linked to a booking and patient"
          actions={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          }
        />

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Booking</label>
                      <Select value={selectedBookingId} onValueChange={handleBookingSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a booking..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bookings.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.patientName} - {b.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Test</label>
                      <Select value={selectedTest} onValueChange={(v) => methods.setValue("selectedTest", v)} disabled={!selectedBookingId}>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedBookingId ? "Select test..." : "Select a booking first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedBooking?.tests.map((testId) => {
                            const test = availableTests.find((t) => t.id === testId)
                            return test ? (
                              <SelectItem key={testId} value={testId}>{test.name}</SelectItem>
                            ) : null
                          })}
                          {availableTests.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Container Type</label>
                        <Select value={methods.watch("container")} onValueChange={(v) => methods.setValue("container", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {containers.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Volume</label>
                        <Select value={methods.watch("volume")} onValueChange={(v) => methods.setValue("volume", v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {volumes.map((v) => (
                              <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Barcode</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Barcode className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input {...methods.register("barcode")} className="pl-8 font-mono" />
                        </div>
                        <Button type="button" variant="outline" onClick={regenerateBarcode}>Regenerate</Button>
                      </div>
                    </div>

                    <FormTextarea name="notes" label="Notes" placeholder="Any special instructions or notes..." />

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => navigate("/samples/tracking")}>Cancel</Button>
                      <Button type="submit" disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Register Sample</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedBooking ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{selectedBooking.patientName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FlaskConical className="h-4 w-4" />
                          <span>{selectedBooking.tests.length} test(s)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Droplets className="h-4 w-4" />
                          <span>{selectedBooking.collectionType === "home" ? "Home Collection" : "Lab"}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Booking: {selectedBooking.id}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center py-6 text-sm text-muted-foreground">
                        <Beaker className="mb-2 h-8 w-8" />
                        <p>Select a booking to see patient details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
  )
}
