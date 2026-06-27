import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { PageContainer } from '@/shared/shared/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, DollarSign, Percent, BookOpen, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInstrument365Data, type Instrument365Dto } from '@/services/api/billing'

export default function Instrument365View() {
  const { id } = useParams<{ id: string }>()
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<Instrument365Dto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<'revenueGenerated' | 'totalBookings' | 'utilizedHours'>('revenueGenerated')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getInstrument365Data(id, year)
      .then(setData)
      .catch(() => setError('Failed to load instrument data'))
      .finally(() => setLoading(false))
  }, [id, year])

  const heatmapData = useMemo(() => {
    if (!data) return []
    return data.dailyMetrics.map((m) => ({
      date: new Date(m.date),
      value: m[metric],
      raw: m,
    }))
  }, [data, metric])

  const weeks = useMemo(() => {
    if (heatmapData.length === 0) return []
    const result: { week: number; days: typeof heatmapData }[] = []
    let currentWeek: typeof heatmapData = []
    let weekIndex = 0

    heatmapData.forEach((d, i) => {
      const dayOfWeek = d.date.getDay()
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        result.push({ week: weekIndex++, days: currentWeek })
        currentWeek = []
      }
      currentWeek.push(d)
    })
    if (currentWeek.length > 0) result.push({ week: weekIndex, days: currentWeek })
    return result
  }, [heatmapData])

  const maxVal = Math.max(...heatmapData.map((d) => d.value), 1)

  const monthlyTrend = useMemo(() => {
    if (!data) return []
    const map = new Map<string, number>()
    data.dailyMetrics.forEach((m) => {
      const key = new Date(m.date).toLocaleString('default', { month: 'short', year: 'numeric' })
      map.set(key, (map.get(key) || 0) + m.revenueGenerated)
    })
    return Array.from(map.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [data])

  return (
    <PageContainer
      title="Instrument 365 View"
      description="Daily instrument metrics for the entire year"
      status={loading ? 'loading' : error ? 'error' : !data ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={() => id && getInstrument365Data(id, year).then(setData).catch(() => setError('Failed to load'))}
    >
      {data && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <option key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={metric}
              onChange={(e) => setMetric(e.target.value as typeof metric)}
            >
              <option value="revenueGenerated">Revenue</option>
              <option value="totalBookings">Bookings</option>
              <option value="utilizedHours">Utilization Hours</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <SummaryCard
              title="Total Revenue"
              value={`$${data.summary.totalRevenue.toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <SummaryCard
              title="Utilization"
              value={`${data.summary.utilizationPercent}%`}
              icon={<Percent className="h-4 w-4" />}
            />
            <SummaryCard
              title="Downtime"
              value={`${data.summary.downtimePercent}%`}
              icon={<Activity className="h-4 w-4" />}
            />
            <SummaryCard
              title="Avg Bookings/Day"
              value={data.summary.avgBookingsPerDay.toFixed(1)}
              icon={<BookOpen className="h-4 w-4" />}
            />
            <SummaryCard
              title="Top Service Month"
              value={data.summary.topServiceMonth}
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Annual Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              <TooltipProvider>
                <div className="flex gap-0.5 overflow-x-auto">
                  {weeks.map((week) => (
                    <div key={week.week} className="flex flex-col gap-0.5">
                      {week.days.map((day) => {
                        const intensity = day.value / maxVal
                        const color =
                          intensity > 0.75
                            ? 'bg-emerald-600'
                            : intensity > 0.5
                              ? 'bg-emerald-500'
                              : intensity > 0.25
                                ? 'bg-emerald-300'
                                : intensity > 0
                                  ? 'bg-emerald-100'
                                  : 'bg-muted'
                        return (
                          <Tooltip key={day.date.toISOString()}>
                            <TooltipTrigger asChild>
                              <div
                                className={cn('w-3 h-3 rounded-sm cursor-pointer', color)}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <p>{day.date.toLocaleDateString()}</p>
                              <p>
                                {metric === 'revenueGenerated'
                                  ? `$${day.raw.revenueGenerated.toLocaleString()}`
                                  : metric === 'totalBookings'
                                    ? `${day.raw.totalBookings} bookings`
                                    : `${day.raw.utilizedHours}h utilized`}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  )
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
          {icon}
          <span>{title}</span>
        </div>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
