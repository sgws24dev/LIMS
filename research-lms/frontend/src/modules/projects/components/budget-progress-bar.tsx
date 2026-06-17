import { cn } from '@/lib/utils'

interface BudgetProgressBarProps {
  budget: number
  spent: number
  showPercent?: boolean
  className?: string
}

export function BudgetProgressBar({ budget, spent, showPercent = true, className }: BudgetProgressBarProps) {
  const pct = budget === 0 ? 0 : Math.min((spent / budget) * 100, 100)
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-300', color)} style={{ width: `${pct}%` }} />
      </div>
      {showPercent && (
        <span className={cn('text-xs font-medium tabular-nums', pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-green-600')}>
          {pct.toFixed(0)}%
        </span>
      )}
    </div>
  )
}
