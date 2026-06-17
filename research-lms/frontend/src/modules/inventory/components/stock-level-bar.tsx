import { cn } from '@/lib/utils'

interface StockLevelBarProps {
  quantity: number
  reorderLevel: number
  maxQuantity?: number
  showLabel?: boolean
  className?: string
}

export function StockLevelBar({ quantity, reorderLevel, maxQuantity, showLabel = true, className }: StockLevelBarProps) {
  const max = maxQuantity ?? Math.max(quantity, reorderLevel * 2, 10)
  const pct = Math.min((quantity / max) * 100, 100)
  const reorderPct = Math.min((reorderLevel / max) * 100, 100)

  const color = quantity <= 0 ? 'bg-red-500'
    : quantity <= reorderLevel ? 'bg-amber-500'
    : 'bg-green-500'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-400 dark:bg-red-500"
          style={{ left: `${reorderPct}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium tabular-nums', color === 'bg-red-500' ? 'text-red-600' : color === 'bg-amber-500' ? 'text-amber-600' : 'text-green-600')}>
          {quantity}
        </span>
      )}
    </div>
  )
}
