import { useState, useMemo } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Download, Search, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetDataDto } from '@/services/api/billing'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'

interface TableWidgetProps {
  data: WidgetDataDto
  config: Record<string, unknown>
}

export default function TableWidget({ data, config }: TableWidgetProps) {
  const [search, setSearch] = useState('')
  const [sortColumn, setSortColumn] = useState<number | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const columns = (config.columns as string[]) || data.labels
  const columnCount = columns.length || data.datasets.length

  const rows = useMemo(() => {
    if (columnCount === 0) return []
    const rowCount = Math.max(data.labels.length, ...data.datasets.map((ds) => ds.data.length))
    const result: Record<string, string | number>[] = []

    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, string | number> = {}
      if (columns.length > 0 && data.labels[i] !== undefined) {
        row[columns[0]] = data.labels[i]
      }
      data.datasets.forEach((ds, di) => {
        const colName = columns[di + 1] || ds.label
        row[colName] = ds.data[i] ?? 0
      })
      result.push(row)
    }
    return result
  }, [data, columns, columnCount])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [rows, search])

  const sorted = useMemo(() => {
    if (sortColumn === null) return filtered
    const keys = Object.keys(filtered[0] || {})
    const key = keys[sortColumn]
    if (!key) return filtered
    return [...filtered].sort((a, b) => {
      const va = a[key]
      const vb = b[key]
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va))
    })
  }, [filtered, sortColumn, sortDir])

  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize)

  const columns_visible = useMemo(() => {
    if (columns.length > 0) {
      return columns
    }
    return ['Label', ...data.datasets.map((ds) => ds.label)]
  }, [columns, data.datasets])

  const exportCsv = () => {
    const header = columns_visible.join(',')
    const csvRows = sorted.map((row) =>
      columns_visible.map((col) => `"${row[col] ?? ''}"`).join(',')
    )
    const csv = [header, ...csvRows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No data
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="pl-7 h-7 text-xs"
          />
        </div>
        <Button variant="ghost" size="icon-sm" onClick={exportCsv} title="Export CSV">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-1">
        <Table>
          <TableHeader>
            <TableRow>
              {columns_visible.map((col, i) => (
                <TableHead
                  key={i}
                  className="text-xs cursor-pointer select-none"
                  onClick={() => {
                    if (sortColumn === i) {
                      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
                    } else {
                      setSortColumn(i)
                      setSortDir('asc')
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col}
                    <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.map((row, i) => (
              <TableRow key={i}>
                {columns_visible.map((col, ci) => {
                  const val = row[col]
                  const isNegative = typeof val === 'number' && val < 0
                  return (
                    <TableCell
                      key={ci}
                      className={cn(
                        'text-xs py-1.5',
                        isNegative && 'text-red-600',
                        typeof val === 'number' && 'text-right font-mono tabular-nums'
                      )}
                    >
                      {typeof val === 'number' ? val.toLocaleString() : (val ?? '-')}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t text-xs text-muted-foreground">
          <span>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
