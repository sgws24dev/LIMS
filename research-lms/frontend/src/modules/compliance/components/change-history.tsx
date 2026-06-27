import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/shared/components/ui/button'
import { getChangeHistory, type AuditLogEntryDto } from '@/services/api/compliance'
import { PageContainer } from '@/shared/shared/page-container'

interface ChangeHistoryProps {
  entityType: string
  entityId: string
  open: boolean
  onClose: () => void
  maxItems?: number
}

export default function ChangeHistory({ entityType, entityId, open, onClose, maxItems }: ChangeHistoryProps) {
  const [entries, setEntries] = useState<AuditLogEntryDto[]>([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!entityType || !entityId) return
    setLoading(true)
    setError(null)
    try {
      setEntries(await getChangeHistory(entityType, entityId))
    } catch {
      setError('Failed to load change history')
    } finally {
      setLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    if (open) fetch()
  }, [open, fetch])

  if (!open) return null

  const displayed = maxItems && !showAll ? entries.slice(0, maxItems) : entries

  const operationIcon = (op: string) => {
    switch (op) {
      case 'Create': return <span className="text-green-600 font-bold text-lg leading-none">+</span>
      case 'Update': return <span className="text-amber-600 text-lg leading-none">&#9998;</span>
      case 'Delete': return <span className="text-red-600 font-bold text-lg leading-none">&times;</span>
      default: return null
    }
  }

  const operationColor = (op: string) => {
    switch (op) {
      case 'Create': return 'text-green-600'
      case 'Update': return 'text-amber-600'
      case 'Delete': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Change History</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">&times;</button>
        </div>
        <PageContainer
          title=""
          status={loading ? 'loading' : error ? 'error' : entries.length === 0 ? 'empty' : 'success'}
          onRetry={fetch}
        >
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-60px)]">
            {displayed.map((entry) => (
              <div key={entry.id} className="border rounded-md p-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="flex items-center gap-1.5">
                    {operationIcon(entry.operation)}
                    <span className={`font-medium ${operationColor(entry.operation)}`}>{entry.operation}</span>
                  </span>
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  By: {entry.changedByUserName} | Reason: {entry.changeReason}
                </div>
                {entry.previousValues && entry.newValues && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs text-red-600 font-medium">Before</span>
                      <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(JSON.parse(entry.previousValues), null, 2)}</pre>
                    </div>
                    <div>
                      <span className="text-xs text-green-600 font-medium">After</span>
                      <pre className="bg-green-50 p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(JSON.parse(entry.newValues), null, 2)}</pre>
                    </div>
                  </div>
                )}
                {!entry.previousValues && entry.newValues && (
                  <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(entry.newValues), null, 2)}
                  </pre>
                )}
              </div>
            ))}
            {maxItems && !showAll && entries.length > maxItems && (
              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAll(true)}>
                Show all ({entries.length} entries)
              </Button>
            )}
          </div>
        </PageContainer>
      </div>
    </div>
  )
}
