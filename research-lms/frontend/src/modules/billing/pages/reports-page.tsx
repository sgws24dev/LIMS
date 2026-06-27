import { useState, useEffect, useCallback } from 'react'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import {
  getReportDefinitions,
  getReportDefinitionById,
  createReportDefinition,
  updateReportDefinition,
  deleteReportDefinition,
  previewReport,
  runReport,
  exportReport,
  type ReportDefinitionDto,
  type ReportPreviewDto,
  type ReportResultDto,
} from '@/services/api/billing'
import ReportScheduleDialog from '@/modules/billing/components/ReportScheduleDialog'
import { FileText, Plus, Trash2, Eye, Download, ChevronLeft, ChevronRight, Play, Save, Clock } from 'lucide-react'

const ENTITY_FIELDS: Record<string, { value: string; label: string; type: string }[]> = {
  Invoice: [
    { value: 'Id', label: 'ID', type: 'string' },
    { value: 'InvoiceNumber', label: 'Invoice Number', type: 'string' },
    { value: 'Status', label: 'Status', type: 'string' },
    { value: 'BilledToEntityType', label: 'Entity Type', type: 'string' },
    { value: 'BillToName', label: 'Bill To Name', type: 'string' },
    { value: 'Currency', label: 'Currency', type: 'string' },
    { value: 'Subtotal', label: 'Subtotal', type: 'number' },
    { value: 'DiscountAmount', label: 'Discount Amount', type: 'number' },
    { value: 'TaxAmount', label: 'Tax Amount', type: 'number' },
    { value: 'TotalAmount', label: 'Total Amount', type: 'number' },
    { value: 'AmountPaid', label: 'Amount Paid', type: 'number' },
    { value: 'BalanceDue', label: 'Balance Due', type: 'number' },
    { value: 'InvoiceDate', label: 'Invoice Date', type: 'date' },
    { value: 'DueDate', label: 'Due Date', type: 'date' },
    { value: 'CreatedAt', label: 'Created At', type: 'date' },
  ],
  InvoiceLineItem: [
    { value: 'Id', label: 'ID', type: 'string' },
    { value: 'Description', label: 'Description', type: 'string' },
    { value: 'Quantity', label: 'Quantity', type: 'number' },
    { value: 'UnitPrice', label: 'Unit Price', type: 'number' },
    { value: 'DiscountPercent', label: 'Discount %', type: 'number' },
    { value: 'TaxRate', label: 'Tax Rate', type: 'number' },
    { value: 'LineTotal', label: 'Line Total', type: 'number' },
    { value: 'InvoiceId', label: 'Invoice ID', type: 'string' },
  ],
}

const FILTER_OPERATORS = [
  { value: 'Equals', label: 'Equals' },
  { value: 'NotEquals', label: 'Not Equals' },
  { value: 'GreaterThan', label: 'Greater Than' },
  { value: 'GreaterThanOrEqual', label: 'Greater Than Or Equal' },
  { value: 'LessThan', label: 'Less Than' },
  { value: 'LessThanOrEqual', label: 'Less Than Or Equal' },
  { value: 'Contains', label: 'Contains' },
  { value: 'StartsWith', label: 'Starts With' },
  { value: 'EndsWith', label: 'Ends With' },
]

interface FilterRow {
  field: string
  operator: string
  value: string
}

function buildFiltersJson(filters: FilterRow[]): string {
  return JSON.stringify(filters.filter(f => f.field && f.value))
}

export default function ReportsPage() {
  const [definitions, setDefinitions] = useState<ReportDefinitionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sourceEntity, setSourceEntity] = useState('Invoice')
  const [selectedFields, setSelectedFields] = useState<string[]>([])
  const [filters, setFilters] = useState<FilterRow[]>([])

  const [preview, setPreview] = useState<ReportPreviewDto | null>(null)
  const [results, setResults] = useState<ReportResultDto | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [resultsPage, setResultsPage] = useState(1)
  const [resultsPageSize] = useState(20)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDefinitions(await getReportDefinitions())
    } catch {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const availableFields = ENTITY_FIELDS[sourceEntity] ?? []

  const handleSelectDefinition = async (id: string) => {
    setSelectedId(id)
    setPreview(null)
    setResults(null)
    try {
      const dto = await getReportDefinitionById(id)
      setName(dto.name)
      setDescription(dto.description ?? '')
      setSourceEntity(dto.sourceEntity)
      setSelectedFields(JSON.parse(dto.fieldsJson) as string[])
      setFilters(JSON.parse(dto.filtersJson) as FilterRow[])
      setIsEditing(true)
    } catch {
      setError('Failed to load report definition')
    }
  }

  const handleNew = () => {
    setSelectedId(null)
    setName('')
    setDescription('')
    setSourceEntity('Invoice')
    setSelectedFields([])
    setFilters([])
    setPreview(null)
    setResults(null)
    setIsEditing(false)
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim() || selectedFields.length === 0) return
    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        sourceEntity,
        fieldsJson: JSON.stringify(selectedFields),
        filtersJson: buildFiltersJson(filters),
      }
      if (isEditing && selectedId) {
        await updateReportDefinition(selectedId, { id: selectedId, ...payload })
      } else {
        await createReportDefinition(payload)
      }
      setEditDialogOpen(false)
      await fetch()
    } catch {
      setError('Failed to save report')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReportDefinition(id)
      if (selectedId === id) {
        setSelectedId(null)
        setPreview(null)
        setResults(null)
      }
      await fetch()
    } catch {
      setError('Failed to delete report')
    }
  }

  const handlePreview = async () => {
    if (!selectedId) return
    setPreviewLoading(true)
    setResults(null)
    try {
      setPreview(await previewReport(selectedId))
    } catch {
      setError('Failed to preview report')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleRunReport = async (page = 1) => {
    if (!selectedId) return
    setResultsLoading(true)
    setPreview(null)
    try {
      const result = await runReport(selectedId, page, resultsPageSize)
      setResults(result)
      setResultsPage(page)
    } catch {
      setError('Failed to run report')
    } finally {
      setResultsLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'xlsx') => {
    if (!selectedId) return
    try {
      const blob = await exportReport(selectedId, format)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report.${format === 'xlsx' ? 'xlsx' : format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Failed to export report')
    }
  }

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    )
  }

  const addFilter = () => {
    setFilters(prev => [...prev, { field: '', operator: 'Equals', value: '' }])
  }

  const updateFilter = (index: number, key: keyof FilterRow, value: string) => {
    setFilters(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index))
  }

  const displayColumns = preview?.columns ?? results?.columns ?? []
  const displayRows = preview?.rows ?? results?.rows ?? []
  const totalCount = preview?.totalCount ?? results?.totalCount ?? 0

  const selectedDefinition = definitions.find(d => d.id === selectedId)

  return (
    <PageContainer
      title="Reports"
      description="Create and manage ad-hoc report definitions"
      status={loading ? 'loading' : error ? 'error' : definitions.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetch}
      actions={
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1.5" />
          New Report
        </Button>
      }
      emptyIcon={<FileText className="h-12 w-12 text-muted-foreground" />}
      emptyTitle="No reports yet"
      emptyDescription="Create your first ad-hoc report definition."
      emptyAction={
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-1.5" />
          Create Report
        </Button>
      }
    >
      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        <Card className="w-72 shrink-0 overflow-auto">
          <CardHeader>
            <CardTitle className="text-sm">Saved Reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-2">
            {definitions.map(d => (
              <div
                key={d.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors ${
                  selectedId === d.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-accent/50 text-foreground/80'
                }`}
                onClick={() => handleSelectDefinition(d.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{d.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); handleDelete(d.id) }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex-1 min-w-0">
          {selectedDefinition ? (
            <Tabs defaultValue="definition" className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="definition">Definition</TabsTrigger>
                <TabsTrigger value="results" onClick={() => !results && handleRunReport()}>Results</TabsTrigger>
              </TabsList>

              <TabsContent value="definition" className="flex-1 overflow-auto space-y-4">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div>
                        <Label>Source Entity</Label>
                        <Select value={sourceEntity} onValueChange={setSourceEntity}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Invoice">Invoice</SelectItem>
                            <SelectItem value="InvoiceLineItem">Invoice Line Item</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Fields</CardTitle>
                    <CardDescription>Select the fields to include in the report</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {availableFields.map(f => (
                        <Button
                          key={f.value}
                          variant={selectedFields.includes(f.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleField(f.value)}
                        >
                          {f.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Filters</CardTitle>
                        <CardDescription>Add conditions to filter the data</CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={addFilter}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Filter
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {filters.length === 0 && (
                      <p className="text-sm text-muted-foreground">No filters applied</p>
                    )}
                    {filters.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Select value={f.field} onValueChange={v => updateFilter(i, 'field', v)}>
                          <SelectTrigger className="w-40"><SelectValue placeholder="Field" /></SelectTrigger>
                          <SelectContent>
                            {availableFields.map(af => (
                              <SelectItem key={af.value} value={af.value}>{af.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={f.operator} onValueChange={v => updateFilter(i, 'operator', v)}>
                          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {FILTER_OPERATORS.map(op => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          value={f.value}
                          onChange={e => updateFilter(i, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon-sm" onClick={() => removeFilter(i)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2 pb-4">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={handlePreview} disabled={previewLoading}>
                    <Eye className="h-4 w-4 mr-1.5" />
                    {previewLoading ? 'Loading...' : 'Preview'}
                  </Button>
                  <Button variant="outline" onClick={() => setScheduleDialogOpen(true)}>
                    <Clock className="h-4 w-4 mr-1.5" />
                    Schedule
                  </Button>
                </div>

                {preview && displayColumns.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Preview ({totalCount} rows)</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-auto max-h-96">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {displayColumns.map(col => (
                              <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayRows.slice(0, 10).map((row, i) => (
                            <TableRow key={i}>
                              {displayColumns.map(col => (
                                <TableCell key={col} className="text-xs">{String(row[col] ?? '')}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="results" className="flex-1 overflow-auto">
                {resultsLoading ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">Loading...</div>
                ) : displayColumns.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{totalCount} rows</span>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          PDF
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport('xlsx')}>
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Excel
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-card shadow-card overflow-auto max-h-[calc(100vh-24rem)]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {displayColumns.map(col => (
                              <TableHead key={col} className="text-xs whitespace-nowrap">{col}</TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayRows.map((row, i) => (
                            <TableRow key={i}>
                              {displayColumns.map(col => (
                                <TableCell key={col} className="text-xs">{String(row[col] ?? '')}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {results && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Page {resultsPage} of {Math.ceil(totalCount / resultsPageSize)}</span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resultsPage <= 1}
                            onClick={() => handleRunReport(resultsPage - 1)}
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resultsPage * resultsPageSize >= totalCount}
                            onClick={() => handleRunReport(resultsPage + 1)}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <Button onClick={() => handleRunReport()}>
                      <Play className="h-4 w-4 mr-1.5" />
                      Run Report
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a report from the left, or create a new one
            </div>
          )}
        </div>
      </div>

      <ReportScheduleDialog
        reportDefinitionId={selectedId ?? ''}
        reportDefinitionName={name}
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit' : 'New'} Report</DialogTitle>
            <DialogDescription>Define the report name, source, fields, and filters</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Report name" />
              </div>
              <div>
                <Label>Source Entity</Label>
                <Select value={sourceEntity} onValueChange={setSourceEntity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Invoice">Invoice</SelectItem>
                    <SelectItem value="InvoiceLineItem">Invoice Line Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <Label className="mb-1 block">Fields</Label>
              <div className="flex flex-wrap gap-1.5">
                {availableFields.map(f => (
                  <Button
                    key={f.value}
                    variant={selectedFields.includes(f.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleField(f.value)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Filters</Label>
                <Button variant="outline" size="sm" onClick={addFilter}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {filters.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Select value={f.field} onValueChange={v => updateFilter(i, 'field', v)}>
                      <SelectTrigger className="w-36"><SelectValue placeholder="Field" /></SelectTrigger>
                      <SelectContent>
                        {availableFields.map(af => (
                          <SelectItem key={af.value} value={af.value}>{af.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={f.operator} onValueChange={v => updateFilter(i, 'operator', v)}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {FILTER_OPERATORS.map(op => (
                          <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                    <Button variant="ghost" size="icon-sm" onClick={() => removeFilter(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || selectedFields.length === 0}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
