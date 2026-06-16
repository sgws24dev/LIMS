import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getPendingApprovals,
  decideApproval,
  ApprovalDto,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export default function ApprovalsDashboardPage() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [approvals, setApprovals] = useState<ApprovalDto[]>([])
  const [comments, setComments] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getPendingApprovals().then(setApprovals)
  }, [])

  const handleDecide = async (approvalId: string, approved: boolean) => {
    setProcessing((prev) => ({ ...prev, [approvalId]: true }))
    try {
      await decideApproval(approvalId, approved, comments[approvalId])
      toast({
        title: approved ? 'Approved' : 'Rejected',
        description: `Approval decision recorded.`,
      })
      setApprovals((prev) => prev.filter((a) => a.id !== approvalId))
    } catch {
      toast({ title: 'Error', description: 'Failed to record decision.', variant: 'destructive' })
    } finally {
      setProcessing((prev) => ({ ...prev, [approvalId]: false }))
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <Badge variant="outline" className="text-lg">
          {approvals.length} pending
        </Badge>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No pending approvals. You're all caught up!
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Approvals Awaiting Your Decision</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium"
                        onClick={() => navigate(`/requests/${approval.serviceRequestId}`)}
                      >
                        {approval.requestTitle}
                      </Button>
                    </TableCell>
                    <TableCell>Step {approval.stepOrder + 1}</TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Add comment..."
                        className="min-h-[60px]"
                        value={comments[approval.id] || ''}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [approval.id]: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDecide(approval.id, false)}
                          disabled={processing[approval.id]}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDecide(approval.id, true)}
                          disabled={processing[approval.id]}
                        >
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
