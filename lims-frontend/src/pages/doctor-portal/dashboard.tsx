"use client"

import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Users,
  FileText,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  ChevronRight,
  Star,
  Share2,
  ExternalLink,
  Activity,
  HeartPulse,
  Microscope,
  Stethoscope,
  Building2,
  MoreHorizontal,
  Eye,
} from "lucide-react"
import { cn, formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/ui/stat-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/ui/page-header"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts"

const doctorInfo = {
  name: "Dr. Sneha Reddy",
  specialization: "General Physician",
  hospital: "Apollo Hospitals, Hyderabad",
  email: "sneha.reddy@apollohospitals.com",
  phone: "+91 98200 10001",
  avatar: "/avatars/sneha.jpg",
  commission: 15,
}

const statsCards = [
  { icon: <Users className="h-5 w-5" />, label: "Patients Referred (Total)", value: 342 },
  { icon: <Users className="h-5 w-5" />, label: "This Month", value: 28, trend: { value: 12, positive: true } },
  { icon: <FileText className="h-5 w-5" />, label: "Pending Report Reviews", value: 3 },
  { icon: <IndianRupee className="h-5 w-5" />, label: "Commission Earned (Month)", value: "₹42,500" },
]

const recentReferrals = [
  { id: "REF001", patientName: "Amit Kumar", date: "2026-06-10T09:00:00Z", tests: ["Complete Blood Count", "Lipid Profile"], status: "completed" as const },
  { id: "REF002", patientName: "Priya Singh", date: "2026-06-09T14:30:00Z", tests: ["Thyroid Profile"], status: "completed" as const },
  { id: "REF003", patientName: "Ravi Verma", date: "2026-06-08T11:00:00Z", tests: ["Liver Function Test", "Fasting Blood Sugar"], status: "in_progress" as const },
  { id: "REF004", patientName: "Sunita Patel", date: "2026-06-07T10:00:00Z", tests: ["HbA1c"], status: "pending" as const },
  { id: "REF005", patientName: "Vikram Joshi", date: "2026-06-06T16:00:00Z", tests: ["Lipid Profile", "Serum Creatinine"], status: "completed" as const },
  { id: "REF006", patientName: "Neha Gupta", date: "2026-06-05T08:30:00Z", tests: ["Complete Blood Count", "Vitamin D & B12"], status: "in_progress" as const },
  { id: "REF007", patientName: "Deepak Sharma", date: "2026-06-04T13:00:00Z", tests: ["Liver Function Test"], status: "completed" as const },
]

const monthlyReferralsData = [
  { month: "Jan", referrals: 22, commission: 28000 },
  { month: "Feb", referrals: 25, commission: 32000 },
  { month: "Mar", referrals: 28, commission: 35000 },
  { month: "Apr", referrals: 20, commission: 26000 },
  { month: "May", referrals: 32, commission: 41000 },
  { month: "Jun", referrals: 28, commission: 38000 },
]

const monthlyCommissionData = [
  { month: "Jan", amount: 28000 },
  { month: "Feb", amount: 32000 },
  { month: "Mar", amount: 35000 },
  { month: "Apr", amount: 26000 },
  { month: "May", amount: 41000 },
  { month: "Jun", amount: 38000 },
]

const topTestsData = [
  { test: "CBC", count: 145 },
  { test: "Lipid Profile", count: 98 },
  { test: "FBS", count: 87 },
  { test: "LFT", count: 72 },
  { test: "HbA1c", count: 65 },
]

const patientReviews = [
  { id: "REV001", patientName: "Amit Kumar", rating: 5, comment: "Excellent service. Reports were ready on time.", date: "2026-06-10" },
  { id: "REV002", patientName: "Priya Singh", rating: 4, comment: "Very thorough checkup. Highly recommended.", date: "2026-06-09" },
  { id: "REV003", patientName: "Ravi Verma", rating: 5, comment: "Great doctor. Very detailed explanation.", date: "2026-06-08" },
]

const referralStatusBadge = (status: string) => {
  const map: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "default" }> = {
    completed: { label: "Completed", variant: "success" },
    in_progress: { label: "In Progress", variant: "default" },
    pending: { label: "Pending", variant: "warning" },
  }
  const s = map[status] ?? { label: status, variant: "secondary" }
  return <Badge variant={s.variant}>{s.label}</Badge>
}

export default function DoctorPortalDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase()

  const handleViewReport = (id: string) => {
    toast({ title: "Opening Report", description: `Loading report for referral ${id}`, variant: "default" })
  }

  const verifiedReviews = patientReviews.filter((r) => r.rating >= 4)
  const avgRating = useMemo(() => {
    if (patientReviews.length === 0) return 0
    return patientReviews.reduce((sum, r) => sum + r.rating, 0) / patientReviews.length
  }, [])

  return (
    <div className="space-y-6">
      {/* Doctor Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={doctorInfo.avatar} alt={doctorInfo.name} />
                <AvatarFallback className="text-lg bg-primary/10 text-primary">
                  {getInitials(doctorInfo.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, <span className="text-primary">{doctorInfo.name}</span>
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    {doctorInfo.specialization}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {doctorInfo.hospital}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {doctorInfo.commission}% Commission
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/doctors/referral-tracking")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Full Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} {...(stat.trend ? { trend: stat.trend } : {})} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Referrals */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Referrals</CardTitle>
              <CardDescription>Latest patients referred for lab tests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/doctors/referral-tracking")}>
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(referral.patientName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{referral.patientName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(referral.date, "short")}</span>
                        <span>&middot;</span>
                        <span>{referral.tests.length} test(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {referralStatusBadge(referral.status)}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewReport(referral.id)} title="View Report">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/doctors/referral-tracking")}>
                <Users className="mr-2 h-4 w-4" />
                View All Referrals
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/patient-portal/reports")}>
                <FileText className="mr-2 h-4 w-4" />
                Check Reports
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <IndianRupee className="mr-2 h-4 w-4" />
                Commission Statement
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Top Tests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Tests Prescribed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topTestsData.map((item) => (
                <div key={item.test} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.test}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <Progress
                    value={(item.count / topTestsData[0].count) * 100}
                    variant="default"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Monthly Referrals
            </CardTitle>
            <CardDescription>Number of patients referred per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReferralsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="referrals" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Commission */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-emerald-500" />
              Monthly Commission
            </CardTitle>
            <CardDescription>Commission earned from referrals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyCommissionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground" />
                  <YAxis className="text-xs text-muted-foreground" />
                  <RechartsTooltip
                    formatter={(value: unknown) => [formatCurrency(Number(value)), "Commission"]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid var(--border)" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Reviews */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Patient Feedback
            </CardTitle>
            <CardDescription>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                    )}
                  />
                ))}
                <span className="ml-1 font-medium">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({patientReviews.length} reviews)</span>
              </span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {patientReviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{review.patientName}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3 w-3",
                          i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.date, "short")}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
