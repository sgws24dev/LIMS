import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  WorkflowDefinitionDto,
  WorkflowStateDto,
  WorkflowTransitionDto,
  getWorkflowDefinitionById,
  createWorkflowDefinition,
  updateWorkflowDefinition,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Eye, Code, Plus, Trash2 } from 'lucide-react'
import StateMachineDiagram from '../components/state-machine-diagram'

type Tab = 'designer' | 'json'

const defaultStates: WorkflowStateDto[] = [
  { name: 'draft', label: 'Draft', type: 'Initial', allowedTriggers: ['submit'] },
  { name: 'submitted', label: 'Submitted', type: 'Intermediate', allowedTriggers: ['approve', 'reject'] },
  { name: 'approved', label: 'Approved', type: 'Final' },
  { name: 'rejected', label: 'Rejected', type: 'Terminal' },
]

const defaultTransitions: WorkflowTransitionDto[] = [
  { fromState: 'draft', toState: 'submitted', trigger: 'submit', label: 'Submit', guards: [], actions: ['LogTransition'] },
  { fromState: 'submitted', toState: 'approved', trigger: 'approve', label: 'Approve', guards: ['HasActiveApprover'], actions: ['LogTransition', 'UpdateStatus'] },
  { fromState: 'submitted', toState: 'rejected', trigger: 'reject', label: 'Reject', guards: ['HasActiveApprover'], actions: ['LogTransition', 'UpdateStatus'] },
  { fromState: 'approved', toState: 'submitted', trigger: 'resubmit', label: 'Resubmit', guards: [], actions: ['LogTransition'] },
]

export default function WorkflowDesignerPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isNew = id === 'new'

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [entityTypeHint, setEntityTypeHint] = useState('')
  const [states, setStates] = useState<WorkflowStateDto[]>(defaultStates)
  const [transitions, setTransitions] = useState<WorkflowTransitionDto[]>(defaultTransitions)
  const [activeTab, setActiveTab] = useState<Tab>('designer')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (!isNew && id) {
      loadDefinition(id)
    }
  }, [id])

  async function loadDefinition(definitionId: string) {
    try {
      const dto = await getWorkflowDefinitionById(definitionId)
      setName(dto.name)
      setDescription(dto.description || '')
      setEntityTypeHint(dto.entityTypeHint || '')
      setStates(JSON.parse(dto.states))
      setTransitions(JSON.parse(dto.transitions))
    } catch {
      toast({ title: 'Error', description: 'Failed to load workflow definition', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const statesJson = JSON.stringify(states)
      const transitionsJson = JSON.stringify(transitions)

      if (isNew) {
        const result = await createWorkflowDefinition({
          name,
          description: description || undefined,
          states: statesJson,
          transitions: transitionsJson,
          entityTypeHint: entityTypeHint || undefined,
          createdBy: 'current-user',
        })
        navigate(`/workflow/designer/${result.id}`, { replace: true })
        toast({ title: 'Created', description: 'Workflow definition created' })
      } else if (id) {
        await updateWorkflowDefinition(id, {
          id,
          name,
          description: description || undefined,
          states: statesJson,
          transitions: transitionsJson,
          entityTypeHint: entityTypeHint || undefined,
          updatedBy: 'current-user',
        })
        toast({ title: 'Saved', description: 'Workflow definition updated' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save workflow definition', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [name, description, entityTypeHint, states, transitions, isNew, id, navigate, toast])

  function addState() {
    const name = prompt('State name (e.g. in_review):')
    if (!name) return
    const label = prompt('Display label:', name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
    if (!label) return
    const type = prompt('Type (Initial / Intermediate / Final / Terminal):', 'Intermediate') || 'Intermediate'
    if (!['Initial', 'Intermediate', 'Final', 'Terminal'].includes(type)) return

    setStates([...states, { name, label, type: type as WorkflowStateDto['type'] }])
  }

  function addTransition() {
    const fromState = prompt('From state:')
    if (!fromState || !states.find((s) => s.name === fromState)) return
    const toState = prompt('To state:')
    if (!toState || !states.find((s) => s.name === toState)) return
    const trigger = prompt('Trigger name (e.g. approve):')
    if (!trigger) return
    const label = prompt('Display label:', trigger.replace(/\b\w/g, (c) => c.toUpperCase()))

    setTransitions([...transitions, {
      fromState,
      toState,
      trigger,
      label: label || trigger,
      guards: [],
      actions: ['LogTransition'],
    }])
  }

  function removeState(name: string) {
    if (states.length <= 1) return
    setStates(states.filter((s) => s.name !== name))
    setTransitions(transitions.filter((t) => t.fromState !== name && t.toState !== name))
  }

  function removeTransition(index: number) {
    setTransitions(transitions.filter((_, i) => i !== index))
  }

  const statesJson = JSON.stringify(states, null, 2)
  const transitionsJson = JSON.stringify(transitions, null, 2)

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/workflow/definitions')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{isNew ? 'New Workflow' : 'Edit Workflow'}</h1>
          {!isNew && <Badge variant="outline">v1</Badge>}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Workflow" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
        </div>
        <div>
          <label className="text-sm font-medium">Entity Type Hint</label>
          <Input value={entityTypeHint} onChange={(e) => setEntityTypeHint(e.target.value)} placeholder="e.g. ServiceRequest" />
        </div>
      </div>

      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'designer'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('designer')}
        >
          <Eye className="h-4 w-4 inline mr-1" />
          Visual Designer
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'json'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('json')}
        >
          <Code className="h-4 w-4 inline mr-1" />
          JSON
        </button>
      </div>

      {activeTab === 'designer' ? (
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <StateMachineDiagram
              states={states}
              transitions={transitions}
              height={500}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addState}>
                <Plus className="h-4 w-4 mr-1" /> Add State
              </Button>
              <Button variant="outline" size="sm" onClick={addTransition}>
                <Plus className="h-4 w-4 mr-1" /> Add Transition
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">States</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {states.map((s) => (
                  <div key={s.name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{s.label}</span>
                      <Badge className="ml-2 text-xs" variant="outline">{s.type}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeState(s.name)}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Transitions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {transitions.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{t.label || t.trigger}</span>
                      <span className="text-gray-500 ml-1">
                        ({t.fromState} → {t.toState})
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTransition(i)}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-1 block">States JSON</label>
            <Textarea
              className="font-mono text-xs h-96"
              value={statesJson}
              onChange={(e) => {
                try { setStates(JSON.parse(e.target.value)) } catch { /* allow editing */ }
              }}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Transitions JSON</label>
            <Textarea
              className="font-mono text-xs h-96"
              value={transitionsJson}
              onChange={(e) => {
                try { setTransitions(JSON.parse(e.target.value)) } catch { /* allow editing */ }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
