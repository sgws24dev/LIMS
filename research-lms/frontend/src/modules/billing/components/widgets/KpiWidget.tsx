import { useMemo } from 'react'
import { Card, CardContent } from '@/shared/ui/card'
import { Minus, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetDataDto } from '@/services/api/billing'

interface KpiWidgetProps {
  data: WidgetDataDto
  config: Record<string, unknown>
}

export default function KpiWidget({ data, config }: KpiWidgetProps) {
  const format = (config.format as string) || 'number'
  const currentValue = data.datasets[0]?.data[0] ?? 0
  const previousValue = data.datasets[1]?.data[0]
  const changePercent = data.changePercent
  const trendDirection = data.trendDirection

  const formattedValue = useMemo(() => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentValue)
      case 'percentage':
        return `${currentValue.toFixed(1)}%`
      default:
        return currentValue.toLocaleString()
    }
  }, [currentValue, format])

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{config.label as string || 'Metric'}</p>
          <p className="text-2xl font-bold tracking-tight">{formattedValue}</p>
        </div>

        {changePercent !== undefined && changePercent !== null && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 text-sm font-medium rounded-full px-2 py-0.5',
                trendDirection === 'up'
                  ? 'text-emerald-600 bg-emerald-50'
                  : trendDirection === 'down'
                    ? 'text-red-600 bg-red-50'
                    : 'text-muted-foreground bg-muted'
              )}
            >
              {trendDirection === 'up' && <ArrowUp className="h-3 w-3" />}
              {trendDirection === 'down' && <ArrowDown className="h-3 w-3" />}
              {trendDirection === 'flat' && <Minus className="h-3 w-3" />}
              {Math.abs(changePercent).toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        )}

        {data.labels.length > 1 && data.datasets.length > 0 && (
          <div className="mt-2 h-10">
            <Sparkline data={data.datasets[0].data} color={data.datasets[0].color} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const width = 100
  const height = 30

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
