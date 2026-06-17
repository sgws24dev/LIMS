import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { StatCard } from '@/shared/ui/stat-card'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { getProjectDashboardStats, getBudgetChart, createProject, type ProjectDashboardStatsDto, type MonthlyBudgetDataPoint } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { Plus, TrendingUp, AlertTriangle } from 'lucide-react'

export default function ProjectsDashboardPage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [stats, setStats] = useState<ProjectDashboardStatsDto | null>(null)
  const [chartData, setChartData] = useState<MonthlyBudgetDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [monthsBack, setMonthsBack] = useState(6)
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, c] = await Promise.all([
        getProjectDashboardStats(),
        getBudgetChart(monthsBack),
      ])
      setStats(s)
      setChartData(c)
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [monthsBack])

  useEffect(() => {
    setBreadcrumbs([{ label: 'Projects' }, { label: 'Dashboard' }])
    fetchData()
  }, [fetchData, setBreadcrumbs])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const form = new FormData(e.currentTarget)
    try {
      const id = await createProject({
        name: form.get('name') as string,
        description: form.get('description') as string || undefined,
        priority: (form.get('priority') as string) as any || 'Medium',
        budget: Number(form.get('budget')) || 0,
        startDate: (form.get('startDate') as string) || undefined,
        endDate: (form.get('endDate') as string) || undefined,
        projectManagerName: (form.get('projectManagerName') as string) || undefined,
      })
      toast({ title: 'Project created', variant: 'success' })
      setShowCreate(false)
      navigate(`/projects/${id}`)
    } catch {
      toast({ title: 'Failed to create project', variant: 'destructive' })
    } finally {
      setCreating(false)
    }
  }

  return (
    <PageContainer
      title="Projects Dashboard"
      description="Overview of all research projects"
      status={error ? 'error' : loading ? 'loading' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetchData}
      actions={
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Project
        </Button>
      }
    >
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Active Projects"
            value={stats.totalActive}
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
            className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          />
          <StatCard
            label="On Hold"
            value={stats.totalOnHold}
            className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          />
          <StatCard
            label="Overdue"
            value={stats.overdueCount}
            icon={stats.overdueCount > 0 ? <AlertTriangle className="h-5 w-5 text-red-600" /> : undefined}
            className={stats.overdueCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
          />
          <StatCard
            label="Over Budget"
            value={stats.overBudgetCount}
            className={stats.overBudgetCount > 0 ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''}
          />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Monthly Budget vs Actual</h3>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden text-xs">
              {[3, 6, 12].map((n) => (
                <button
                  key={n}
                  className={`px-3 py-1 ${monthsBack === n ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setMonthsBack(n)}
                >
                  {n}m
                </button>
              ))}
            </div>
            <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden text-xs">
              <button
                className={`px-3 py-1 ${chartType === 'area' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setChartType('area')}
              >
                Area
              </button>
              <button
                className={`px-3 py-1 ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setChartType('bar')}
              >
                Bar
              </button>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="budget" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} name="Budget" />
                <Area type="monotone" dataKey="actual" stroke="#f97316" fill="#f97316" fillOpacity={0.1} name="Actual" />
              </AreaChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="budget" fill="#3b82f6" name="Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="#f97316" name="Actual" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => navigate('/projects/list')}>
          View All Projects
        </Button>
        <Button variant="outline" onClick={() => navigate('/projects/cost-centers')}>
          Cost Centers
        </Button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" name="name" required maxLength={300} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select name="priority" defaultValue="Medium">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input id="budget" name="budget" type="number" min="0" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" name="startDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" name="endDate" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="projectManagerName">Project Manager</Label>
                <Input id="projectManagerName" name="projectManagerName" maxLength={200} />
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
