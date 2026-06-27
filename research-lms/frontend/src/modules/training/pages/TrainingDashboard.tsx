import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DataTable } from '@/shared/ui/data-table'
import { PageContainer } from '@/shared/shared/page-container'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCompetencies, getUserCompetencies, type CompetencyDto, type UserCompetencyDto, type CompetencyCategory } from '@/services/api/training'

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Operational', label: 'Operational' },
]

export default function TrainingDashboard() {
  const navigate = useNavigate()
  const [competencies, setCompetencies] = useState<CompetencyDto[]>([])
  const [userCompetencies, setUserCompetencies] = useState<UserCompetencyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [compResult, ucResult] = await Promise.all([
        getCompetencies(categoryFilter ? (categoryFilter as CompetencyCategory) : undefined),
        getUserCompetencies(),
      ])
      setCompetencies(compResult.items)
      setUserCompetencies(ucResult.items)
    } catch {
      setError('Failed to load training data')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const activeCount = userCompetencies.filter(uc => uc.status === 'Active').length
  const expiringCount = userCompetencies.filter(uc => uc.expiresAt && new Date(uc.expiresAt) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && new Date(uc.expiresAt) > new Date()).length
  const expiredCount = userCompetencies.filter(uc => uc.status === 'Expired').length

  const chartData = [
    { name: 'Active', count: activeCount, fill: '#22c55e' },
    { name: 'Expiring Soon', count: expiringCount, fill: '#eab308' },
    { name: 'Expired', count: expiredCount, fill: '#ef4444' },
  ]

  const filteredCompetencies = competencies.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { id: 'name', header: 'Name', accessorKey: 'name' as const, cell: (row: CompetencyDto) => (
      <span className="font-medium">{row.name}</span>
    )},
    { id: 'category', header: 'Category', accessorKey: 'category' as const },
    { id: 'validityPeriodDays', header: 'Validity (Days)', accessorKey: 'validityPeriodDays' as const },
    { id: 'requiresRenewal', header: 'Requires Renewal', accessorKey: 'requiresRenewal' as const, cell: (row: CompetencyDto) => row.requiresRenewal ? 'Yes' : 'No' },
    { id: 'createdAt', header: 'Created', accessorKey: 'createdAt' as const, cell: (row: CompetencyDto) => new Date(row.createdAt).toLocaleDateString() },
  ]

  return (
    <PageContainer title="Training Dashboard" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Training Dashboard</h1>
          <Button onClick={() => navigate('/training/matrix')}>
            <BarChart3 className="h-4 w-4 mr-2" />Competency Matrix
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Competencies</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <p className="text-xs text-muted-foreground">Currently valid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{expiringCount}</div>
              <p className="text-xs text-muted-foreground">Within 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{expiredCount}</div>
              <p className="text-xs text-muted-foreground">Requires renewal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Competencies by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Competency Definitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Search competencies..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1" />
                  <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <DataTable columns={columns} data={filteredCompetencies} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
