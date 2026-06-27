import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts'
import { Button } from '@/shared/ui/button'
import { Download } from 'lucide-react'
import type { WidgetDataDto } from '@/services/api/billing'

interface ChartWidgetProps {
  data: WidgetDataDto
  config: Record<string, unknown>
}

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
]

export default function ChartWidget({ data, config }: ChartWidgetProps) {
  const chartType = (config.widgetType as string) || 'BarChart'
  const [dateRange, setDateRange] = useState('90d')

  if (!data.labels.length) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  const chartData = data.labels.map((label, i) => {
    const row: Record<string, string | number> = { name: label }
    data.datasets.forEach((ds) => {
      row[ds.label] = ds.data[i] ?? 0
    })
    return row
  })

  const downloadChart = () => {
    const svg = document.querySelector(`[data-chart-id="${config._widgetId}"]`) as SVGElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      ctx!.scale(2, 2)
      ctx!.drawImage(img, 0, 0)
      const link = document.createElement('a')
      link.download = 'chart.png'
      link.href = canvas.toDataURL()
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const colors = data.datasets.map((ds) => ds.color)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 pt-2">
        <div className="flex gap-1">
          {DATE_RANGES.map((r) => (
            <Button
              key={r.label}
              variant={dateRange === r.label ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setDateRange(r.label)}
              className="text-xs h-6 px-2"
            >
              {r.label}
            </Button>
          ))}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={downloadChart} title="Download as PNG">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 min-h-0 px-2 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'LineChart' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {data.datasets.map((ds, i) => (
                <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={ds.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          ) : chartType === 'BarChart' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {data.datasets.map((ds, i) => (
                <Bar key={ds.label} dataKey={ds.label} fill={ds.color} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          ) : chartType === 'PieChart' ? (
            <PieChart>
              <Pie
                data={chartData}
                dataKey={data.datasets[0]?.label || 'value'}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length] || '#3b82f6'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              {data.datasets.map((ds, i) => (
                <Area
                  key={ds.label}
                  type="monotone"
                  dataKey={ds.label}
                  stroke={ds.color}
                  fill={ds.color}
                  fillOpacity={0.15}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
