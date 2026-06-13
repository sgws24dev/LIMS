"use client"

import { useState, useRef, useCallback, type HTMLAttributes } from "react"
import { cn, formatCurrency } from "@/lib/utils"

export interface ChartDataItem {
  label: string
  value: number
  secondary?: number
  color?: string
}

export interface ExecutiveChartProps extends HTMLAttributes<HTMLDivElement> {
  data: ChartDataItem[]
  type: "bar" | "horizontal-bar" | "line" | "pie" | "donut"
  height?: number
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  showLabels?: boolean
  formatValue?: (value: number) => string
  target?: number
  animate?: boolean
}

const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(160, 84%, 39%)",
  "hsl(24, 94%, 53%)",
]

function getColor(index: number, colors?: string[]): string {
  const palette = colors?.length ? colors : DEFAULT_COLORS
  return palette[index % palette.length]
}

export function ExecutiveChart({
  data,
  type,
  height = 280,
  colors,
  showLegend = true,
  showGrid = true,
  showLabels = true,
  formatValue,
  target,
  animate = true,
  className,
  ...props
}: ExecutiveChartProps) {
  const [tooltip, setTooltip] = useState<{ item: ChartDataItem; x: number; y: number } | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const fv = formatValue ?? ((v: number) => v.toLocaleString())

  const handleMouseEnter = useCallback(
    (item: ChartDataItem, e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const chart = chartRef.current?.getBoundingClientRect()
      if (!chart) return
      setTooltip({ item, x: rect.left - chart.left + rect.width / 2, y: rect.top - chart.top })
    },
    []
  )

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  if (!data.length) return null

  const maxVal = Math.max(...data.map((d) => d.value + (d.secondary ?? 0)), 1)

  if (type === "pie" || type === "donut") {
    const total = data.reduce((s, d) => s + d.value, 0)
    let cumulative = 0
    return (
      <div className={cn("relative", className)} ref={chartRef} {...props}>
        <svg width="100%" height={height} viewBox={`0 0 ${height} ${height}`} className="overflow-visible">
          {data.map((item, i) => {
            const pct = total > 0 ? item.value / total : 0
            const dashArray = pct * 2 * Math.PI * (height * 0.38)
            const dashOffset = -cumulative * 2 * Math.PI * (height * 0.38)
            cumulative += pct
            return (
              <circle
                key={item.label}
                cx={height / 2}
                cy={height / 2}
                r={height * 0.38}
                fill="none"
                stroke={getColor(i, colors)}
                strokeWidth={height * 0.1}
                strokeDasharray={`${dashArray} ${2 * Math.PI * (height * 0.38) - dashArray}`}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${height / 2} ${height / 2})`}
                className={animate ? "transition-all duration-700" : ""}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
          {type === "donut" && (
            <circle cx={height / 2} cy={height / 2} r={height * 0.28} fill="hsl(var(--background))" />
          )}
          {type === "donut" && (
            <text x={height / 2} y={height / 2 - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="currentColor">
              {fv(total)}
            </text>
          )}
          {type === "donut" && (
            <text x={height / 2} y={height / 2 + 16} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
              Total
            </text>
          )}
        </svg>
        {showLegend && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
            {data.map((item, i) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: getColor(i, colors) }} />
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{fv(item.value)}</span>
              </div>
            ))}
          </div>
        )}
        {tooltip && (
          <div className="pointer-events-none absolute z-10 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: tooltip.x, top: tooltip.y - 10, transform: "translate(-50%, -100%)" }}>
            <p className="font-medium text-foreground">{tooltip.item.label}</p>
            <p className="text-muted-foreground">{fv(tooltip.item.value)}</p>
          </div>
        )}
      </div>
    )
  }

  if (type === "horizontal-bar") {
    const barHeight = Math.max(20, Math.min(36, (height - 40) / data.length))
    return (
      <div className={cn("relative", className)} ref={chartRef} {...props}>
        <div className="space-y-1.5" style={{ height }}>
          {data.map((item, i) => {
            const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0
            return (
              <div key={item.label} className="flex items-center gap-3 text-xs">
                <span className="w-28 shrink-0 truncate text-right text-muted-foreground">{item.label}</span>
                <div className="relative flex-1" style={{ height: barHeight }}>
                  <div
                    className="h-full rounded-md transition-all duration-700"
                    style={{
                      width: animate ? `${pct}%` : `${pct}%`,
                      backgroundColor: getColor(i, colors),
                      opacity: 0.85,
                    }}
                    onMouseEnter={(e) => handleMouseEnter(item, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                  {target != null && (
                    <div
                      className="absolute top-0 h-full border-r-2 border-destructive/50"
                      style={{ left: `${(target / maxVal) * 100}%` }}
                    />
                  )}
                </div>
                {showLabels && <span className="w-20 shrink-0 font-medium tabular-nums">{fv(item.value)}</span>}
              </div>
            )
          })}
        </div>
        {tooltip && (
          <div className="pointer-events-none absolute z-10 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: tooltip.x, top: tooltip.y - 10, transform: "translate(-50%, -100%)" }}>
            <p className="font-medium text-foreground">{tooltip.item.label}</p>
            <p className="text-muted-foreground">{fv(tooltip.item.value)}</p>
          </div>
        )}
      </div>
    )
  }

  if (type === "line") {
    const paddedMax = maxVal * 1.15
    const ySteps = 4
    return (
      <div className={cn("relative", className)} ref={chartRef} {...props}>
        <svg width="100%" height={height} className="overflow-visible">
          {showGrid &&
            Array.from({ length: ySteps + 1 }).map((_, i) => {
              const y = (height - 24) * (1 - i / ySteps) + 12
              return (
                <g key={i}>
                  <line x1={40} y1={y} x2="100%" y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 4" />
                  <text x={36} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
                    {fv(Math.round(paddedMax * (i / ySteps)))}
                  </text>
                </g>
              )
            })}
          <polyline
            fill="none"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={data
              .map((item, i) => {
                const x = 40 + (i / Math.max(data.length - 1, 1)) * (100 - 40) + "%"
                const y = (height - 24) * (1 - item.value / paddedMax) + 12
                return `${x},${y}`
              })
              .join(" ")}
          />
          {data.map((item, i) => {
            const cx = 40 + (i / Math.max(data.length - 1, 1)) * (100 - 40) + "%"
            const cy = (height - 24) * (1 - item.value / paddedMax) + 12
            return (
              <circle
                key={item.label}
                cx={cx}
                cy={cy}
                r={4}
                fill="hsl(var(--chart-1))"
                stroke="hsl(var(--background))"
                strokeWidth={2}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              />
            )
          })}
          {showLabels &&
            data.map((item, i) => {
              const x = 40 + (i / Math.max(data.length - 1, 1)) * (100 - 40) + "%"
              return (
                <text
                  key={item.label}
                  x={x}
                  y={height - 4}
                  textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {item.label.length > 5 ? item.label.slice(0, 5) + "..." : item.label}
                </text>
              )
            })}
        </svg>
        {tooltip && (
          <div className="pointer-events-none absolute z-10 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: tooltip.x, top: tooltip.y - 10, transform: "translate(-50%, -100%)" }}>
            <p className="font-medium text-foreground">{tooltip.item.label}</p>
            <p className="text-muted-foreground">{fv(tooltip.item.value)}</p>
          </div>
        )}
      </div>
    )
  }

  const barWidth = Math.max(8, Math.min(48, (100 / data.length) * 0.6))
  const paddedMax = maxVal * 1.15
  return (
    <div className={cn("relative", className)} ref={chartRef} {...props}>
      <svg width="100%" height={height} className="overflow-visible">
        {showGrid &&
          Array.from({ length: 5 }).map((_, i) => {
            const y = (height - 24) * (1 - i / 4) + 12
            return (
              <g key={i}>
                <line x1={48} y1={y} x2="100%" y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} strokeDasharray="4 4" />
                <text x={44} y={y + 4} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))">
                  {fv(Math.round(paddedMax * (i / 4)))}
                </text>
              </g>
            )
          })}
        {data.map((item, i) => {
          const x = 48 + (i / data.length) * (100 - 48) + (100 - 48) / data.length / 2 - barWidth / 2 + "%"
          const barH = maxVal > 0 ? (item.value / paddedMax) * (height - 36) : 0
          const y = height - 12 - barH
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={`${barWidth}%`}
                height={barH}
                rx={3}
                fill={getColor(i, colors)}
                opacity={0.85}
                className={animate ? "transition-all duration-700" : ""}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(item, e)}
                onMouseLeave={handleMouseLeave}
              />
              {showLabels && (
                <text
                  x={x}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="hsl(var(--muted-foreground))"
                >
                  {item.label.length > 6 ? item.label.slice(0, 6) + "..." : item.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      {tooltip && (
        <div className="pointer-events-none absolute z-10 rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg" style={{ left: tooltip.x, top: tooltip.y - 10, transform: "translate(-50%, -100%)" }}>
          <p className="font-medium text-foreground">{tooltip.item.label}</p>
          <p className="text-muted-foreground">{fv(tooltip.item.value)}</p>
          {tooltip.item.secondary != null && (
            <p className="text-muted-foreground">Secondary: {fv(tooltip.item.secondary)}</p>
          )}
        </div>
      )}
    </div>
  )
}
