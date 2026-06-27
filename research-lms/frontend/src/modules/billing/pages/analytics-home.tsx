import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { BarChart3, Plus, Copy, Trash2 } from 'lucide-react'
import {
  getDashboards,
  deleteDashboard,
  cloneDashboard,
  createDashboard,
  type DashboardDefinitionDto,
} from '@/services/api/billing'

export default function AnalyticsHomePage() {
  const navigate = useNavigate()
  const [dashboards, setDashboards] = useState<DashboardDefinitionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDashboards(await getDashboards())
    } catch {
      setError('Failed to load dashboards')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const result = await createDashboard({
        name: newName.trim(),
        layout: JSON.stringify({ widgets: [] }),
        isDefault: false,
        widgets: [],
      })
      setNewName('')
      navigate(`/billing/analytics/${result.id}`)
    } catch {
      setError('Failed to create dashboard')
    } finally {
      setCreating(false)
    }
  }

  const handleClone = async (id: string, name: string) => {
    try {
      const result = await cloneDashboard(id, `${name} (Copy)`)
      await fetch()
      navigate(`/billing/analytics/${result.id}`)
    } catch {
      setError('Failed to clone dashboard')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDashboard(id)
      await fetch()
    } catch {
      setError('Failed to delete dashboard')
    }
  }

  const actions = (
    <div className="flex gap-2">
      <Input
        placeholder="New dashboard name..."
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        className="w-64"
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
      />
      <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
        <Plus className="h-4 w-4" />
        Create
      </Button>
    </div>
  )

  return (
    <PageContainer
      title="Dashboards"
      description="Create and manage your analytics dashboards"
      status={loading ? 'loading' : error ? 'error' : dashboards.length === 0 ? 'empty' : 'success'}
      errorMessage={error ?? undefined}
      onRetry={fetch}
      actions={actions}
      emptyIcon={<BarChart3 className="h-12 w-12 text-muted-foreground" />}
      emptyTitle="No dashboards yet"
      emptyDescription="Create your first dashboard to start visualizing your data."
      emptyAction={
        <div className="flex gap-2">
          <Input
            placeholder="Dashboard name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-64"
          />
          <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
            <Plus className="h-4 w-4" />
            Create Dashboard
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboards.map((d) => (
          <Card
            key={d.id}
            className="cursor-pointer hover:border-primary transition-all"
            onClick={() => navigate(`/billing/analytics/${d.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{d.name}</CardTitle>
                  {d.description && (
                    <CardDescription className="mt-1">{d.description}</CardDescription>
                  )}
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{d.widgets.length} widget{d.widgets.length !== 1 ? 's' : ''}</span>
                <span>{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex gap-1 mt-3" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleClone(d.id, d.name)}
                  title="Clone"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(d.id)}
                  title="Delete"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
