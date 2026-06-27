import { useState } from 'react'
import { Send, ShieldAlert, CheckCircle, AlertTriangle, Loader2, Eye } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { dryRunAction, executeAction, type ActionPlanDto } from '@/services/api/ai'

type Step = 'input' | 'preview' | 'result'

export default function TalkToAction() {
  const { toast } = useToast()
  const [utterance, setUtterance] = useState('')
  const [step, setStep] = useState<Step>('input')
  const [plan, setPlan] = useState<ActionPlanDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [executing, setExecuting] = useState(false)

  const handleDryRun = async () => {
    if (!utterance.trim()) return
    setLoading(true)
    try {
      const result = await dryRunAction(utterance.trim())
      setPlan(result)
      setStep('preview')
    } catch {
      toast({ title: 'Error', description: 'Failed to analyze request.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async () => {
    if (!utterance.trim() || !plan) return
    setExecuting(true)
    try {
      const result = await executeAction(utterance.trim())
      setPlan(result)
      setStep('result')
      toast({ title: 'Action completed', description: result.guardrail.isAllowed ? 'Action executed successfully.' : `Blocked: ${result.guardrail.blockedReason}` })
    } catch {
      toast({ title: 'Error', description: 'Failed to execute action.', variant: 'destructive' })
    } finally {
      setExecuting(false)
    }
  }

  const handleReset = () => {
    setUtterance('')
    setStep('input')
    setPlan(null)
  }

  const examples = [
    'Book the mass spectrometer for tomorrow at 2pm',
    'Is the centrifuge available this afternoon?',
    'Check my competency status for HPLC',
    'What is the SOP for autoclave operation?',
  ]

  return (
    <PageContainer title="Talk to Action" description="Describe what you want to do — the system will analyze and execute it">
      <div className="max-w-3xl mx-auto space-y-6">
        {step === 'input' && (
          <>
            <Card className="p-4 space-y-4">
              <Textarea
                value={utterance}
                onChange={(e) => setUtterance(e.target.value)}
                placeholder="e.g., Book the mass spectrometer for tomorrow at 2pm"
                className="min-h-[120px]"
                disabled={loading}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-1 flex-wrap">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setUtterance(ex)}
                      className="text-xs text-muted-foreground hover:text-foreground bg-muted px-2 py-1 rounded-md transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
                <Button onClick={handleDryRun} disabled={!utterance.trim() || loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  Preview Action
                </Button>
              </div>
            </Card>
          </>
        )}

        {plan && (
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Action Plan</h3>
              <Badge variant={plan.guardrail.isAllowed ? 'default' : 'destructive'}>
                {plan.guardrail.isAllowed ? (plan.requiresApproval ? 'Approval Required' : 'Allowed') : 'Blocked'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Intent</span>
                <p className="font-medium">{plan.intent}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence</span>
                <p className="font-medium">{(plan.confidence * 100).toFixed(0)}%</p>
              </div>
              {plan.suggestedTool && (
                <div>
                  <span className="text-muted-foreground">Suggested Tool</span>
                  <p className="font-medium">{plan.suggestedTool}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Parameters</span>
                <pre className="font-medium text-xs bg-muted p-1 rounded">{plan.parametersJson}</pre>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Preview</p>
              <p className="text-sm">{plan.dryRunPreview}</p>
            </div>

            {!plan.guardrail.isAllowed && (
              <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                <ShieldAlert className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Action Blocked</p>
                  <p className="text-xs text-destructive/80">{plan.guardrail.blockedReason}</p>
                </div>
              </div>
            )}

            {plan.guardrail.requiresApproval && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-600">Approval Required</p>
                  <p className="text-xs text-amber-600/80">Requires approval from: {plan.guardrail.approverRoles.join(', ')}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {step === 'preview' && plan.guardrail.isAllowed && (
                <Button onClick={handleExecute} disabled={executing}>
                  {executing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
                  Execute Action
                </Button>
              )}
              {step === 'result' && plan.guardrail.isAllowed && (
                <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg w-full">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Action Completed</p>
                    <pre className="text-xs text-green-600/80 mt-1">{plan.dryRunPreview}</pre>
                  </div>
                </div>
              )}
              <Button variant="outline" onClick={handleReset}>Start Over</Button>
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
