"use client"

import { useState, useMemo, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, CheckCircle2, Clock, IndianRupee, BarChart3, PieChart } from "lucide-react"
import { doctors } from "@/mock/data/doctors"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import { StatCard } from "@/components/ui/stat-card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DataTable,
  type ColumnDef,
} from "@/components/ui/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { useAppStore } from "@/store/appStore"

interface ReferralRecord {
  id: string
  patientName: string
  doctorId: string
  doctorName: string
  tests: string[]
  date: string
  status: "pending" | "completed" | "cancelled"
  commission: number
}

const allReferrals: ReferralRecord[] = [
  { id: "R001", patientName: "Amit Sharma", doctorId: "DOC001", doctorName: "Dr. Sneha Reddy", tests: ["CBC", "LFT"], date: "2026-05-10T10:00:00Z", status: "completed", commission: 450 },
  { id: "R002", patientName: "Priya Verma", doctorId: "DOC002", doctorName: "Dr. Kartik Saxena", tests: ["Thyroid Profile", "Vitamin D"], date: "2026-05-12T11:30:00Z", status: "completed", commission: 320 },
  { id: "R003", patientName: "Rajesh Kumar", doctorId: "DOC001", doctorName: "Dr. Sneha Reddy", tests: ["FBS", "PPBS", "HbA1c"], date: "2026-05-14T09:00:00Z", status: "completed", commission: 280 },
  { id: "R004", patientName: "Sunita Devi", doctorId: "DOC003", doctorName: "Dr. Neha Kapoor", tests: ["CBC"], date: "2026-05-15T14:00:00Z", status: "pending", commission: 0 },
  { id: "R005", patientName: "Vikram Patel", doctorId: "DOC002", doctorName: "Dr. Kartik Saxena", tests: ["Lipid Profile"], date: "2026-05-16T08:30:00Z", status: "pending", commission: 0 },
  { id: "R006", patientName: "Meera Nair", doctorId: "DOC004", doctorName: "Dr. Lata Menon", tests: ["Iron Studies", "Vitamin B12"], date: "2026-05-18T12:00:00Z", status: "completed", commission: 380 },
  { id: "R007", patientName: "Deepak Joshi", doctorId: "DOC005", doctorName: "Dr. Arjun Mehta", tests: ["LFT"], date: "2026-05-20T10:30:00Z", status: "cancelled", commission: 0 },
  { id: "R008", patientName: "Ananya Gupta", doctorId: "DOC001", doctorName: "Dr. Sneha Reddy", tests: ["KFT", "Electrolytes"], date: "2026-05-22T09:15:00Z", status: "completed", commission: 290 },
  { id: "R009", patientName: "Rohit Singh", doctorId: "DOC006", doctorName: "Dr. Priya Sharma", tests: ["HbA1c", "Lipid Profile"], date: "2026-05-23T11:00:00Z", status: "completed", commission: 310 },
  { id: "R010", patientName: "Kavita Joshi", doctorId: "DOC003", doctorName: "Dr. Neha Kapoor", tests: ["Thyroid Profile"], date: "2026-05-25T15:30:00Z", status: "pending", commission: 0 },
  { id: "R011", patientName: "Suresh Reddy", doctorId: "DOC007", doctorName: "Dr. Vikram Patel", tests: ["CBC", "ESR", "CRP"], date: "2026-05-26T09:45:00Z", status: "completed", commission: 420 },
  { id: "R012", patientName: "Neha Agarwal", doctorId: "DOC008", doctorName: "Dr. Ananya Gupta", tests: ["Iron Studies"], date: "2026-05-28T10:00:00Z", status: "completed", commission: 230 },
  { id: "R013", patientName: "Manish Tiwari", doctorId: "DOC002", doctorName: "Dr. Kartik Saxena", tests: ["Lipid Profile", "hs-CRP"], date: "2026-05-30T08:00:00Z", status: "pending", commission: 0 },
  { id: "R014", patientName: "Pooja Malhotra", doctorId: "DOC009", doctorName: "Dr. Rohan Deshmukh", tests: ["PFT", "CBC"], date: "2026-06-01T13:00:00Z", status: "completed", commission: 350 },
  { id: "R015", patientName: "Arun Pandey", doctorId: "DOC010", doctorName: "Dr. Kavita Singh", tests: ["KFT", "Electrolytes"], date: "2026-06-02T11:30:00Z", status: "completed", commission: 300 },
]

const doctorReferralStats = doctors.map((doc) => {
  const docRefs = allReferrals.filter((r) => r.doctorId === doc.id)
  return {
    name: doc.name,
    count: docRefs.length,
    revenue: docRefs.reduce((s, r) => s + r.commission, 0),
  }
})

const maxDoctorCount = Math.max(...doctorReferralStats.map((d) => d.count))
const maxDoctorRevenue = Math.max(...doctorReferralStats.map((d) => d.revenue))

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

export default function ReferralTracking() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [search, setSearch] = useState("")
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setBreadcrumbs([{ label: "Doctors", href: "/doctors" }, { label: "Referral Tracking" }])
  }, [])

  const filteredReferrals = useMemo(() => {
    return allReferrals.filter((r) => {
      const matchesSearch =
        !search ||
        r.patientName.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase())
      const matchesDoctor =
        doctorFilter === "all" || r.doctorId === doctorFilter
      const matchesStatus =
        statusFilter === "all" || r.status === statusFilter
      return matchesSearch && matchesDoctor && matchesStatus
    })
  }, [search, doctorFilter, statusFilter])

  const stats = useMemo(() => ({
    total: allReferrals.length,
    pending: allReferrals.filter((r) => r.status === "pending").length,
    completed: allReferrals.filter((r) => r.status === "completed").length,
    totalCommission: allReferrals.reduce((sum, r) => sum + r.commission, 0),
  }), [])

  const referralColumns: ColumnDef<ReferralRecord>[] = [
    {
      id: "patient",
      header: "Patient",
      cell: (row) => <span className="font-medium">{row.patientName}</span>,
    },
    {
      id: "doctor",
      header: "Doctor",
      cell: (row) => row.doctorName,
    },
    {
      id: "tests",
      header: "Tests",
      cell: (row) => row.tests.join(", "),
    },
    {
      id: "date",
      header: "Date",
      cell: (row) => formatDate(row.date, "short"),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={getStatusVariant(row.status)}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "commission",
      header: "Commission",
      className: "text-right",
      cell: (row) => (row.commission > 0 ? formatCurrency(row.commission) : "-"),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Tracking"
        description="Track and analyze doctor referrals"
        actions={
          <Button variant="outline" onClick={() => navigate("/doctors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctors
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Referrals"
          value={stats.total}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Pending"
          value={stats.pending}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Completed"
          value={stats.completed}
        />
        <StatCard
          icon={<IndianRupee className="h-5 w-5" />}
          label="Total Commission"
          value={formatCurrency(stats.totalCommission)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Referrals by Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doctorReferralStats.map((doc) => (
                <div key={doc.name} className="flex items-center gap-3">
                  <span className="w-32 truncate text-sm">{doc.name}</span>
                  <div className="flex-1">
                    <div className="h-5 w-full rounded bg-muted">
                      <div
                        className="h-5 rounded bg-primary transition-all"
                        style={{ width: `${(doc.count / maxDoctorCount) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-sm font-medium">{doc.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="h-4 w-4" />
              Commission by Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {doctorReferralStats
                .sort((a, b) => b.revenue - a.revenue)
                .map((doc) => (
                  <div key={doc.name} className="flex items-center gap-3">
                    <span className="w-32 truncate text-sm">{doc.name}</span>
                    <div className="flex-1">
                      <div className="h-5 w-full rounded bg-muted">
                        <div
                          className="h-5 rounded bg-emerald-500 transition-all"
                          style={{ width: `${(doc.revenue / maxDoctorRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-sm font-medium">
                      {formatCurrency(doc.revenue)}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <SearchInput
              placeholder="Search by patient or doctor..."
              value={search}
              onSearch={setSearch}
              className="w-64"
            />
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable
            columns={referralColumns}
            data={filteredReferrals}
            pageSize={10}
            exportable
          />
        </CardContent>
      </Card>
    </div>
  )
}
