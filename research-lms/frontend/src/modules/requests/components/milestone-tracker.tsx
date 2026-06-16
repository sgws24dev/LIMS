import { useState, useEffect } from 'react'
import {
  getMilestonesByRequest,
  updateMilestoneStatus,
  MilestoneDto,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { cn } from '@/lib/utils'

interface MilestoneTrackerProps {
  milestones: MilestoneDto[]
  requestId: string
  readOnly?: boolean
}

const STATUS_ICONS: Record<string, string> = {
  Pending: '○',
  InProgress: '◐',
  Completed: '●',
  Skipped: '○',
}

export default function MilestoneTracker({ milestones: initialMilestones, requestId, readOnly = false }: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<MilestoneDto[]>(initialMilestones)
  const { toast } = useToast()

  useEffect(() => {
    setMilestones(initialMilestones)
  }, [initialMilestones])

  const handleAction = async (milestoneId: string, action: string) => {
    try {
      const updated = await updateMilestoneStatus(requestId, milestoneId, action)
      setMilestones((prev) => prev.map((m) => (m.id === milestoneId ? updated : m)))
      toast({ title: 'Milestone updated', description: `Milestone ${action}ed.` })
    } catch {
      toast({ title: 'Error', description: 'Failed to update milestone.', variant: 'destructive' })
    }
  }

  if (milestones.length === 0) return null

  const sorted = [...milestones].sort((a, b) => a.order - b.order)
  const completedCount = sorted.filter((m) => m.status === 'Completed').length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones ({completedCount}/{sorted.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {sorted.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2',
                    milestone.status === 'Completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : milestone.status === 'InProgress'
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : milestone.status === 'Skipped'
                      ? 'bg-gray-300 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-500'
                  )}
                >
                  {STATUS_ICONS[milestone.status] || index + 1}
                </div>
                {index < sorted.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={cn(
                      'font-medium',
                      milestone.status === 'Skipped' && 'line-through text-muted-foreground'
                    )}>
                      {milestone.title}
                    </span>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      milestone.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      milestone.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                      milestone.status === 'Skipped' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {milestone.status}
                    </Badge>
                    {!readOnly && milestone.status === 'Pending' && (
                      <Button size="sm" variant="outline" onClick={() => handleAction(milestone.id, 'start')}>
                        Start
                      </Button>
                    )}
                    {!readOnly && milestone.status === 'InProgress' && (
                      <Button size="sm" onClick={() => handleAction(milestone.id, 'complete')}>
                        Complete
                      </Button>
                    )}
                    {!readOnly && (milestone.status === 'Pending' || milestone.status === 'InProgress') && (
                      <Button size="sm" variant="ghost" onClick={() => handleAction(milestone.id, 'skip')}>
                        Skip
                      </Button>
                    )}
                    {milestone.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(milestone.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
