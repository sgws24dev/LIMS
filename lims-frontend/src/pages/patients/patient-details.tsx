"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Edit,
  Calendar,
  FileText,
  Download,
  Activity,
  MapPin,
  Phone,
  Mail,
  Droplets,
  User,
  Clock,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react"
import type { Patient } from "@/types"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getPatientById } from "@/mock/services"
import { useToast } from "@/hooks/use-toast"
import { useAppStore } from "@/store/appStore"

const statusIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  in_progress: Loader2,
  pending: AlertCircle,
  cancelled: XCircle,
}

const statusColors: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  completed: "success",
  in_progress: "warning",
  pending: "secondary",
  cancelled: "destructive",
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const { setBreadcrumbs } = useAppStore()

  useEffect(() => {
    setBreadcrumbs([{ label: "Patients", href: "/patients" }, { label: "Patient Details" }])
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getPatientById(id).then((p) => {
      if (!p) {
        toast({ title: "Patient not found", variant: "destructive" })
        navigate("/patients")
        return
      }
      setPatient(p)
      setLoading(false)
    })
  }, [id, navigate, toast])

  const sortedVisits = patient
    ? [...patient.visits].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : []

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  if (!patient) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title={patient.name}
        description={`Patient ID: ${patient.id}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/patients")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => navigate(`/patients/${patient.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="mb-3 h-20 w-20">
                <AvatarImage src={patient.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">{patient.id}</p>
              <Badge variant="outline" className="mt-2">
                {patient.bloodGroup}
              </Badge>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>DOB: {formatDate(patient.dob, "long")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="capitalize">{patient.gender}</span>
                <span>· {calculateAge(patient.dob)} years</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{patient.city}, {patient.state}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{patient.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{patient.bloodGroup}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {patient.address || "N/A"}
                    {patient.address && `, ${patient.city}`}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visit Timeline</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medicalHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No medical history recorded.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.map((condition) => (
                    <Badge key={condition} variant="secondary">
                      {condition}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Family Members</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.familyMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No family members recorded.
                </p>
              ) : (
                <div className="divide-y">
                  {patient.familyMembers.map((fm) => (
                    <div
                      key={fm.id}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{fm.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {fm.relation}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{fm.phone}</p>
                        <p className="text-xs text-muted-foreground">
                          DOB: {formatDate(fm.dob, "short")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patient Analytics</CardTitle>
              <CardDescription>Quick stats overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {patient.visits.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total Visits
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {patient.medicalHistory.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Conditions
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {patient.familyMembers.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Family Members
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">
                    {patient.attachments.length}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Attachments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits">
          <Card>
            <CardContent className="p-0">
              {sortedVisits.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <Calendar className="mb-2 h-8 w-8" />
                  <p>No visits recorded</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sortedVisits.map((visit) => {
                    const StatusIcon = statusIcons[visit.status] || Clock
                    return (
                      <div key={visit.id} className="p-4 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <StatusIcon
                                className={`h-5 w-5 ${
                                  visit.status === "completed"
                                    ? "text-emerald-500"
                                    : visit.status === "in_progress"
                                      ? "text-amber-500"
                                      : visit.status === "cancelled"
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                }`}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {formatDate(visit.date, "long")}
                                </span>
                                <Badge
                                  variant={statusColors[visit.status] || "secondary"}
                                  className="capitalize"
                                >
                                  {visit.status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {visit.tests.map((test) => (
                                  <Badge key={test} variant="outline" className="text-xs">
                                    {test}
                                  </Badge>
                                ))}
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                                <span>Dr. {visit.doctor}</span>
                                <span className="capitalize">{visit.type}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(visit.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card>
            <CardContent className="p-0">
              {patient.attachments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <FileText className="mb-2 h-8 w-8" />
                  <p>No attachments uploaded</p>
                </div>
              ) : (
                <div className="divide-y">
                  {patient.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{att.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {att.size} · {formatDate(att.uploadedAt, "short")}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Download", description: "File download would start", variant: "success" })}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
