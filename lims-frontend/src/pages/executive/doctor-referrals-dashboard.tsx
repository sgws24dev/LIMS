"use client"

import { useState, useEffect, useMemo } from "react"
import { Users, Banknote, TrendingUp, Award } from "lucide-react"
import { formatCurrency, cn } from "@/lib/utils"
import { useAppStore } from "@/store/appStore"
import { useUIStore } from "@/store/uiStore"
import { getDoctorReferralsExtended } from "@/mock/services"
import { PageContainer } from "@/components/shared/page-container"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExecutiveChart } from "@/components/shared/executive-chart"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"

interface RefRow {
  rank: number
  doctor: string
  specialization: string
  patientsReferred: number
  revenue: number
  commission: number
}

const refColumns: ColumnDef<RefRow>[] = [
  {
    id: "rank", header: "#", accessorKey: "rank",
    cell: (row) => <span className="font-bold text-muted-foreground">{row.rank}</span>,
  },
  { id: "doctor", header: "Doctor", accessorKey: "doctor", sortable: true },
  { id: "specialization", header: "Specialization", accessorKey: "specialization" },
  { id: "patientsReferred", header: "Patients", accessorKey: "patientsReferred", sortable: true },
  {
    id: "revenue", header: "Revenue", accessorKey: "revenue",
    cell: (row) => formatCurrency(row.revenue),
    sortable: true,
  },
  {
    id: "commission", header: "Commission", accessorKey: "commission",
    cell: (row) => formatCurrency(row.commission),
    sortable: true,
  },
]

export default function DoctorReferralsDashboard() {
  const { setBreadcrumbs } = useAppStore()
  const { showToast } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [referrals, setReferrals] = useState<{ doctor: string; specialization: string; patientsReferred: number; revenue: number; commission: number }[]>([])

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Executive" },
      { label: "Referrals" },
    ])
  }, [setBreadcrumbs])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getDoctorReferralsExtended()
      setReferrals(data)
    } catch {
      setError("Failed to load referral data")
      showToast({ type: "error", title: "Error", message: "Failed to load doctor referrals dashboard" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const totalReferrals = referrals.reduce((s, d) => s + d.patientsReferred, 0)
  const totalRevenue = referrals.reduce((s, d) => s + d.revenue, 0)
  const activeDoctors = referrals.length
  const topDoctor = referrals.length > 0 ? referrals[0].doctor : "N/A"

  const rankedData = useMemo(() =>
    referrals
      .sort((a, b) => b.patientsReferred - a.patientsReferred)
      .map((d, i) => ({ ...d, rank: i + 1 })),
    [referrals]
  )

  const specData = useMemo(() => {
    const map: Record<string, number> = {}
    referrals.forEach((d) => {
      map[d.specialization] = (map[d.specialization] ?? 0) + d.patientsReferred
    })
    return Object.entries(map).map(([label, value]) => ({ label, value }))
  }, [referrals])

  const trendData = [
    { label: "Jan", value: 82 },
    { label: "Feb", value: 78 },
    { label: "Mar", value: 95 },
    { label: "Apr", value: 88 },
    { label: "May", value: 102 },
    { label: "Jun", value: 110 },
  ]

  const monthlyData = [
    { label: "Current", value: totalReferrals },
    { label: "Previous", value: Math.round(totalReferrals * 0.85) },
  ]

  return (
    <PageContainer
      title="Doctor Referrals Analytics"
      description="Track referral performance and commission management"
      status={loading ? "loading" : error ? "error" : "success"}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      loadingType="detail"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Referrals"
          value={totalReferrals.toLocaleString()}
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Active Doctors"
          value={activeDoctors}
        />
        <StatCard
          icon={<Banknote className="h-5 w-5" />}
          label="Revenue from Referrals"
          value={formatCurrency(totalRevenue)}
          trend={{ value: 18.3, positive: true }}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Top Doctor"
          value={topDoctor.replace("Dr. ", "")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Referring Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={refColumns}
              data={rankedData}
              pageSize={10}
              emptyMessage="No referral data available"
              exportable
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Referral Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={trendData} type="line" height={260} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Referral by Specialization</CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutiveChart data={specData} type="pie" height={260} showLegend />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Commission Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankedData.slice(0, 8).map((d) => (
                <div key={d.doctor} className="flex items-center justify-between text-sm">
                  <span className="w-36 truncate font-medium">{d.doctor}</span>
                  <div className="flex flex-1 items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${(d.commission / rankedData[0].commission) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-24 text-right text-muted-foreground">{formatCurrency(d.commission)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ExecutiveChart data={monthlyData} type="bar" height={200} />
        </CardContent>
      </Card>
    </PageContainer>
  )
}
