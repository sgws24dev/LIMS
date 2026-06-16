interface AssetTimelineProps {
  assetId: string
}

export default function AssetTimeline({ assetId }: AssetTimelineProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-card p-6">
      <h4 className="font-medium mb-2">Activity Timeline</h4>
      <p className="text-sm text-muted-foreground">Activity timeline coming in Sprint 4</p>
    </div>
  )
}
