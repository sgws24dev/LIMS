import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { PageContainer } from '@/shared/shared/page-container'
import { getCompetencies, getUserCompetencies, assignCompetency, type CompetencyDto, type UserCompetencyDto, type CompetencyStatus } from '@/services/api/training'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Safety', label: 'Safety' },
  { value: 'Technical', label: 'Technical' },
  { value: 'Operational', label: 'Operational' },
]

function getStatusColor(status: CompetencyStatus | 'Expiring'): string {
  switch (status) {
    case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'Expiring': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'Expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'Revoked': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function CompetencyMatrix() {
  const navigate = useNavigate()
  const [competencies, setCompetencies] = useState<CompetencyDto[]>([])
  const [userCompetencies, setUserCompetencies] = useState<UserCompetencyDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [compResult, ucResult] = await Promise.all([
        getCompetencies(),
        getUserCompetencies(),
      ])
      setCompetencies(compResult.items)
      setUserCompetencies(ucResult.items)
    } catch {
      setError('Failed to load competency data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const userIds = [...new Set(userCompetencies.map(uc => uc.userId))]
  const filteredCompetencies = competencies.filter(c => !categoryFilter || c.category === categoryFilter)

  const getUserStatus = (userId: string, competencyId: string): CompetencyStatus | 'Expiring' | 'Unassigned' => {
    const uc = userCompetencies.find(u => u.userId === userId && u.competencyId === competencyId)
    if (!uc) return 'Unassigned'
    if (uc.status === 'Active' && uc.expiresAt) {
      const expiresAt = new Date(uc.expiresAt)
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      if (expiresAt <= in30Days && expiresAt > new Date()) return 'Expiring'
    }
    return uc.status
  }

  const handleAssign = async () => {
    if (!selectedUserId || !selectedCompetencyId) return
    try {
      await assignCompetency({
        userId: selectedUserId,
        competencyId: selectedCompetencyId,
        achievedAt: new Date().toISOString(),
        expiresAt: null,
      })
      setSelectedUserId(null)
      setSelectedCompetencyId(null)
      fetchData()
    } catch {
      // handle error
    }
  }

  return (
    <PageContainer title="Competency Matrix" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/training')}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back
            </Button>
            <h1 className="text-2xl font-semibold">Competency Matrix</h1>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">User</TableHead>
                {filteredCompetencies.map(c => (
                  <TableHead key={c.id} className="text-center min-w-[100px]">{c.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {userIds.map(userId => (
                <TableRow key={userId}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">{userId.slice(0, 8)}</TableCell>
                  {filteredCompetencies.map(comp => {
                    const status = getUserStatus(userId, comp.id)
                    const statusLabel = status === 'Unassigned' ? '—' : status
                    return (
                      <TableCell key={comp.id} className="text-center">
                        <Dialog onOpenChange={() => { setSelectedUserId(userId); setSelectedCompetencyId(comp.id) }}>
                          <DialogTrigger asChild>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium cursor-pointer ${getStatusColor(status)}`}>
                              {statusLabel}
                            </span>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Manage Competency</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                {status === 'Unassigned'
                                  ? `Assign "${comp.name}" to this user?`
                                  : `Current status: ${status}`}
                              </p>
                              {status === 'Unassigned' && (
                                <Button onClick={handleAssign}>Assign Competency</Button>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  )
}
