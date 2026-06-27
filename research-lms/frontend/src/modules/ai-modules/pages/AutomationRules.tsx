import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, AlertTriangle, CheckCircle, Clock, Gauge } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/hooks/use-toast'
import {
  getAutomationRules, createAutomationRule, updateAutomationRule, deleteAutomationRule,
  toggleAutomationRule, getPendingActions, approveAction, rejectAction,
  type AutomationRuleDto, type PendingActionDto
} from '@/services/api/ai'

const defaultTriggerConfig = JSON.stringify({ alertRuleId: '', instrumentId: '' }, null, 2)
const defaultActionConfig = JSON.stringify({ command: '', targetValue: 0, instrumentId: '' }, null, 2)

export default function AutomationRules() {
  const { toast } = useToast()
  const [rules, setRules] = useState<AutomationRuleDto[]>([])
  const [pendingActions, setPendingActions] = useState<PendingActionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [triggerType, setTriggerType] = useState('AlertBreach')
  const [triggerConfig, setTriggerConfig] = useState(defaultTriggerConfig)
  const [actionType, setActionType] = useState('SoftAction')
  const [actionConfig, setActionConfig] = useState(defaultActionConfig)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [rulesData, pendingData] = await Promise.all([
        getAutomationRules(),
        getPendingActions(),
      ])
      setRules(rulesData)
      setPendingActions(pendingData)
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName('')
    setTriggerType('AlertBreach')
    setTriggerConfig(defaultTriggerConfig)
    setActionType('SoftAction')
    setActionConfig(defaultActionConfig)
    setRequiresApproval(false)
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (rule: AutomationRuleDto) => {
    setName(rule.name)
    setTriggerType(rule.triggerType)
    setTriggerConfig(rule.triggerConfig)
    setActionType(rule.actionType)
    setActionConfig(rule.actionConfig)
    setRequiresApproval(rule.requiresApproval)
    setEditingId(rule.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const request = { name, triggerType, triggerConfig, actionType, actionConfig, requiresApproval }
      if (editingId) {
        await updateAutomationRule(editingId, request)
        toast({ title: 'Rule updated' })
      } else {
        await createAutomationRule(request)
        toast({ title: 'Rule created' })
      }
      resetForm()
      loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to save rule.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomationRule(id)
      toast({ title: 'Rule deleted' })
      loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete rule.', variant: 'destructive' })
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await toggleAutomationRule(id, !isEnabled)
      loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle rule.', variant: 'destructive' })
    }
  }

  const handleApprove = async (id: string) => {
    try {
      await approveAction(id)
      toast({ title: 'Action approved' })
      loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to approve action.', variant: 'destructive' })
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectAction(id)
      toast({ title: 'Action rejected' })
      loadData()
    } catch {
      toast({ title: 'Error', description: 'Failed to reject action.', variant: 'destructive' })
    }
  }

  const actionTypeColors: Record<string, string> = {
    SoftAction: 'bg-blue-500/10 text-blue-600',
    HardAction: 'bg-red-500/10 text-red-600',
  }

  if (loading) return <PageContainer title="Automation Rules"><div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div></PageContainer>

  return (
    <PageContainer title="Automation Rules" description="Configure if-then automation for instrument telemetry">
      <div className="space-y-6">
        {pendingActions.length > 0 && (
          <Card className="p-4 border-amber-200 bg-amber-50/50">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Pending Approvals ({pendingActions.length})
            </h3>
            <div className="space-y-2">
              {pendingActions.map(action => (
                <div key={action.id} className="flex items-center justify-between p-2 bg-white rounded-md text-sm">
                  <div>
                    <p className="font-medium">{action.ruleName}</p>
                    <p className="text-xs text-muted-foreground">Triggered: {new Date(action.executedAt).toLocaleString()}</p>
                    <pre className="text-xs bg-muted p-1 rounded mt-1 max-w-md truncate">{action.actionExecuted}</pre>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="default" onClick={() => handleApprove(action.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(action.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{rules.length} rule{rules.length !== 1 ? 's' : ''}</p>
          <Button onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="h-4 w-4 mr-1" />
            New Rule
          </Button>
        </div>

        {showForm && (
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold">{editingId ? 'Edit Rule' : 'New Automation Rule'}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Rule name" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Trigger Type</label>
                <select value={triggerType} onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="AlertBreach">Alert Breach</option>
                  <option value="Schedule">Schedule</option>
                  <option value="TelemetryPattern">Telemetry Pattern</option>
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium">Trigger Config (JSON)</label>
                <Textarea value={triggerConfig} onChange={(e) => setTriggerConfig(e.target.value)} className="font-mono text-xs min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Action Type</label>
                <select value={actionType} onChange={(e) => { setActionType(e.target.value); if (e.target.value === 'SoftAction') setRequiresApproval(false) }}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="SoftAction">Soft Action</option>
                  <option value="HardAction">Hard Action</option>
                </select>
              </div>
              <div className="space-y-2 flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={requiresApproval} onChange={(e) => setRequiresApproval(e.target.checked)}
                    disabled={actionType === 'SoftAction'} className="rounded" />
                  Requires Approval
                </label>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium">Action Config (JSON)</label>
                <Textarea value={actionConfig} onChange={(e) => setActionConfig(e.target.value)} className="font-mono text-xs min-h-[80px]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={!name.trim() || saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </Card>
        )}

        {rules.length === 0 && !showForm ? (
          <Card className="p-8 text-center">
            <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No automation rules configured. Create one to get started.</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {rules.map(rule => (
              <Card key={rule.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{rule.name}</span>
                      <Badge className={actionTypeColors[rule.actionType] || ''}>{rule.actionType}</Badge>
                      <Badge variant="outline" className="text-xs">{rule.triggerType}</Badge>
                      {rule.requiresApproval && <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600">Requires Approval</Badge>}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Trigger: <code className="bg-muted px-1 rounded">{rule.triggerConfig}</code></span>
                      <span>Action: <code className="bg-muted px-1 rounded">{rule.actionConfig}</code></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <Button variant="ghost" size="icon-sm" onClick={() => handleToggle(rule.id, rule.isEnabled)} title={rule.isEnabled ? 'Disable' : 'Enable'}>
                      {rule.isEnabled ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(rule)} title="Edit">
                      <Gauge className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(rule.id)} title="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
