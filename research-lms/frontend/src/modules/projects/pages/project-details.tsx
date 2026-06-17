import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { ProjectStatusBadge } from '../components/project-status-badge'
import { BudgetProgressBar } from '../components/budget-progress-bar'
import { formatDate, formatCurrency } from '@/lib/utils'
import { getProjectById, updateProjectStatus, type ProjectDetailDto } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [project, setProject] = useState<ProjectDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const p = await getProjectById(id)
      setProject(p)
      setBreadcrumbs([{ label: 'Projects' }, { label: p.name }])
    } catch {
      setError('Failed to load project.')
    } finally {
      setLoading(false)
    }
  }, [id, setBreadcrumbs])

  useEffect(() => { fetchData() }, [fetchData])

  if (!project) {
    return (
      <PageContainer title="Project" status={error ? 'error' : loading ? 'loading' : 'empty'}
        errorMessage={error ?? undefined} onRetry={fetchData} />
    )
  }

  return (
    <PageContainer title={project.name} description={project.description ?? undefined}
      status="success"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/projects/list')}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${id}/work-orders`)}>
            Work Orders
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</div>
          <ProjectStatusBadge status={project.status} />
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Priority</div>
          <Badge variant="outline">{project.priority}</Badge>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Manager</div>
          <div className="font-medium">{project.projectManagerName || 'Unassigned'}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Budget</div>
          <div className="font-medium">{formatCurrency(project.budget)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Spent</div>
          <div className="font-medium">{formatCurrency(project.spent)}</div>
          <BudgetProgressBar budget={project.budget} spent={project.spent} className="mt-2" />
        </Card>
        <Card className={`p-4 ${project.isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Timeline</div>
          <div className="font-medium">
            {project.startDate ? formatDate(project.startDate) : '?'} - {project.endDate ? formatDate(project.endDate) : '?'}
          </div>
          {project.isOverdue && <Badge variant="destructive" className="mt-1">Overdue</Badge>}
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <h3 className="text-base font-semibold mb-3">Work Orders ({project.workOrders.length})</h3>
        <div className="space-y-2">
          {project.workOrders.slice(0, 10).map((wo) => (
            <div key={wo.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div>
                <span className="font-medium text-sm">{wo.title}</span>
                <Badge variant="outline" className="ml-2 text-xs">{wo.status}</Badge>
              </div>
              <span className="text-xs text-gray-500">{wo.assignedToName || 'Unassigned'}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-base font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {project.recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-gray-400 mt-0.5">●</span>
              <div>
                <span>{a.description}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {a.occurredAt ? formatDate(a.occurredAt, 'datetime') : ''}
                </span>
                {a.actorName && <span className="text-xs text-gray-400 ml-1">— {a.actorName}</span>}
              </div>
            </div>
          ))}
          {project.recentActivity.length === 0 && (
            <p className="text-sm text-gray-400">No recent activity.</p>
          )}
        </div>
      </Card>
    </PageContainer>
  )
}
