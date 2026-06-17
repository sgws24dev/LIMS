import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  WorkflowInstanceDto,
  StateTransitionRecord,
  AvailableTriggerDto,
  getWorkflowInstanceByEntity,
  getAvailableTriggers,
  executeTransition,
  getWorkflowDefinitionById,
  WorkflowDefinitionDto,
  WorkflowStateDto,
  WorkflowTransitionDto,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Play, Clock, User, MessageSquare } from 'lucide-react'
import StateMachineDiagram from '../components/state-machine-diagram'

interface WorkflowInstanceViewProps {
  entityType?: string
  entityId?: string
}

export default function WorkflowInstanceView({ entityType: propEntityType, entityId: propEntityId }: WorkflowInstanceViewProps = {}) {
  const params = useParams<{ entityType: string; entityId: string }>()
  const entityType = propEntityType ?? params.entityType ?? ''
  const entityId = propEntityId ?? params.entityId ?? ''
  const className = ''
  const { toast } = useToast()
  const [instance, setInstance] = useState<WorkflowInstanceDto | null>(null)
  const [definition, setDefinition] = useState<WorkflowDefinitionDto | null>(null)
  const [triggers, setTriggers] = useState<AvailableTriggerDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [entityType, entityId])

  async function load() {
    setLoading(true)
    try {
      const inst = await getWorkflowInstanceByEntity(entityType, entityId)
      setInstance(inst)

      if (inst) {
        const [def, availableTriggers] = await Promise.all([
          getWorkflowDefinitionById(inst.workflowDefinitionId),
          getAvailableTriggers(inst.id),
        ])
        setDefinition(def)
        setTriggers(availableTriggers)
      }
    } catch {
      // No workflow instance exists
      setInstance(null)
      setDefinition(null)
      setTriggers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleTrigger(trigger: string) {
    if (!instance) return
    try {
      const result = await executeTransition(instance.id, trigger, 'current-user')
      if (result.success) {
        toast({ title: 'Transition executed', description: `Moved to: ${result.toState}` })
        load()
      } else {
        toast({
          title: 'Transition failed',
          description: result.errorMessage || 'Unknown error',
          variant: 'destructive',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to execute transition', variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-gray-500">
          Loading workflow...
        </CardContent>
      </Card>
    )
  }

  if (!instance || !definition) {
    return null
  }

  const states: WorkflowStateDto[] = JSON.parse(definition.states)
  const transitions: WorkflowTransitionDto[] = JSON.parse(definition.transitions)
  const history: StateTransitionRecord[] = instance.stateHistory || []

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Workflow Status</CardTitle>
            <Badge variant={instance.status === 'Active' ? 'default' : 'secondary'}>
              {instance.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Current State:</span>
            <Badge variant="outline">
              {states.find((s) => s.name === instance.currentState)?.label || instance.currentState}
            </Badge>
          </div>

          <StateMachineDiagram
            states={states}
            transitions={transitions}
            currentState={instance.currentState}
            height={300}
          />

          {triggers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Available Actions</label>
              <div className="flex flex-wrap gap-2">
                {triggers.map((t) => (
                  <Button
                    key={t.trigger}
                    size="sm"
                    onClick={() => handleTrigger(t.trigger)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {t.trigger.charAt(0).toUpperCase() + t.trigger.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">State History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {history.length === 0 && (
              <p className="text-sm text-gray-500">No history yet.</p>
            )}
            {history.map((record, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                  {i < history.length - 1 && <div className="w-px flex-1 bg-gray-200" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {states.find((s) => s.name === record.toState)?.label || record.toState}
                    </Badge>
                    <span className="text-gray-400 text-xs">
                      via <span className="font-medium">{record.trigger}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {record.triggeredBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(record.triggeredAt).toLocaleString()}
                    </span>
                    {record.comment && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {record.comment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
