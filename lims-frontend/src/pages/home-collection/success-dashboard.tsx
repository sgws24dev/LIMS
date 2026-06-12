"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Calendar,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useAppStore } from "@/store/appStore"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingState } from "@/components/shared/loading-state"
import { ErrorState } from "@/components/shared/error-state"
import { EmptyState } from "@/components/ui/empty-state"
import { cn, formatDate } from "@/lib/utils"
import { getHCVisits, getAgents } from "@/mock/services"
import type { HCVisit, Agent } from "@/types"

export default function SuccessDashboardPage() {
  const setBreadcrumbs = useAppStore((s) => s.setBreadcrumbs)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visits, setVisits] = useState<HCVisit[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  useEffect(() => {
    setBreadcrumbs([
      { label: "Home", href: "/" },
      { label: "Home Collection", href: "/home-collection" },
      { label: "Dashboard" },
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [v, a] = await Promise.all([getHCVisits(), getAgents()])
        setVisits(v)
        setAgents(a)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filterByPeriod = (items: (HCVisit | Agent)[], dateField?: keyof HCVisit) => {
    const now = new Date()
    if (period === "daily") {
      const today = now.toISOString().slice(0, 10)
      return items.filter((item) => {
        if (dateField && "scheduledTime" in item) {
          return (item as HCVisit).scheduledTime?.startsWith(today)
        }
        return true
      })
    }
    if (period === "weekly") {
      const weekAgo = new Date(now.getTime() - 7 * 86400000)
      return items.filter((item) => {
        if (dateField && "scheduledTime" in item) {
          return new Date((item as HCVisit).scheduledTime) >= weekAgo
        }
        return true
      })
    }
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    return items.filter((item) => {
      if (dateField && "scheduledTime" in item) {
        return new Date((item as HCVisit).scheduledTime) >= monthAgo
      }
      return true
    })
  }

  const stats = useMemo(() => {
    const filteredVisits = filterByPeriod(visits, "scheduledTime") as HCVisit[]
    const total = filteredVisits.length
    const completed = filteredVisits.filter((v) => v.status === "completed").length
    const missed = filteredVisits.filter((v) => v.status === "missed").length
    const cancelled = filteredVisits.filter((v) => v.status === "cancelled").length
    const activeAgents = agents.filter((a) => a.status !== "offline").length
    const totalPayment = filteredVisits.reduce((s, v) => s + v.paymentCollected, 0)
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const totalSamples = filteredVisits.reduce((s, v) => s + v.samplesCollected, 0)
    return { total, completed, missed, cancelled, activeAgents, totalPayment, successRate, totalSamples }
  }, [visits, agents, period])

  const collectionTrend = useMemo(() => {
    const chartData: { date: string; count: number; completed: number }[] = []
    const days = period === "daily" ? 7 : period === "weekly" ? 4 : 6
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      if (period === "weekly") date.setDate(date.getDate() - i * 7)
      else if (period === "monthly") date.setMonth(date.getMonth() - i)
      else date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0, 10)
      const dayVisits = visits.filter((v) => v.scheduledTime.startsWith(key))
      chartData.push({
        date: key,
        count: dayVisits.length,
        completed: dayVisits.filter((v) => v.status === "completed").length,
      })
    }
    return chartData
  }, [visits, period])

  const agentRanking = useMemo(() => {
    const agentStats = agents.map((a) => {
      const agentVisits = visits.filter((v) => v.agentId === a.id)
      const completed = agentVisits.filter((v) => v.status === "completed").length
      const total = agentVisits.length
      const samples = agentVisits.reduce((s, v) => s + v.samplesCollected, 0)
      return { ...a, completed, total, samples, rate: total > 0 ? Math.round((completed / total) * 100) : 0 }
    })
    return agentStats.sort((a, b) => b.rate - a.rate || b.completed - a.completed)
  }, [agents, visits])

  const missedCollections = useMemo(() => {
    return visits.filter((v) => v.status === "missed" || v.status === "cancelled")
  }, [visits])

  const maxTrendCount = Math.max(...collectionTrend.map((d) => d.count), 1)

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Success Dashboard" description="Home collection success metrics" />
        <LoadingState type="detail" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Success Dashboard" description="Home collection success metrics" />
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Success Dashboard"
        description="Home collection success metrics"
        actions={
          <Tabs value={period} onValueChange={(v) => setPeriod(v as "daily" | "weekly" | "monthly")}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          label="Total Collections"
          value={stats.total}
          trend={stats.total > 10 ? { value: 12, positive: true } : undefined}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Success Rate"
          value={`${stats.successRate}%`}
          trend={stats.successRate >= 80 ? { value: 5, positive: true } : { value: 3, positive: false }}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Avg Response Time"
          value="45 min"
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Active Agents"
          value={stats.activeAgents}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Collection Trend</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary" /> Total</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Completed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {collectionTrend.length === 0 ? (
              <EmptyState title="No data" description="No collection data for this period" />
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {collectionTrend.map((d) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div className="w-full flex flex-col items-center gap-0.5" style={{ height: "100%" }}>
                      <div
                        className="w-full bg-emerald-500/70 rounded-t"
                        style={{ height: `${(d.completed / maxTrendCount) * 100}%` }}
                      />
                      <div
                        className="w-full bg-primary/30 rounded-t"
                        style={{ height: `${((d.count - d.completed) / maxTrendCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(d.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Agent Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {agentRanking.length === 0 ? (
              <EmptyState title="No agents" description="No agents available" />
            ) : (
              agentRanking.slice(0, 5).map((agent, idx) => (
                <div key={agent.id} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold",
                      idx === 0 ? "bg-amber-100 text-amber-600" :
                      idx === 1 ? "bg-gray-100 text-gray-600" :
                      idx === 2 ? "bg-orange-100 text-orange-600" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium">{agent.name}</p>
                      <p className="text-[10px] text-muted-foreground">{agent.completed}/{agent.total} visits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="font-semibold">{agent.rate}%</span>
                    {agent.rate >= 80 ? <ArrowUp className="h-3 w-3 text-emerald-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {missedCollections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Missed Collections ({missedCollections.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-md border">
              {missedCollections.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium">{v.patientName}</p>
                    <p className="text-xs text-muted-foreground">{v.patientAddress}</p>
                    {v.notes && <p className="text-xs text-red-600 mt-0.5">{v.notes}</p>}
                  </div>
                  <Badge variant={v.status === "missed" ? "destructive" : "secondary"}>
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
