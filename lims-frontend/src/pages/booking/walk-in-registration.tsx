"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { walkInRegistrationSchema, type WalkInRegistrationForm } from "@/lib/validations"
import type { Patient } from "@/types"
import { patients } from "@/mock/data/patients"
import { tests as testCatalog, testPackages } from "@/mock/data/tests"
import { doctors } from "@/mock/data/doctors"
import { branches } from "@/mock/data/branches"
import { generateId, formatCurrency, cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EmptyState } from "@/components/ui/empty-state"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"
import { FormInput } from "@/components/forms/form-input"
import { FormTextarea } from "@/components/forms/form-textarea"
import { FormErrorSummary } from "@/components/forms/form-error-summary"
import {
  Search,
  UserPlus,
  TestTube,
  Stethoscope,
  Barcode,
  CheckCircle2,
  X,
  Plus,
  ChevronRight,
  FlaskConical,
} from "lucide-react"

interface SelectedTest {
  id: string
  name: string
  price: number
}

export default function WalkInRegistrationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [step, setStep] = useState<"form" | "success">("form")

  useEffect(() => {
    setBreadcrumbs([{ label: "Bookings", href: "/bookings" }, { label: "Walk-in Registration" }])
  }, [])

  const [searchPatientQuery, setSearchPatientQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isNewPatient, setIsNewPatient] = useState(false)

  const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([])
  const [testSearch, setTestSearch] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)

  const methods = useForm<WalkInRegistrationForm>({
    resolver: zodResolver(walkInRegistrationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      dob: "",
      gender: undefined,
      address: "",
      selectedTests: [],
      selectedDoctor: "",
      collectionType: "lab",
      homeAddress: "",
      discount: "",
      paidAmount: "",
      branchId: "BRH001",
    },
  })
  const name = methods.watch("name")
  const phone = methods.watch("phone")
  const email = methods.watch("email")
  const dob = methods.watch("dob")
  const gender = methods.watch("gender")
  const address = methods.watch("address")
  const collectionType = methods.watch("collectionType")
  const selectedDoctor = methods.watch("selectedDoctor")
  const discount = methods.watch("discount")
  const paidAmount = methods.watch("paidAmount")
  const branchId = methods.watch("branchId")

  const matchedPatients = useMemo(() => {
    if (!searchPatientQuery || isNewPatient) return []
    const q = searchPatientQuery.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }, [searchPatientQuery, isNewPatient])

  const filteredTests = useMemo(() => {
    if (!testSearch) return []
    const q = testSearch.toLowerCase()
    return testCatalog.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    )
  }, [testSearch])

  const totalAmount = useMemo(
    () => selectedTests.reduce((sum, t) => sum + t.price, 0),
    [selectedTests]
  )
  const netAmount = Math.max(0, totalAmount - (Number(discount) || 0))
  const dueAmount = Math.max(0, netAmount - (Number(paidAmount) || 0))

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    methods.setValue("name", patient.name)
    methods.setValue("phone", patient.phone)
    methods.setValue("email", patient.email || "")
    methods.setValue("dob", patient.dob)
    methods.setValue("gender", patient.gender)
    methods.setValue("address", patient.address)
    setIsNewPatient(false)
    setSearchPatientQuery("")
  }

  const startNewPatient = () => {
    setSelectedPatient(null)
    setIsNewPatient(true)
    methods.reset({
      name: "", phone: "", email: "", dob: "", address: "",
      selectedTests: [], collectionType: "lab", discount: "", paidAmount: "",
      branchId: "BRH001",
    })
    setSearchPatientQuery("")
  }

  const addTest = (testId: string) => {
    if (selectedTests.some((t) => t.id === testId)) return
    const test = testCatalog.find((t) => t.id === testId)
    if (test) {
      setSelectedTests((prev) => [...prev, { id: test.id, name: test.name, price: test.price }])
    }
    setTestSearch("")
  }

  const addPackage = (pkgId: string) => {
    const pkg = testPackages.find((p) => p.id === pkgId)
    if (!pkg) return
    pkg.tests.forEach((testId) => {
      if (!selectedTests.some((t) => t.id === testId)) {
        const test = testCatalog.find((t) => t.id === testId)
        if (test) {
          setSelectedTests((prev) => [...prev, { id: test.id, name: test.name, price: test.price }])
        }
      }
    })
  }

  const removeTest = (testId: string) => {
    setSelectedTests((prev) => prev.filter((t) => t.id !== testId))
  }

  const handleGenerateBarcode = () => {
    toast({ title: "Barcode Generated", description: "Barcode has been generated for this booking.", variant: "success" })
  }

  const onSubmit = (data: WalkInRegistrationForm) => {
    setShowConfirm(false)
    setStep("success")
    toast({ title: "Booking Created", description: "Walk-in registration completed successfully.", variant: "success" })
  }

  const handleConfirm = () => {
    methods.handleSubmit(onSubmit)()
  }

  if (step === "success") {
    return (
      <div className="flex items-center justify-center p-6 min-h-[70vh]">
        <Card className="w-full max-w-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <CardTitle className="text-2xl">Registration Successful</CardTitle>
            <CardDescription>
              Booking has been created successfully. Below are the details.
            </CardDescription>
            <div className="w-full space-y-2 rounded-lg bg-muted p-4 text-left text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Booking ID:</span><span className="font-medium">BKG-{generateId().toUpperCase().slice(0, 6)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-medium">{methods.getValues("name")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tests:</span><span className="font-medium">{selectedTests.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Amount:</span><span className="font-medium">{formatCurrency(netAmount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Paid:</span><span className="font-medium">{formatCurrency(Number(methods.getValues("paidAmount")) || 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Collection:</span><span className="font-medium capitalize">{methods.getValues("collectionType")}</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()}>Print Receipt</Button>
              <Button onClick={() => setStep("form")}>New Registration</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Walk-in Registration"
        description="Register a new walk-in patient for lab tests"
      />

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5" /> Patient Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormErrorSummary />
                  {!isNewPatient && (
                    <div className="space-y-2">
                      <Label>Search Existing Patient</Label>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name, phone, or ID..."
                          value={searchPatientQuery}
                          onChange={(e) => setSearchPatientQuery(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      {matchedPatients.length > 0 && (
                        <ScrollArea className="max-h-40 rounded-md border">
                          {matchedPatients.map((p) => (
                            <div
                              key={p.id}
                              className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                              onClick={() => selectPatient(p)}
                            >
                              <div>
                                <span className="font-medium">{p.name}</span>
                                <span className="ml-2 text-muted-foreground">{p.phone}</span>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </ScrollArea>
                      )}
                      <Button variant="link" size="sm" type="button" onClick={startNewPatient} className="p-0">
                        + Add New Patient
                      </Button>
                    </div>
                  )}

                  {isNewPatient && (
                    <Button variant="outline" size="sm" type="button" onClick={() => { setIsNewPatient(false); setSelectedPatient(null) }}>
                      <Search className="mr-1 h-3 w-3" /> Search Existing
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormInput name="name" label="Full Name *" placeholder="Patient name" />
                    <FormInput name="phone" label="Phone *" placeholder="+91 9X-XXX-XXXX" />
                    <FormInput name="email" label="Email" type="email" placeholder="email@example.com" />
                    <FormInput name="dob" label="Date of Birth" type="date" />
                    <Controller
                      name="gender"
                      control={methods.control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Gender</Label>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                    <Controller
                      name="branchId"
                      control={methods.control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                            <SelectContent>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    />
                  </div>
                  <FormTextarea name="address" label="Address" placeholder="Full address" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FlaskConical className="h-5 w-5" /> Test Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tests or packages..."
                      value={testSearch}
                      onChange={(e) => setTestSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  {testSearch && filteredTests.length > 0 && (
                    <ScrollArea className="max-h-48 rounded-md border">
                      {filteredTests.map((t) => (
                        <div
                          key={t.id}
                          className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-accent"
                          onClick={() => addTest(t.id)}
                        >
                          <div>
                            <span className="font-medium">{t.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({t.code})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{t.category}</span>
                            <span className="font-medium">{formatCurrency(t.price)}</span>
                            <Plus className="h-4 w-4 text-primary" />
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}

                  {testSearch && filteredTests.length === 0 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">No tests found</div>
                  )}

                  {selectedTests.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Tests ({selectedTests.length})</Label>
                      <ScrollArea className="max-h-60">
                        <div className="space-y-1">
                          {selectedTests.map((t) => (
                            <div key={t.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                              <span>{t.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{formatCurrency(t.price)}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" type="button" onClick={() => removeTest(t.id)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  {selectedTests.length === 0 && (
                    <EmptyState
                      icon={<TestTube className="h-6 w-6" />}
                      title="No tests selected"
                      description="Search and select tests from the catalog above."
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Stethoscope className="h-5 w-5" /> Referral & Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Controller
                    name="selectedDoctor"
                    control={methods.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>Referring Doctor</Label>
                        <Select value={field.value || ""} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                          <SelectContent>
                            {doctors.map((d) => (
                              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  />
                  <Separator />
                  <Controller
                    name="collectionType"
                    control={methods.control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>Collection Type</Label>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant={field.value === "lab" ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange("lab")}
                            className="flex-1"
                          >
                            Lab Collection
                          </Button>
                          <Button
                            type="button"
                            variant={field.value === "home" ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange("home")}
                            className="flex-1"
                          >
                            Home Collection
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                  {methods.watch("collectionType") === "home" && (
                    <FormTextarea name="homeAddress" label="Home Collection Address" placeholder="Enter home collection address" />
                  )}
                  <Separator />
                  <Button variant="outline" className="w-full" type="button" onClick={handleGenerateBarcode}>
                    <Barcode className="mr-2 h-4 w-4" /> Generate Barcode
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-medium">{formatCurrency(totalAmount)}</span>
                  </div>
                  <FormInput name="discount" label="Discount" type="number" min="0" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Net Amount</span>
                    <span className="font-medium">{formatCurrency(netAmount)}</span>
                  </div>
                  <FormInput name="paidAmount" label="Paid Amount" type="number" min="0" />
                  <Separator />
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Due Amount</span>
                    <span className={dueAmount > 0 ? "text-destructive" : "text-emerald-600"}>
                      {formatCurrency(dueAmount)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    onClick={() => setShowConfirm(true)}
                  >
                    Submit Registration
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </FormProvider>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Registration</DialogTitle>
            <DialogDescription>
              Please verify the details before submitting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Patient:</span><span className="font-medium">{name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone:</span><span>{phone}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tests:</span><span>{selectedTests.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount:</span><span className="font-medium">{formatCurrency(netAmount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Paid:</span>            <span className="font-medium">{formatCurrency(Number(paidAmount) || 0)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Collection:</span><span className="capitalize">{collectionType}</span></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleConfirm}>Confirm & Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
