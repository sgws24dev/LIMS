import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getServiceRequestById,
  getMilestonesByRequest,
  getApprovalsByRequest,
  getServiceRequestHistory,
  cancelServiceRequest,
  changeServiceRequestStatus,
  assignServiceRequest,
  ServiceRequestDto,
  MilestoneDto,
  ApprovalDto,
  RequestStatusHistoryDto,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import MilestoneTracker from '../components/milestone-tracker'
import WorkflowInstanceView from '@/modules/workflow/components/workflow-instance-view'

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-800',
  Submitted: 'bg-blue-100 text-blue-800',
  PendingApproval: 'bg-yellow-100 text-yellow-800',
  InReview: 'bg-purple-100 text-purple-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  InProgress: 'bg-indigo-100 text-indigo-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
  OnHold: 'bg-orange-100 text-orange-800',
}

export default function RequestDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [request, setRequest] = useState<ServiceRequestDto | null>(null)
  const [milestones, setMilestones] = useState<MilestoneDto[]>([])
  const [approvals, setApprovals] = useState<ApprovalDto[]>([])
  const [history, setHistory] = useState<RequestStatusHistoryDto[]>([])
  const [assignTo, setAssignTo] = useState('')
  const [comment, setComment] = useState('')
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => {
    if (id) {
      getServiceRequestById(id).then(setRequest)
      getMilestonesByRequest(id).then(setMilestones)
      getApprovalsByRequest(id).then(setApprovals)
      getServiceRequestHistory(id).then(setHistory)
    }
  }, [id])

  if (!request) return <div className="container mx-auto p-6">Loading...</div>

  const handleCancel = async () => {
    try {
      await cancelServiceRequest(request.id, comment)
      toast({ title: 'Cancelled', description: 'Request has been cancelled.' })
      const updated = await getServiceRequestById(request.id)
      setRequest(updated)
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel request.', variant: 'destructive' })
    }
  }

  const handleChangeStatus = async () => {
    if (!newStatus) return
    try {
      await changeServiceRequestStatus(request.id, newStatus, comment)
      toast({ title: 'Status Updated', description: `Status changed to ${newStatus}.` })
      const updated = await getServiceRequestById(request.id)
      setRequest(updated)
      setNewStatus('')
      setComment('')
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' })
    }
  }

  const handleAssign = async () => {
    if (!assignTo) return
    try {
      await assignServiceRequest(request.id, assignTo)
      toast({ title: 'Assigned', description: 'Request has been assigned.' })
      const updated = await getServiceRequestById(request.id)
      setRequest(updated)
      setAssignTo('')
    } catch {
      toast({ title: 'Error', description: 'Failed to assign request.', variant: 'destructive' })
    }
  }

  const canCancel = !['Completed', 'Rejected', 'Cancelled'].includes(request.status)
  const canChangeStatus = request.status !== 'Completed' && request.status !== 'Cancelled' && request.status !== 'Rejected'

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground">Form: {request.formTitle} (v{request.formDefinitionVersion})</p>
        </div>
        <Badge className={STATUS_COLORS[request.status] || ''}>{request.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()} by {request.createdBy}</p>
            <p><strong>Submitted:</strong> {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : '-'}</p>
            <p><strong>Completed:</strong> {request.completedAt ? new Date(request.completedAt).toLocaleString() : '-'}</p>
            <p><strong>Assigned To:</strong> {request.assignedTo || 'Unassigned'}</p>
            <p><strong>Approval Routing:</strong> {request.approvalRouting}</p>
            {request.description && <p><strong>Description:</strong> {request.description}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Assign to user ID"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
              />
              <Button onClick={handleAssign} disabled={!assignTo}>
                Assign
              </Button>
            </div>
            {canChangeStatus && (
              <>
                <div className="flex gap-2">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Change status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Submitted">Submit</SelectItem>
                      <SelectItem value="PendingApproval">Send for Approval</SelectItem>
                      <SelectItem value="InReview">Set In Review</SelectItem>
                      <SelectItem value="InProgress">Set In Progress</SelectItem>
                      <SelectItem value="Completed">Complete</SelectItem>
                      <SelectItem value="OnHold">Hold</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleChangeStatus} disabled={!newStatus}>
                    Update
                  </Button>
                </div>
                <Textarea
                  placeholder="Comment (optional)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={handleCancel}>
                Cancel Request
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/requests')}>
              Back to List
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(JSON.parse(request.formData), null, 2)}
          </pre>
        </CardContent>
      </Card>

      <MilestoneTracker milestones={milestones} requestId={request.id} />

      <WorkflowInstanceView entityType="ServiceRequest" entityId={request.id} />

      <Card>
        <CardHeader>
          <CardTitle>Approvals ({approvals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <p className="text-muted-foreground">No approvals configured.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Approver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Decided At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.stepOrder + 1}</TableCell>
                    <TableCell>{a.approverName || a.approverUserId}</TableCell>
                    <TableCell>
                      <Badge className={a.status === 'Approved' ? 'bg-green-100 text-green-800' : a.status === 'Rejected' ? 'bg-red-100 text-red-800' : a.status === 'Skipped' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{a.comment || '-'}</TableCell>
                    <TableCell>{a.decidedAt ? new Date(a.decidedAt).toLocaleString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Changed By</TableHead>
                <TableHead>Changed At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No status changes recorded.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell>{h.fromStatus}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[h.toStatus] || ''}>{h.toStatus}</Badge></TableCell>
                    <TableCell>{h.comment || '-'}</TableCell>
                    <TableCell>{h.changedBy}</TableCell>
                    <TableCell>{new Date(h.changedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
