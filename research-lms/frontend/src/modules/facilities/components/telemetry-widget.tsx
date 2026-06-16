import { useEffect, useState, useRef } from "react"
import { getTelemetrySummary, type TelemetrySummary } from "@/services/api/facilities"
import { Skeleton } from "@/shared/ui/skeleton"
import { Wifi, WifiOff, Activity, Clock } from "lucide-react"

interface TelemetryWidgetProps {
  instrumentId: string
  isIotEnabled: boolean
}

function formatMetricKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ")
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  return `${hours}h ago`
}

export default function TelemetryWidget({ instrumentId, isIotEnabled }: TelemetryWidgetProps) {
  const [summary, setSummary] = useState<TelemetrySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSummary = () => {
    getTelemetrySummary(instrumentId)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isIotEnabled) return
    fetchSummary()
    intervalRef.current = setInterval(fetchSummary, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [instrumentId, isIotEnabled])

  if (!isIotEnabled) {
    return (
      <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4" /> Live Telemetry
        </h4>
        <p className="text-sm text-muted-foreground">IoT not enabled for this instrument</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-3">
        <h4 className="font-medium mb-2">Live Telemetry</h4>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  const metricEntries = summary ? Object.entries(summary.metricLatestValues) : []

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
      <h4 className="font-medium mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4" /> Live Telemetry
      </h4>

      <div className="flex items-center gap-2 mb-4">
        {summary?.isOnline ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/30 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            <Wifi className="h-3 w-3" /> Online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-950/30 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
            <WifiOff className="h-3 w-3" /> Offline
          </span>
        )}
        {summary?.latestTimestamp && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> Last seen {timeAgo(summary.latestTimestamp)}
          </span>
        )}
      </div>

      {metricEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No telemetry data received yet</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {metricEntries.map(([key, value]) => (
            <div key={key} className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">{formatMetricKey(key)}</p>
              <p className="text-lg font-semibold mt-0.5">{value.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
