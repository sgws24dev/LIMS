import { useState, useEffect, useCallback, type JSX } from 'react'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/components/ui/button'
import { getFinancialDashboard, type FinancialDashboardDto } from '@/services/api/billing'

export default function FinancialDashboardPage() {
  const [data, setData] = useState<FinancialDashboardDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getFinancialDashboard())
    } catch {
      setError('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return (
    <PageContainer title="Financial Dashboard" status={loading ? 'loading' : error ? 'error' : data ? 'success' : 'empty'} onRetry={fetch}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Financial Dashboard</h1>
          <Button onClick={fetch} variant="outline" size="sm">Refresh</Button>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-4 gap-4">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
                <div className="text-2xl font-bold">{data.totalRevenueMonth.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Outstanding Receivables</div>
                <div className="text-2xl font-bold text-amber-600">{data.outstandingReceivables.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Overdue Amount</div>
                <div className="text-2xl font-bold text-red-600">{data.overdueAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
              </div>
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Avg Days to Pay</div>
                <div className="text-2xl font-bold">{data.avgDaysToPay.toFixed(1)} days</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Revenue by Month</h3>
                <div className="space-y-2">
                  {data.revenueByMonth.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
                  {data.revenueByMonth.map((m) => (
                    <div key={m.month} className="flex items-center gap-2 text-sm">
                      <span className="w-20">{m.month}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-blue-500 rounded" style={{ width: `${Math.min(100, (m.currentYear / (data.totalRevenueMonth || 1)) * 100)}%` }} />
                      </div>
                      <span className="w-24 text-right">{m.currentYear.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Revenue by Category</h3>
                <div className="space-y-2">
                  {data.revenueByCategory.length === 0 && <p className="text-sm text-muted-foreground">No data</p>}
                  {data.revenueByCategory.map((c) => (
                    <div key={c.category} className="flex items-center gap-2 text-sm">
                      <span className="w-32">{c.category}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-green-500 rounded" style={{ width: `${Math.min(100, (c.amount / (data.totalRevenueMonth || 1)) * 100)}%` }} />
                      </div>
                      <span className="w-24 text-right">{c.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Outstanding by Aging</h3>
                <div className="space-y-2">
                  {data.outstandingByAging.map((a) => (
                    <div key={a.bucket} className="flex items-center gap-2 text-sm">
                      <span className="w-24">{a.bucket}</span>
                      <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                        <div className="h-full bg-red-400 rounded" style={{ width: `${Math.min(100, (a.amount / (data.outstandingReceivables || 1)) * 100)}%` }} />
                      </div>
                      <span className="w-24 text-right">{a.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-3">Recent Transactions</h3>
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {data.recentTransactions.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                      <span className="font-mono text-xs">{inv.invoiceNumber}</span>
                      <span className="text-muted-foreground">{inv.billToName}</span>
                      <span>{inv.totalAmount.toLocaleString('en-US', { style: 'currency', currency: inv.currency || 'USD' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/billing/invoices/new'}>
                Create Invoice
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/billing/erp-sync'}>
                View ERP Sync Status
              </Button>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  )
}
