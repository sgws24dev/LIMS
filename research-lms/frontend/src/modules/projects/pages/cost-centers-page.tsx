import { useEffect, useState, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { BudgetProgressBar } from '../components/budget-progress-bar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getCostCenters, getCostCenterSpend, createCostCenter, updateCostCenter, type CostCenterDto, type CostCenterSpendSummaryDto } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { Plus, Pencil, Eye, DollarSign, Wallet } from 'lucide-react'

export default function CostCentersPage() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [data, setData] = useState<CostCenterDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeOnly, setActiveOnly] = useState(true)
  const [fiscalYear, setFiscalYear] = useState<number>(new Date().getFullYear())
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedCc, setSelectedCc] = useState<CostCenterSpendSummaryDto | null>(null)
  const [spendLoading, setSpendLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getCostCenters({ activeOnly, fiscalYear })
      setData(result)
    } catch {
      setError('Failed to load cost centers.')
    } finally {
      setLoading(false)
    }
  }, [activeOnly, fiscalYear])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Projects' }, { label: 'Cost Centers' }])
    fetchData()
  }, [fetchData, setBreadcrumbs])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      await createCostCenter({
        code: (form.get('code') as string).toUpperCase(),
        name: form.get('name') as string,
        description: (form.get('description') as string) || undefined,
        budgetAmount: Number(form.get('budgetAmount')) || 0,
        managerName: (form.get('managerName') as string) || undefined,
        fiscalYear: Number(form.get('fiscalYear')) || new Date().getFullYear(),
      })
      toast({ title: 'Cost center created', variant: 'success' })
      setShowCreate(false)
      fetchData()
    } catch {
      toast({ title: 'Failed to create cost center', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  const handleViewSpend = async (id: string) => {
    setSpendLoading(true)
    try {
      const detail = await getCostCenterSpend(id)
      setSelectedCc(detail)
    } catch {
      toast({ title: 'Failed to load spend details', variant: 'destructive' })
    } finally {
      setSpendLoading(false)
    }
  }

  return (
    <PageContainer
      title="Cost Centers"
      description="Manage budgets and track spending"
      status={error ? 'error' : loading ? 'loading' : data.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      emptyTitle="No cost centers found"
      emptyDescription="Create your first cost center to track budgets."
      emptyAction={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Cost Center
        </Button>
      }
      actions={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-1 cursor-pointer">
              <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)}
                className="rounded border-gray-300" />
              Active Only
            </label>
            <Input type="number" className="w-20 h-8 text-xs" value={fiscalYear}
              onChange={(e) => setFiscalYear(Number(e.target.value))} />
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {data.map((cc) => (
          <Card key={cc.id} className={`p-4 ${cc.isOverBudget ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-400" />
                  <span className="font-mono text-xs text-gray-500">{cc.code}</span>
                  {cc.isOverBudget && <Badge variant="destructive" className="text-xs">Over Budget</Badge>}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mt-1">{cc.name}</h3>
              </div>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {cc.managerName && <>Manager: {cc.managerName} · </>}
              FY {cc.fiscalYear}
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Budget:</span>
                <span className="font-medium">{formatCurrency(cc.budgetAmount)}</span>
              </div>
              <BudgetProgressBar budget={cc.budgetAmount} spent={cc.spentAmount} />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Spent: {formatCurrency(cc.spentAmount)}</span>
                <span>Remaining: {formatCurrency(cc.remainingBudget)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewSpend(cc.id)}>
                <Eye className="mr-1 h-3 w-3" /> Spend
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={!!selectedCc} onOpenChange={() => setSelectedCc(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {selectedCc && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedCc.code} — {selectedCc.name}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Budget</div>
                    <div className="font-semibold">{formatCurrency(selectedCc.budgetAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Spent</div>
                    <div className="font-semibold">{formatCurrency(selectedCc.spentAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Remaining</div>
                    <div className="font-semibold">{formatCurrency(selectedCc.remainingBudget)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Utilization</div>
                    <div className="font-semibold">{selectedCc.utilizationPercent.toFixed(1)}%</div>
                  </div>
                </div>
                <BudgetProgressBar budget={selectedCc.budgetAmount} spent={selectedCc.spentAmount} />
                <h4 className="text-sm font-semibold mt-4">Work Orders</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead className="text-right">Billed</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedCc.workOrders.map((wo) => (
                      <TableRow key={wo.workOrderId}>
                        <TableCell className="font-medium">{wo.workOrderTitle}</TableCell>
                        <TableCell>{wo.projectName}</TableCell>
                        <TableCell className="text-right">{formatCurrency(wo.billedAmount)}</TableCell>
                        <TableCell>{wo.completedAt ? formatDate(wo.completedAt) : '-'}</TableCell>
                      </TableRow>
                    ))}
                    {selectedCc.workOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-400">No work orders billed</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-end text-sm font-semibold pt-2 border-t">
                  Total Billed: {formatCurrency(selectedCc.workOrders.reduce((s, w) => s + w.billedAmount, 0))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader><DialogTitle>Create Cost Center</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="code">Code *</Label>
                <Input id="code" name="code" required maxLength={50}
                  placeholder="e.g. CC-001"
                  onChange={(e) => { e.currentTarget.value = e.currentTarget.value.toUpperCase() }} />
              </div>
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required maxLength={200} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" maxLength={1000} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budgetAmount">Budget Amount</Label>
                  <Input id="budgetAmount" name="budgetAmount" type="number" min="0" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="fiscalYear">Fiscal Year</Label>
                  <Input id="fiscalYear" name="fiscalYear" type="number" defaultValue={new Date().getFullYear()} />
                </div>
              </div>
              <div>
                <Label htmlFor="managerName">Manager</Label>
                <Input id="managerName" name="managerName" maxLength={200} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                              <Button type="submit" disabled={creating}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
