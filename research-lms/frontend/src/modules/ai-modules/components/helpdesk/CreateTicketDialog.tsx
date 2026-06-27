import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/hooks/use-toast'
import { createTicketFromConversation } from '@/services/api/ai'

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  conversationSummary: string
  onCreated: () => void
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  conversationId,
  conversationSummary,
  onCreated
}: CreateTicketDialogProps) {
  const { toast } = useToast()
  const [summary, setSummary] = useState(conversationSummary)
  const [priority, setPriority] = useState('Medium')
  const [category, setCategory] = useState('General')
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const handleCreate = async () => {
    if (!summary.trim()) {
      toast({ title: 'Validation error', description: 'Summary is required.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await createTicketFromConversation(conversationId, summary, priority, category)
      toast({ title: 'Ticket created', description: 'Support ticket created from conversation.' })
      onCreated()
    } catch {
      toast({ title: 'Error', description: 'Failed to create ticket.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md mx-4 p-6 space-y-4">
        <h3 className="text-lg font-semibold">Create Support Ticket</h3>
        <p className="text-sm text-muted-foreground">
          Create a support ticket from this conversation.
        </p>

        <div className="space-y-3">
          <div>
            <Label className="text-xs">Summary *</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1 min-h-[80px]"
              placeholder="Brief summary of the issue..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Priority</Label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
                <option value="Access">Access</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving || !summary.trim()}>
            {saving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Create Ticket
          </Button>
        </div>
      </div>
    </div>
  )
}
