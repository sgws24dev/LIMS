"use client"

import { type HTMLAttributes, type ReactNode, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  label: string
  value: string | number
  trend?: {
    value: number
    positive?: boolean
  }
  animate?: boolean
}

function StatCard({ icon, label, value, trend, className, animate = true, ...props }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(animate ? 0 : value)
  const numValue = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""))
  const isNumeric = typeof value === "number" || /^[\d,]+$/.test(String(value))

  useEffect(() => {
    if (!animate || !isNumeric || isNaN(numValue)) {
      setDisplayValue(value)
      return
    }
    setDisplayValue(0)
    const duration = 600
    const steps = 20
    const increment = numValue / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= numValue) {
        setDisplayValue(numValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, animate, numValue, isNumeric])

  const formattedDisplay = isNumeric
    ? Number(displayValue).toLocaleString()
    : typeof displayValue === "number"
      ? displayValue.toString()
      : displayValue

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5",
        "dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/[0.02] dark:to-primary/[0.03]" />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <p className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
              {formattedDisplay}
            </p>
            {trend && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-colors",
                    trend.positive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                  )}
                >
                  {trend.positive ? (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  ) : (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                  {trend.positive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-[11px] text-muted-foreground/60">vs previous</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="shrink-0 rounded-xl bg-primary/[0.08] p-3 text-primary ring-1 ring-primary/[0.06] transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/[0.12] group-hover:ring-primary/[0.12]">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { StatCard }
