import { useState, useEffect, useCallback } from 'react'
import { PageContainer } from '@/shared/shared/page-container'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { DataTable } from '@/shared/ui/data-table'
import { getAssetDepreciationReport, getAssetValuationReport, type AssetDepreciationReportDto, type AssetValuationReportDto } from '@/services/api/billing'

export default function DepreciationReportsPage() {
  const [depreciation, setDepreciation] = useState<AssetDepreciationReportDto | null>(null)
  const [valuation, setValuation] = useState<AssetValuationReportDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showValuation, setShowValuation] = useState(false)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dep, val] = await Promise.all([
        getAssetDepreciationReport({
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          assetCategory: categoryFilter || undefined,
        }),
        getAssetValuationReport(),
      ])
      setDepreciation(dep)
      setValuation(val)
    } catch {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, categoryFilter])

  useEffect(() => { fetch() }, [fetch])

  const depreciationColumns = [
    { id: 'category', header: 'Category', accessorKey: 'category' },
    { id: 'totalValue', header: 'Total Value', accessorKey: 'totalValue', cell: (r: any) => r.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
    { id: 'accumulatedDepreciation', header: 'Accum. Depreciation', accessorKey: 'accumulatedDepreciation', cell: (r: any) => r.accumulatedDepreciation.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
    { id: 'netBookValue', header: 'Net Book Value', accessorKey: 'netBookValue', cell: (r: any) => r.netBookValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
  ]

  const valuationColumns = [
    { id: 'location', header: 'Location', accessorKey: 'location' },
    { id: 'replacementValue', header: 'Replacement Value', accessorKey: 'replacementValue', cell: (r: any) => r.replacementValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
    { id: 'insuredValue', header: 'Insured Value', accessorKey: 'insuredValue', cell: (r: any) => r.insuredValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
    { id: 'writtenDownValue', header: 'Written-Down Value', accessorKey: 'writtenDownValue', cell: (r: any) => r.writtenDownValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) },
  ]

  return (
    <PageContainer title="Asset Depreciation Reports" status={loading ? 'loading' : error ? 'error' : depreciation ? 'success' : 'empty'} onRetry={fetch}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Asset Depreciation Reports</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowValuation(!showValuation)}>
              {showValuation ? 'Show Depreciation' : 'Show Valuation'}
            </Button>
            <Button variant="outline" size="sm" onClick={fetch}>Refresh</Button>
          </div>
        </div>

        {!showValuation && depreciation && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Asset Value</div>
                <div className="text-2xl font-bold">{depreciation.totalAssetValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Accumulated Depreciation</div>
                <div className="text-2xl font-bold text-amber-600">{depreciation.accumulatedDepreciation.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Net Book Value</div>
                <div className="text-2xl font-bold text-green-600">{depreciation.netBookValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="max-w-[160px]" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="max-w-[160px]" />
              <Input placeholder="Category filter..." value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="max-w-[160px]" />
            </div>

            <div className="border rounded-md p-4">
              <h3 className="font-medium mb-3">Net Book Value by Category</h3>
              <div className="space-y-2">
                {depreciation.byCategory.length === 0 && <p className="text-sm text-muted-foreground">No data available</p>}
                {depreciation.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center gap-2 text-sm">
                    <span className="w-32">{c.category}</span>
                    <div className="flex-1 h-5 bg-muted rounded overflow-hidden flex">
                      <div className="h-full bg-blue-500 rounded-l" style={{ width: `${c.netBookValue > 0 ? (c.netBookValue / (depreciation.totalAssetValue || 1)) * 100 : 0}%` }} title="Net Book Value" />
                      <div className="h-full bg-red-300 rounded-r" style={{ width: `${c.accumulatedDepreciation > 0 ? (c.accumulatedDepreciation / (depreciation.totalAssetValue || 1)) * 100 : 0}%` }} title="Accumulated Depreciation" />
                    </div>
                    <span className="w-24 text-right text-xs">{c.netBookValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                  </div>
                ))}
              </div>
            </div>

            <DataTable columns={depreciationColumns} data={depreciation.byCategory} />

            {depreciation.monthlyTrends.length > 0 && (
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Monthly Depreciation Trends</h3>
                <div className="space-y-1">
                  {depreciation.monthlyTrends.map((t) => (
                    <div key={t.month} className="flex items-center gap-2 text-sm">
                      <span className="w-20">{t.month}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-purple-500 rounded" style={{ width: `${Math.min(100, (t.depreciationAmount / (depreciation.accumulatedDepreciation || 1)) * 100)}%` }} />
                      </div>
                      <span className="w-24 text-right">{t.depreciationAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {showValuation && valuation && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Replacement Value</div>
                <div className="text-2xl font-bold">{valuation.totalReplacementValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Insured Value</div>
                <div className="text-2xl font-bold text-blue-600">{valuation.totalInsuredValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Written-Down Value</div>
                <div className="text-2xl font-bold text-green-600">{valuation.totalWrittenDownValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
            </div>

            <DataTable columns={valuationColumns} data={valuation.byLocation} />
          </>
        )}
      </div>
    </PageContainer>
  )
}
