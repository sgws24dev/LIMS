import { useEffect, useState } from "react"
import { getCustodyChain, type CustodyEvent } from "@/services/api/facilities"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { User, MapPin, Lock, Loader2, ChevronDown } from "lucide-react"

interface CustodyChainProps {
  assetId: string
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export default function CustodyChain({ assetId }: CustodyChainProps) {
  const [events, setEvents] = useState<CustodyEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    setLoading(true)
    getCustodyChain(assetId, page)
      .then((res) => {
        setEvents((prev) => (page === 1 ? res.items : [...prev, ...res.items]))
        setTotalCount(res.totalCount)
      })
      .finally(() => setLoading(false))
  }, [assetId, page])

  const hasMore = events.length < totalCount

  if (loading && events.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card shadow-card p-6 space-y-3">
        <h4 className="font-medium mb-2">Custody Chain</h4>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
        <h4 className="font-medium mb-2">Custody Chain</h4>
        <p className="text-sm text-muted-foreground">No custody transfers recorded yet</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
      <h4 className="font-medium mb-4">Custody Chain</h4>
      <div className="space-y-0">
        {events.map((event, idx) => (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {idx < events.length - 1 && (
              <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
            )}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
              <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{event.toUserName}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(event.transferredAt)}</span>
                {event.hasSignature && <Lock className="h-3 w-3 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3" />
                {event.fromLocation && <span>{event.fromLocation} → </span>}
                <span>{event.toLocation}</span>
              </div>
              {event.reason && (
                <span className="inline-flex items-center rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground mt-1">
                  {event.reason}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2"
          onClick={() => setPage((p) => p + 1)}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
          Load more
        </Button>
      )}
    </div>
  )
}
