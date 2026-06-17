import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { IssueStatusBadge } from '../components/issue-status-badge'
import { IssueSeverityBadge } from '../components/issue-severity-badge'
import { IssueCommentThread } from '../components/issue-comment-thread'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { formatDate } from '@/lib/utils'
import { getIssueById, updateIssueStatus, syncIssueToExternal, type IssueDetailDto, type IssueStatus } from '@/services/api/projects'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, ExternalLink, RefreshCw, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { ConfirmDialog } from '@/shared/shared/confirm-dialog'

export default function IssueDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [issue, setIssue] = useState<IssueDetailDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusAction, setStatusAction] = useState<IssueStatus | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    editable: false,
    content: '',
  })

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await getIssueById(id)
      setIssue(result)
      setBreadcrumbs([{ label: 'Issues' }, { label: result.title }])
      if (editor && result.description) {
        editor.commands.setContent(result.description)
      }
    } catch {
      setError('Failed to load issue.')
    } finally {
      setLoading(false)
    }
  }, [id, setBreadcrumbs, editor])

  useEffect(() => { fetchData() }, [fetchData])

  const handleStatusChange = async () => {
    if (!id || !statusAction) return
    setActionLoading(true)
    try {
      await updateIssueStatus(id, statusAction)
      toast({ title: `Status updated to ${statusAction}`, variant: 'success' })
      fetchData()
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    } finally {
      setActionLoading(false)
      setStatusAction(null)
    }
  }

  const handleSync = async () => {
    if (!id) return
    setSyncing(true)
    try {
      const result = await syncIssueToExternal(id, 'ServiceNow')
      toast({ title: 'Issue synced', description: `External ID: ${result.externalId}`, variant: 'success' })
      fetchData()
    } catch {
      toast({ title: 'Sync failed', variant: 'destructive' })
    } finally {
      setSyncing(false)
    }
  }

  if (!issue) {
    return (
      <PageContainer title="Issue" status={error ? 'error' : loading ? 'loading' : 'empty'}
        errorMessage={error ?? undefined} onRetry={fetchData} />
    )
  }

  const availableActions: { label: string; status: IssueStatus; variant?: string }[] = []
  if (issue.status === 'InProgress' || issue.status === 'Reopened') {
    availableActions.push({ label: 'Resolve', status: 'Resolved' })
  }
  if (issue.status === 'Resolved') {
    availableActions.push({ label: 'Close', status: 'Closed' })
  }
  if (issue.status === 'Closed' || issue.status === 'Resolved') {
    availableActions.push({ label: 'Reopen', status: 'Reopened' })
  }

  return (
    <PageContainer title={issue.title} status="success"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/issues')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      }
    >
      <div className="max-w-3xl space-y-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <IssueSeverityBadge severity={issue.severity} />
            <IssueStatusBadge status={issue.status} />
            <Badge variant="outline">{issue.type}</Badge>
            <Badge variant="outline">{issue.priority}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Reported by:</span> {issue.reportedByName} · {issue.createdAt ? formatDate(issue.createdAt) : ''}</div>
            <div><span className="text-gray-500">Assigned to:</span> {issue.assignedToName || 'Unassigned'}</div>
            {issue.projectName && <div><span className="text-gray-500">Project:</span> {issue.projectName}</div>}
            {issue.workOrderTitle && <div><span className="text-gray-500">Work Order:</span> {issue.workOrderTitle}</div>}
            {issue.dueDate && (
              <div><span className="text-gray-500">Due:</span>
                <span className={issue.isOverdue ? 'text-red-600 font-medium' : ''}> {formatDate(issue.dueDate)}</span>
              </div>
            )}
          </div>
        </Card>

        {issue.description && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <div className="prose dark:prose-invert max-w-none text-sm">
              <EditorContent editor={editor} />
            </div>
          </Card>
        )}

        {availableActions.length > 0 && (
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-2">Status & Lifecycle</h3>
            <div className="flex gap-2">
              {availableActions.map((action) => (
                <Button key={action.status}
                  size="sm"
                  variant={action.status === 'Closed' ? 'destructive' : 'default'}
                  onClick={() => setStatusAction(action.status)}>
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-2">External Sync</h3>
          {issue.externalId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <span>Synced to {issue.externalProvider}</span>
                <Badge variant="outline" className="text-xs">{issue.externalId}</Badge>
              </div>
              <div className="flex gap-2">
                {issue.externalUrl && (
                  <a href={issue.externalUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-1 h-3 w-3" /> Open
                    </Button>
                  </a>
                )}
                <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                  <RefreshCw className="mr-1 h-3 w-3" /> Re-sync
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Not synced to any external system</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setSyncing(true)
                  syncIssueToExternal(id!, 'ServiceNow').then(() => {
                    toast({ title: 'Synced to ServiceNow', variant: 'success' })
                    fetchData()
                  }).catch(() => toast({ title: 'Sync failed', variant: 'destructive' }))
                    .finally(() => setSyncing(false))
                }} disabled={syncing}>
                  Sync to ServiceNow
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSyncing(true)
                  syncIssueToExternal(id!, 'Jira').then(() => {
                    toast({ title: 'Synced to Jira', variant: 'success' })
                    fetchData()
                  }).catch(() => toast({ title: 'Sync failed', variant: 'destructive' }))
                    .finally(() => setSyncing(false))
                }} disabled={syncing}>
                  Sync to Jira
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <IssueCommentThread issueId={id!} />
        </Card>
      </div>

      <ConfirmDialog
        open={!!statusAction}
        onOpenChange={() => setStatusAction(null)}
        title={`Mark as ${statusAction}`}
        description={`Are you sure you want to mark this issue as "${statusAction}"?`}
        confirmLabel="Confirm"
        variant={statusAction === 'Closed' ? 'destructive' : statusAction === 'Reopened' ? 'warning' : 'default'}
        onConfirm={handleStatusChange}
        isLoading={actionLoading}
      />
    </PageContainer>
  )
}
