"use client"

import { useState, useMemo, useCallback } from "react"
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell,
} from "recharts"
import {
  TrendingUp, DollarSign, Users, Activity, Clock, Building2,
  Download, Calendar, Filter, Stethoscope, FlaskConical,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn, formatCurrency } from "@/lib/utils"
import {
  getRevenueTrend, getPatientTrend, getTestTrend, getTurnaroundTimes,
  getBranchPerformance, getDoctorReferrals,
} from "@/mock/data/analytics"
import { useToast } from "@/hooks/use-toast"

const COLORS = ["#2563eb", "#16a34a", "#d97706", "#dc2626", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"]
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const revenueByCategory = [
  { name: "Biochemistry", value: 35 },
  { name: "Hematology", value: 20 },
  { name: "Microbiology", value: 15 },
  { name: "Immunology", value: 12 },
  { name: "Histopathology", value: 10 },
  { name: "Others", value: 8 },
]

const ageDistribution = [
  { range: "0-10", count: 320 },
  { range: "11-20", count: 580 },
  { range: "21-30", count: 1240 },
  { range: "31-45", count: 1890 },
  { range: "46-60", count: 1560 },
  { range: "60+", count: 980 },
]

const cityDistribution = [
  { city: "Mumbai", patients: 12500 },
  { city: "Delhi", patients: 9800 },
  { city: "Bangalore", patients: 8700 },
  { city: "Hyderabad", patients: 6500 },
  { city: "Chennai", patients: 5400 },
  { city: "Pune", patients: 4300 },
]

const genderDistribution = [
  { name: "Male", value: 48 },
  { name: "Female", value: 50 },
  { name: "Other", value: 2 },
]

const commissionData = [
  { month: "Jan", amount: 125000 },
  { month: "Feb", amount: 118000 },
  { month: "Mar", amount: 142000 },
  { month: "Apr", amount: 151000 },
  { month: "May", amount: 165000 },
  { month: "Jun", amount: 148000 },
]

const sampleVolume = [
  { month: "Jul '25", count: 5200 },
  { month: "Aug '25", count: 5400 },
  { month: "Sep '25", count: 5100 },
  { month: "Oct '25", count: 5800 },
  { month: "Nov '25", count: 6100 },
  { month: "Dec '25", count: 6700 },
  { month: "Jan '26", count: 6400 },
  { month: "Feb '26", count: 6000 },
  { month: "Mar '26", count: 7100 },
  { month: "Apr '26", count: 7400 },
  { month: "May '26", count: 7800 },
  { month: "Jun '26", count: 6500 },
]

const testVolumeByDept = [
  { department: "Biochemistry", count: 18500 },
  { department: "Hematology", count: 12200 },
  { department: "Microbiology", count: 7800 },
  { department: "Immunology", count: 6500 },
  { department: "Clinical Pathology", count: 5800 },
  { department: "Histopathology", count: 3200 },
]

const peakHours = [
  { hour: "7 AM", bookings: 120 },
  { hour: "8 AM", bookings: 280 },
  { hour: "9 AM", bookings: 450 },
  { hour: "10 AM", bookings: 520 },
  { hour: "11 AM", bookings: 510 },
  { hour: "12 PM", bookings: 380 },
  { hour: "1 PM", bookings: 220 },
  { hour: "2 PM", bookings: 310 },
  { hour: "3 PM", bookings: 400 },
  { hour: "4 PM", bookings: 350 },
  { hour: "5 PM", bookings: 290 },
  { hour: "6 PM", bookings: 180 },
]

const staffProductivity = [
  { name: "Sample Collection", target: 250, actual: 287 },
  { name: "Processing", target: 300, actual: 278 },
  { name: "Reporting", target: 200, actual: 215 },
  { name: "Verification", target: 180, actual: 192 },
  { name: "Billing", target: 220, actual: 245 },
]

const delayedTests = [
  { id: "T-001", patient: "Ravi Kumar", test: "Histopathology", department: "Histopathology", delay: "18 hrs", tat: "70 hrs" },
  { id: "T-002", patient: "Sneha Patel", test: "Microbiology Culture", department: "Microbiology", delay: "12 hrs", tat: "40 hrs" },
  { id: "T-003", patient: "Anil Verma", test: "Molecular Biology", department: "Molecular Biology", delay: "8 hrs", tat: "26 hrs" },
  { id: "T-004", patient: "Priya Sharma", test: "Immunohistochemistry", department: "Histopathology", delay: "6 hrs", tat: "58 hrs" },
]

const mmComparison = [
  { month: "May", current: 3680000, previous: 2850000 },
  { month: "Jun", current: 3100000, previous: 3100000 },
]

const newVsReturning = [
  { name: "New Patients", value: 35 },
  { name: "Returning", value: 65 },
]

const branchGrowth = [
  { branch: "Mumbai HQ", growth: 12.5 },
  { branch: "Delhi", growth: 9.8 },
  { branch: "Bangalore", growth: 15.2 },
  { branch: "Hyderabad", growth: 7.4 },
  { branch: "Chennai", growth: 5.6 },
  { branch: "Pune", growth: 11.3 },
]

const doctorPerformance = [
  { name: "Dr. Sneha Reddy", referrals: 342, revenue: 854000, commission: 85400 },
  { name: "Dr. Kartik Saxena", referrals: 287, revenue: 1250000, commission: 125000 },
  { name: "Dr. Ananya Gupta", referrals: 298, revenue: 920000, commission: 92000 },
  { name: "Dr. Neha Kapoor", referrals: 198, revenue: 678000, commission: 67800 },
  { name: "Dr. Lata Menon", referrals: 223, revenue: 756000, commission: 75600 },
  { name: "Dr. Priya Sharma", referrals: 175, revenue: 634000, commission: 63400 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-sm">
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        {payload.map((entry: any, idx: number) => (
          <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
            {entry.name || ""}: {typeof entry.value === "number" && entry.value > 1000
              ? formatCurrency(entry.value)
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const dateRanges = [
  { value: "12m", label: "Last 12 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "3m", label: "Last Quarter" },
  { value: "1m", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
]

export default function AnalyticsBI() {
  const { toast } = useToast()
  const [dateRange, setDateRange] = useState("12m")
  const [tab, setTab] = useState("revenue")

  const revenueTrend = useMemo(() => getRevenueTrend(), [])
  const patientTrend = useMemo(() => getPatientTrend(), [])
  const testTrend = useMemo(() => getTestTrend(), [])
  const turnaroundData = useMemo(() => getTurnaroundTimes(), [])
  const branchPerformance = useMemo(() => getBranchPerformance(), [])
  const doctorReferrals = useMemo(() => getDoctorReferrals(), [])

  const totalRevenue = useMemo(() => revenueTrend.reduce((s, r) => s + r.amount, 0), [revenueTrend])
  const avgMonthly = useMemo(() => totalRevenue / revenueTrend.length, [totalRevenue, revenueTrend])
  const growthPct = useMemo(() => {
    const last12 = revenueTrend
    if (last12.length < 2) return 0
    const recent6 = last12.slice(-6).reduce((s, r) => s + r.amount, 0)
    const prev6 = last12.slice(0, 6).reduce((s, r) => s + r.amount, 0)
    return prev6 > 0 ? ((recent6 - prev6) / prev6) * 100 : 0
  }, [revenueTrend])

  const projectedRevenue = useMemo(() => {
    const last3 = revenueTrend.slice(-3)
    const avg = last3.reduce((s, r) => s + r.amount, 0) / last3.length
    return avg * 12
  }, [revenueTrend])

  const totalPatients = useMemo(() => patientTrend.reduce((s, p) => s + p.count, 0), [patientTrend])
  const totalTests = useMemo(() => testTrend.reduce((s, t) => s + t.count, 0), [testTrend])

  const handleExport = useCallback(() => {
    toast({ title: "Export started", description: "Your report will be downloaded shortly.", variant: "success" })
  }, [toast])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & BI"
        description="Compliance-ready business intelligence for your laboratory"
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-44">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((dr) => (
                  <SelectItem key={dr.value} value={dr.value}>{dr.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <ScrollableTabs>
          <TabsList>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="patients">Patient Analytics</TabsTrigger>
            <TabsTrigger value="doctors">Doctor Analytics</TabsTrigger>
            <TabsTrigger value="branches">Branch Analytics</TabsTrigger>
            <TabsTrigger value="tat">Turnaround Time</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
          </TabsList>
        </ScrollableTabs>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={<DollarSign className="h-5 w-5" />} />
            <StatCard label="Avg Monthly" value={formatCurrency(avgMonthly)} icon={<TrendingUp className="h-5 w-5" />} />
            <StatCard label="Growth %" value={`${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`} icon={<ArrowUpRight className="h-5 w-5" />} trend={{ value: Math.round(growthPct), positive: growthPct >= 0 }} />
            <StatCard label="Projected Annual" value={formatCurrency(projectedRevenue)} icon={<Activity className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchPerformance} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="branch" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue by Test Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={revenueByCategory} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {revenueByCategory.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Month-over-Month Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mmComparison}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="previous" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Previous Period" />
                      <Bar dataKey="current" fill="#2563eb" radius={[4, 4, 0, 0]} name="Current Period" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Analytics */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Patients" value={totalPatients.toLocaleString()} icon={<Users className="h-5 w-5" />} />
            <StatCard label="Avg Monthly" value={Math.round(totalPatients / patientTrend.length).toLocaleString()} />
            <StatCard label="Patient Growth" value="+15.2%" trend={{ value: 15.2, positive: true }} />
            <StatCard label="Returning Rate" value="65%" icon={<Users className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Growth Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">New vs Returning Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={newVsReturning} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {newVsReturning.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">City-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cityDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="city" width={90} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="patients" fill="#16a34a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                {genderDistribution.map((g) => (
                  <div key={g.name} className="flex flex-col items-center gap-2">
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white"
                      style={{ backgroundColor: g.name === "Male" ? "#2563eb" : g.name === "Female" ? "#ec4899" : "#8b5cf6" }}
                    >
                      {g.value}%
                    </div>
                    <p className="text-sm font-medium">{g.name}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doctor Analytics */}
        <TabsContent value="doctors" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Referring Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={doctorReferrals} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="doctor" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Referral Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={patientTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="Referrals" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Commission Payout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={commissionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doctor Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead className="text-right">Referrals</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctorPerformance.map((doc) => (
                      <TableRow key={doc.name}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell className="text-right">{doc.referrals}</TableCell>
                        <TableCell className="text-right">{formatCurrency(doc.revenue)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(doc.commission)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Branch Analytics */}
        <TabsContent value="branches" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Branch Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="tests" fill="#16a34a" radius={[4, 4, 0, 0]} name="Tests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Branch Growth Trends (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchGrowth} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="branch" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="growth" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
                        {branchGrowth.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Branch Performance Ranking</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Tests</TableHead>
                    <TableHead className="text-right">Growth</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branchPerformance.map((b, idx) => (
                    <TableRow key={b.branch}>
                      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="font-medium">{b.branch}</TableCell>
                      <TableCell className="text-right">{formatCurrency(b.revenue)}</TableCell>
                      <TableCell className="text-right">{b.tests.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={branchGrowth.find((g) => g.branch === b.branch)?.growth ?? 0 >= 0 ? "text-emerald-600" : "text-destructive"}>
                          {branchGrowth.find((g) => g.branch === b.branch)?.growth ?? 0}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="success">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Turnaround Time */}
        <TabsContent value="tat" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Avg TAT" value="14.2 hrs" icon={<Clock className="h-5 w-5" />} />
            <StatCard label="Compliance Rate" value="87.5%" trend={{ value: 3.2, positive: true }} />
            <StatCard label="On-Time Reports" value="5,240" />
            <StatCard label="Delayed Reports" value="187" trend={{ value: 8.5, positive: false }} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">TAT by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={turnaroundData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="department" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="avgHours" fill="#2563eb" radius={[0, 4, 4, 0]} name="Avg Hours">
                        {turnaroundData.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">TAT Trend (Monthly Avg Hours)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Jan", hrs: 16.2 }, { month: "Feb", hrs: 15.8 },
                        { month: "Mar", hrs: 15.1 }, { month: "Apr", hrs: 14.6 },
                        { month: "May", hrs: 14.0 }, { month: "Jun", hrs: 14.2 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="hrs" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">TAT Compliance Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center py-8">
                  <div className="relative flex h-36 w-36 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" strokeWidth="8" />
                      <circle cx="60" cy="60" r="52" fill="none" stroke="#16a34a" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 52}`}
                        strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.875)}`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">87.5%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Within TAT", pct: 87.5, color: "success" as const },
                    { label: "Delayed < 6 hrs", pct: 8.2, color: "warning" as const },
                    { label: "Delayed > 6 hrs", pct: 4.3, color: "danger" as const },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delayed Tests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Test</TableHead>
                      <TableHead className="text-right">Delay</TableHead>
                      <TableHead className="text-right">TAT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delayedTests.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-mono text-xs">{t.id}</TableCell>
                        <TableCell>{t.patient}</TableCell>
                        <TableCell>{t.test}</TableCell>
                        <TableCell className="text-right text-destructive">{t.delay}</TableCell>
                        <TableCell className="text-right">{t.tat}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operational */}
        <TabsContent value="operational" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <StatCard label="Total Samples" value={totalTests.toLocaleString()} icon={<FlaskConical className="h-5 w-5" />} />
            <StatCard label="Peak Hour Bookings" value="520" />
            <StatCard label="Productivity Rate" value="92.3%" trend={{ value: 4.1, positive: true }} />
            <StatCard label="Avg Processing Time" value="3.2 hrs" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sample Volume Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampleVolume}>
                      <defs>
                        <linearGradient id="sampGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="count" stroke="#2563eb" fill="url(#sampGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Test Volume by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={testVolumeByDept} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="department" width={130} tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]}>
                        {testVolumeByDept.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Peak Hours Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={peakHours}>
                      <defs>
                        <linearGradient id="peakGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="bookings" stroke="#d97706" fill="url(#peakGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Staff Productivity Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {staffProductivity.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-muted-foreground">{item.actual} / {item.target}</span>
                    </div>
                    <Progress value={item.actual} max={item.target} variant={item.actual >= item.target ? "success" : "warning"} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScrollableTabs({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="min-w-max">{children}</div>
    </div>
  )
}
