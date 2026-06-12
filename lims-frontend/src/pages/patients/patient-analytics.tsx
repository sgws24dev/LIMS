"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Users, UserPlus, Activity, Calendar } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { patients } from "@/mock/data/patients"
import { analytics } from "@/mock/data/analytics"
import { useAppStore } from "@/store/appStore"

function calculateAge(dob: string): number {
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

const MAX_BAR_WIDTH = 180

function BarChart({
  data,
  labelKey,
  valueKey,
  color = "bg-primary",
  height = 200,
}: {
  data: Record<string, unknown>[]
  labelKey: string
  valueKey: string
  color?: string
  height?: number
}) {
  const maxValue = Math.max(...data.map((d) => Number(d[valueKey])), 1)
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const value = Number(d[valueKey])
        const barHeight = (value / maxValue) * (height - 20)
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-medium">{value}</span>
            <div
              className={`w-full rounded-t ${color}`}
              style={{ height: barHeight }}
            />
            <span className="text-xs text-muted-foreground truncate w-full text-center">
              {String(d[labelKey])}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PieChart({
  data,
  labelKey,
  valueKey,
}: {
  data: Record<string, unknown>[]
  labelKey: string
  valueKey: string
}) {
  const total = data.reduce((s, d) => s + Number(d[valueKey]), 0)
  const colors = [
    "bg-blue-500",
    "bg-rose-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-cyan-500",
    "bg-orange-500",
    "bg-pink-500",
  ]
  return (
    <div className="flex items-center gap-6">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          {data.map((d, i) => {
            const percentage = Number(d[valueKey]) / total
            const circumference = 2 * Math.PI * 40
            const offset = data
              .slice(0, i)
              .reduce((s, dd) => s + (Number(dd[valueKey]) / total) * circumference, 0)
            const length = percentage * circumference
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                strokeWidth="15"
                className={colors[i % colors.length].replace("bg-", "stroke-")}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            )
          })}
        </svg>
      </div>
      <div className="space-y-2">
        {data.map((d, i) => {
          const percentage = ((Number(d[valueKey]) / total) * 100).toFixed(1)
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className={`h-3 w-3 rounded-full ${colors[i % colors.length]}`}
              />
              <span>{String(d[labelKey])}</span>
              <span className="text-muted-foreground">({percentage}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PatientAnalytics() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("12")

  useEffect(() => {
    setBreadcrumbs([{ label: "Patients", href: "/patients" }, { label: "Analytics" }])
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const totalPatients = patients.length
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const newPatientsThisMonth = patients.filter(
    (p) => new Date(p.createdAt) >= lastMonth
  ).length
  const activePatients = patients.filter(
    (p) =>
      p.visits.length > 0 &&
      new Date(p.visits[p.visits.length - 1].date) >=
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  ).length
  const avgVisits =
    totalPatients > 0
      ? (patients.reduce((s, p) => s + p.visits.length, 0) / totalPatients).toFixed(1)
      : "0"

  const ageGroups: Record<string, number> = {
    "0-18": 0,
    "19-30": 0,
    "31-45": 0,
    "46-60": 0,
    "60+": 0,
  }
  patients.forEach((p) => {
    const age = calculateAge(p.dob)
    if (age <= 18) ageGroups["0-18"]++
    else if (age <= 30) ageGroups["19-30"]++
    else if (age <= 45) ageGroups["31-45"]++
    else if (age <= 60) ageGroups["46-60"]++
    else ageGroups["60+"]++
  })

  const genderData = [
    { label: "Male", value: patients.filter((p) => p.gender === "male").length },
    { label: "Female", value: patients.filter((p) => p.gender === "female").length },
    { label: "Other", value: patients.filter((p) => p.gender === "other").length },
  ]

  const cityData = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      acc[p.city] = (acc[p.city] || 0) + 1
      return acc
    }, {})
  )
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const bloodGroupData = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      acc[p.bloodGroup] = (acc[p.bloodGroup] || 0) + 1
      return acc
    }, {})
  )
    .map(([group, count]) => ({ group, count }))
    .sort((a, b) => b.count - a.count)

  const growthData = analytics.patients.slice(-Number(timeRange))

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Analytics"
        description="Overview of patient demographics and trends"
        actions={
          <Button variant="outline" onClick={() => navigate("/patients")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Patients"
          value={totalPatients}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: newPatientsThisMonth }}
        />
        <StatCard
          label="New Patients (Month)"
          value={newPatientsThisMonth}
          icon={<UserPlus className="h-5 w-5" />}
          trend={{ value: Math.round((newPatientsThisMonth / totalPatients) * 100) }}
        />
        <StatCard
          label="Active Patients (90d)"
          value={activePatients}
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: Math.round((activePatients / totalPatients) * 100) }}
        />
        <StatCard
          label="Avg Visits / Patient"
          value={avgVisits}
          icon={<Calendar className="h-5 w-5" />}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Patient Growth</CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <BarChart
            data={growthData}
            labelKey="month"
            valueKey="count"
            color="bg-blue-500"
            height={220}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Age & Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  Age Groups
                </h4>
                <PieChart
                  data={Object.entries(ageGroups).map(([label, value]) => ({
                    label,
                    value,
                  }))}
                  labelKey="label"
                  valueKey="value"
                />
              </div>
              <div>
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  Gender
                </h4>
                <PieChart
                  data={genderData}
                  labelKey="label"
                  valueKey="value"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>City-Wise Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cityData.map((item, i) => {
                const maxVal = cityData[0]?.count || 1
                const pct = (item.count / maxVal) * 100
                return (
                  <div key={item.city} className="flex items-center gap-3">
                    <span className="w-24 text-sm truncate">{item.city}</span>
                    <div className="flex-1 h-5 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full rounded bg-blue-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-sm font-medium">
                      {item.count}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blood Group Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {bloodGroupData.map((item) => {
              const pct = ((item.count / totalPatients) * 100).toFixed(1)
              return (
                <div
                  key={item.group}
                  className="rounded-lg border p-4 text-center"
                >
                  <p className="text-2xl font-bold">{item.group}</p>
                  <p className="text-sm text-muted-foreground">{item.count} patients</p>
                  <p className="text-xs text-muted-foreground">{pct}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
