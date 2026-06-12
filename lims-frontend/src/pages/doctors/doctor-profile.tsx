"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, Phone, MapPin, Percent, TrendingUp, Users, IndianRupee, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Doctor } from "@/types"
import { doctors } from "@/mock/data/doctors"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Referral {
  id: string
  patientName: string
  date: string
  tests: string[]
  status: "pending" | "completed" | "cancelled"
  commissionEarned: number
}

const referralData: Referral[] = [
  { id: "REF001", patientName: "Amit Sharma", date: "2026-05-10T10:00:00Z", tests: ["CBC", "LFT", "Lipid Profile"], status: "completed", commissionEarned: 450 },
  { id: "REF002", patientName: "Priya Verma", date: "2026-05-12T11:30:00Z", tests: ["Thyroid Profile", "Vitamin D"], status: "completed", commissionEarned: 320 },
  { id: "REF003", patientName: "Rajesh Kumar", date: "2026-05-15T09:00:00Z", tests: ["FBS", "PPBS", "HbA1c"], status: "completed", commissionEarned: 280 },
  { id: "REF004", patientName: "Sunita Devi", date: "2026-05-18T14:00:00Z", tests: ["Complete Blood Count"], status: "pending", commissionEarned: 0 },
  { id: "REF005", patientName: "Vikram Patel", date: "2026-05-20T08:30:00Z", tests: ["Lipid Profile", "ECG"], status: "pending", commissionEarned: 0 },
  { id: "REF006", patientName: "Meera Nair", date: "2026-05-22T12:00:00Z", tests: ["Iron Studies", "Vitamin B12"], status: "completed", commissionEarned: 380 },
  { id: "REF007", patientName: "Deepak Joshi", date: "2026-05-25T10:30:00Z", tests: ["Liver Function Test"], status: "cancelled", commissionEarned: 0 },
  { id: "REF008", patientName: "Ananya Gupta", date: "2026-05-28T09:15:00Z", tests: ["KFT", "Serum Electrolytes"], status: "completed", commissionEarned: 290 },
]

const monthlyReferrals = [
  { month: "Jan", count: 18 },
  { month: "Feb", count: 22 },
  { month: "Mar", count: 19 },
  { month: "Apr", count: 25 },
  { month: "May", count: 30 },
  { month: "Jun", count: 28 },
]

const maxMonthlyReferrals = Math.max(...monthlyReferrals.map((m) => m.count))

function ReferralChart({ data }: { data: { month: string; count: number }[] }) {
  return (
    <div className="flex items-end gap-2 h-32 pt-4">
      {data.map((item) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground">{item.count}</span>
          <div
            className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
            style={{ height: `${(item.count / maxMonthlyReferrals) * 100}%` }}
          />
          <span className="text-xs text-muted-foreground">{item.month}</span>
        </div>
      ))}
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function getStatusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const
    case "pending":
      return "warning" as const
    case "cancelled":
      return "destructive" as const
    default:
      return "secondary" as const
  }
}

export default function DoctorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setBreadcrumbs } = useAppStore()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Doctors", href: "/doctors" }, { label: "Doctor Profile" }])
  }, [])

  const doctor = useMemo(() => doctors.find((d) => d.id === id), [id])

  if (!doctor) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Doctor Not Found"
          description="The requested doctor profile could not be found."
          actions={
            <Button variant="outline" onClick={() => navigate("/doctors")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Doctors
            </Button>
          }
        />
      </div>
    )
  }

  const performanceStats = {
    totalReferrals: referralData.length,
    completedReferrals: referralData.filter((r) => r.status === "completed").length,
    totalCommission: referralData.reduce((sum, r) => sum + r.commissionEarned, 0),
    avgCommission: referralData.filter((r) => r.status === "completed").length
      ? referralData.reduce((sum, r) => sum + r.commissionEarned, 0) /
        referralData.filter((r) => r.status === "completed").length
      : 0,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Profile"
        description="Detailed view of referring doctor"
        actions={
          <Button variant="outline" onClick={() => navigate("/doctors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={doctor.avatar} alt={doctor.name} />
                    <AvatarFallback className="text-lg">{getInitials(doctor.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{doctor.name}</h2>
                      <Badge variant={doctor.isActive ? "success" : "secondary"}>
                        {doctor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                    <p className="text-sm text-muted-foreground">{doctor.hospital}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Calling...", description: "Initiating call to doctor", variant: "default" })}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Opening Email", description: "Opening default email client", variant: "default" })}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{doctor.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span>Commission Rate: <strong>{doctor.commission}%</strong></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Registered: {formatDate(doctor.createdAt, "long")}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Referrals</p>
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <Users className="h-5 w-5 text-primary" />
                      {doctor.patientsReferred}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Revenue Generated</p>
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <IndianRupee className="h-5 w-5 text-emerald-500" />
                      {formatCurrency(doctor.totalRevenue)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg Commission</p>
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      {formatCurrency(performanceStats.avgCommission)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed Referrals</p>
                    <p className="flex items-center gap-1 text-2xl font-bold">
                      <Users className="h-5 w-5 text-violet-500" />
                      {performanceStats.completedReferrals}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <ReferralChart data={monthlyReferrals} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referral Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Tests</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralData.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-medium">{ref.patientName}</TableCell>
                      <TableCell>{formatDate(ref.date, "short")}</TableCell>
                      <TableCell>{ref.tests.join(", ")}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(ref.status)}>
                          {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {ref.commissionEarned > 0 ? formatCurrency(ref.commissionEarned) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
