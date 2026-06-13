"use client"

import {
  useState,
  useMemo,
  useCallback,
  useRef,
  type HTMLAttributes,
  type ReactNode,
  type ChangeEvent,
  type DragEvent,
} from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns3,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Badge } from "@/shared/ui/badge"

export interface ColumnDef<T> {
  id: string
  header: string
  accessorKey?: keyof T | string
  cell?: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  className?: string
  headerClassName?: string
  width?: string
  minWidth?: string
  enableHiding?: boolean
}

export interface DataTableProps<T> extends HTMLAttributes<HTMLDivElement> {
  columns: ColumnDef<T>[]
  data: T[]
  pageSize?: number
  pageSizeOptions?: number[]
  selectable?: boolean
  onRowClick?: (row: T) => void
  onSelectedRowsChange?: (rows: T[]) => void
  getRowId?: (row: T) => string | number
  isLoading?: boolean
  filterPlaceholder?: string
  emptyMessage?: string
  exportable?: boolean
  exportFilename?: string
  exportColumns?: { key: string; label: string }[]
  onExportCSV?: () => void
  showColumnVisibility?: boolean
  resizableColumns?: boolean
  toolbar?: ReactNode
}

function DataTable<T>({
  columns,
  data,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  selectable = false,
  onRowClick,
  onSelectedRowsChange,
  getRowId = (row: T) => (row as any).id,
  isLoading,
  filterPlaceholder = "Filter...",
  emptyMessage = "No results found.",
  exportable = false,
  exportFilename = "export",
  exportColumns,
  onExportCSV,
  showColumnVisibility = false,
  resizableColumns = false,
  toolbar,
  className,
  ...props
}: DataTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.id))
  )
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const resizeRef = useRef<{ columnId: string; startX: number; startWidth: number } | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [globalFilter, setGlobalFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSizeState, setPageSizeState] = useState(pageSize)
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set()
  )

  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }
  }

  const filteredData = useMemo(() => {
    if (!globalFilter) return data
    const lowerFilter = globalFilter.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => {
        const value = col.accessorKey ? (row as any)[col.accessorKey] : undefined
        if (value == null) return false
        return String(value).toLowerCase().includes(lowerFilter)
      })
    )
  }, [data, globalFilter, columns])

  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal == null || bVal == null) return 0
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSizeState))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedData = sortedData.slice(
    (safeCurrentPage - 1) * pageSizeState,
    safeCurrentPage * pageSizeState
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const ids = paginatedData.map((row) => getRowId(row))
      setSelectedRows((prev) => {
        const next = new Set(prev)
        ids.forEach((id) => next.add(id))
        onSelectedRowsChange?.(
          data.filter((r) => next.has(getRowId(r)))
        )
        return next
      })
    } else {
      setSelectedRows((prev) => {
        const next = new Set(prev)
        paginatedData.forEach((row) => next.delete(getRowId(row)))
        onSelectedRowsChange?.(
          data.filter((r) => next.has(getRowId(r)))
        )
        return next
      })
    }
  }

  const handleSelectRow = (id: string | number, checked: boolean) => {
    setSelectedRows((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      onSelectedRowsChange?.(
        data.filter((r) => next.has(getRowId(r)))
      )
      return next
    })
  }

  const allPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.has(getRowId(row)))
  const somePageSelected =
    paginatedData.some((row) => selectedRows.has(getRowId(row))) &&
    !allPageSelected

  const visibleColumnsList = useMemo(
    () => columns.filter((col) => visibleColumns.has(col.id)),
    [columns, visibleColumns]
  )

  const handleExportCSV = useCallback(() => {
    if (onExportCSV) {
      onExportCSV()
      return
    }
    const cols = exportColumns ?? visibleColumnsList.map((c) => ({ key: c.accessorKey as string || c.id, label: c.header }))
    const header = cols.map((c) => c.label).join(",")
    const rows = data.map((row) =>
      cols
        .map((c) => {
          const val = (row as any)[c.key]
          const str = val == null ? "" : String(val)
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(",")
    )
    const csv = [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${exportFilename}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [data, exportColumns, exportFilename, onExportCSV, visibleColumnsList])

  const handleResizeStart = (columnId: string, e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const startX = e.clientX
    const currentWidth = columnWidths[columnId] || 150
    resizeRef.current = { columnId, startX, startWidth: currentWidth }

    const handleMouseMove = (me: MouseEvent) => {
      if (!resizeRef.current) return
      const diff = me.clientX - resizeRef.current.startX
      const newWidth = Math.max(50, resizeRef.current.startWidth + diff)
      setColumnWidths((prev) => ({ ...prev, [columnId]: newWidth }))
    }

    const handleMouseUp = () => {
      resizeRef.current = null
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const getSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return <ChevronsUpDown className="h-3 w-3" />
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    )
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center gap-2">
        {columns.some((c) => c.filterable !== false) && (
          <Input
            placeholder={filterPlaceholder}
            value={globalFilter}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setGlobalFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="max-w-xs"
          />
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {toolbar}
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          )}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="mr-1.5 h-3.5 w-3.5" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {columns.map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={visibleColumns.has(col.id)}
                    onCheckedChange={(checked) => {
                      setVisibleColumns((prev) => {
                        const next = new Set(prev)
                        if (checked) {
                          next.add(col.id)
                        } else {
                          next.delete(col.id)
                        }
                        return next
                      })
                    }}
                    disabled={col.enableHiding === false}
                  >
                    {col.header}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={allPageSelected}
                    data-state={
                      somePageSelected ? "indeterminate" : undefined
                    }
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {visibleColumnsList.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(
                    col.sortable !== false && "cursor-pointer select-none",
                    col.headerClassName,
                    "relative"
                  )}
                  style={{
                    width: columnWidths[col.id] ? `${columnWidths[col.id]}px` : col.width,
                    minWidth: col.minWidth,
                  }}
                  onClick={() => col.sortable !== false && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable !== false && getSortIcon(col.id)}
                  </div>
                  {resizableColumns && (
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-border"
                      onMouseDown={(e) => handleResizeStart(col.id, e as unknown as DragEvent<HTMLDivElement>)}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {selectable && <TableCell className="w-[40px]" />}
                  {visibleColumnsList.map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumnsList.length + (selectable ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => {
                const rowId = getRowId(row)
                return (
                  <TableRow
                    key={rowId}
                    data-state={
                      selectedRows.has(rowId) ? "selected" : undefined
                    }
                    onClick={() => onRowClick?.(row)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {selectable && (
                      <TableCell className="w-[40px]">
                        <Checkbox
                          checked={selectedRows.has(rowId)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(rowId, !!checked)
                          }
                          aria-label={`Select row ${rowId}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}
                    {visibleColumnsList.map((col) => (
                      <TableCell key={col.id} className={col.className}>
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                            ? ((row as any)[col.accessorKey] as ReactNode)
                            : null}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground/60">
            {sortedData.length} result{sortedData.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
              <span>Rows</span>
              <Select
                value={String(pageSizeState)}
                onValueChange={(value) => {
                  setPageSizeState(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-7 w-[60px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={String(opt)}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="text-xs text-muted-foreground/60">
              Page {safeCurrentPage} of {totalPages}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={safeCurrentPage === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { DataTable }
