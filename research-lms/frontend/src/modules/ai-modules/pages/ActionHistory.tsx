import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { getActionHistory, type ActionLogEntryDto } from '@/services/api/ai'

const statusIcons = {
  Completed: CheckCircle,
  Blocked: XCircle,
  Failed: AlertTriangle,
  Pending: Clock,
} as const

const statusColors = {
  Completed: 'bg-green-500/10 text-green-600',
  Blocked: 'bg-red-500/10 text-red-600',
  Failed: 'bg-orange-500/10 text-orange-600',
  Pending: 'bg-blue-500/10 text-blue-600',
} as const

export default function ActionHistory() {
  const [logs, setLogs] = useState<ActionLogEntryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await getActionHistory()
      setLogs(data)
    } catch {
      setError('Failed to load action history.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageContainer title="Action History"><div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin" /></div></PageContainer>
  if (error) return <PageContainer title="Action History"><div className="flex items-center justify-center h-64"><p className="text-destructive">{error}</p></div></PageContainer>

  return (
    <PageContainer title="Action History" description="Past actions executed through Talk-to-Action">
      {logs.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No actions yet. Use Talk-to-Action to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map(log => {
            const Icon = statusIcons[log.status as keyof typeof statusIcons] || Clock
            const color = statusColors[log.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground'
            return (
              <Card key={log.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.intent}</span>
                      <Badge className={color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {log.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{log.durationMs}ms</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.utterance}</p>
                    {log.executionResult && (
                      <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">{log.executionResult}</pre>
                    )}
                    {log.guardrailResult && (
                      <pre className="text-xs bg-destructive/5 p-2 rounded mt-1 overflow-x-auto text-destructive/80">{log.guardrailResult}</pre>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}
