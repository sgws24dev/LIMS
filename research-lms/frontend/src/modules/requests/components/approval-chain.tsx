import { useState } from 'react'
import { approveRequest, rejectRequest, ApprovalDto } from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Textarea } from '@/shared/components/ui/textarea'
import { useToast } from '@/shared/hooks/use-toast'
import { cn } from '@/lib/utils'

interface ApprovalChainProps {
  approvals: ApprovalDto[]
  requestId: string
  readOnly?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Skipped: 'bg-gray-100 text-gray-800',
}

export default function ApprovalChain({ approvals: initialApprovals, requestId, readOnly = false }: ApprovalChainProps) {
  const [approvals, setApprovals] = useState<ApprovalDto[]>(initialApprovals)
  const [comment, setComment] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const sorted = [...approvals].sort((a, b) => a.stepOrder - b.stepOrder)
  const pendingApproval = sorted.find((a) => a.status === 'Pending')
  const isPendingSelected = pendingApproval && selectedId === pendingApproval.id

  const handleApprove = async () => {
    if (!pendingApproval) return
    setLoading(true)
    try {
      const updated = await approveRequest(requestId, pendingApproval.id, comment)
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setComment('')
      setSelectedId(null)
      toast({ title: 'Approved', description: 'Request has been approved.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to approve.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!pendingApproval) return
    if (!comment.trim()) {
      toast({ title: 'Comment required', description: 'Please provide a reason for rejection.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const updated = await rejectRequest(requestId, pendingApproval.id, comment)
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
      setComment('')
      setSelectedId(null)
      toast({ title: 'Rejected', description: 'Request has been rejected.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to reject.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (approvals.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Chain</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((approval, index) => (
            <div key={approval.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  approval.status === 'Approved' ? 'bg-green-500 text-white' :
                  approval.status === 'Rejected' ? 'bg-red-500 text-white' :
                  approval.status === 'Skipped' ? 'bg-gray-300 text-gray-600' :
                  'bg-blue-500 text-white'
                )}>
                  {index + 1}
                </div>
                {index < sorted.length - 1 && <div className="w-0.5 h-6 bg-gray-300" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{approval.approverName || approval.approverUserId}</span>
                    {approval.status === 'Pending' && approval.id === pendingApproval?.id && !readOnly && (
                      <span className="ml-2 text-xs text-blue-600">(Your action required)</span>
                    )}
                  </div>
                  <Badge className={STATUS_COLORS[approval.status]}>{approval.status}</Badge>
                </div>
                {approval.comment && (
                  <p className="text-sm text-muted-foreground mt-1">"{approval.comment}"</p>
                )}
                {approval.decidedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(approval.decidedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}

          {pendingApproval && !readOnly && (
            <div className="mt-4 space-y-2 border-t pt-4">
              <Textarea
                placeholder="Add a comment (required for rejection)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  Approve
                </Button>
                <Button onClick={handleReject} disabled={loading} variant="destructive">
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
