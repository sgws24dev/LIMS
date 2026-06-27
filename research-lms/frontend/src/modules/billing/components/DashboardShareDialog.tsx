import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import { updateDashboardSharing } from '@/services/api/billing'
import { X, Plus } from 'lucide-react'

interface Props {
  dashboardId: string
  dashboardName: string
  currentSharedWith: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface SharedUser {
  userId: string
  email: string
  permission: 'View' | 'Edit'
}

export default function DashboardShareDialog({ dashboardId, dashboardName, currentSharedWith, open, onOpenChange }: Props) {
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>(() => {
    try {
      return currentSharedWith ? JSON.parse(currentSharedWith) as SharedUser[] : []
    } catch {
      return []
    }
  })
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addUser = () => {
    if (!email.trim()) return
    setSharedUsers(prev => [...prev, { userId: crypto.randomUUID(), email: email.trim(), permission: 'View' }])
    setEmail('')
  }

  const removeUser = (userId: string) => {
    setSharedUsers(prev => prev.filter(u => u.userId !== userId))
  }

  const togglePermission = (userId: string) => {
    setSharedUsers(prev => prev.map(u =>
      u.userId === userId ? { ...u, permission: u.permission === 'View' ? 'Edit' : 'View' } : u
    ))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const sharedWith = sharedUsers.length > 0 ? JSON.stringify(sharedUsers) : null
      await updateDashboardSharing(dashboardId, sharedWith)
      onOpenChange(false)
    } catch {
      setError('Failed to update sharing')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Dashboard</DialogTitle>
          <DialogDescription>Share "{dashboardName}" with other users</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email address..."
              onKeyDown={e => e.key === 'Enter' && addUser()}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addUser} disabled={!email.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>

          {sharedUsers.length > 0 ? (
            <div className="space-y-2">
              <Label>Shared with</Label>
              {sharedUsers.map(u => (
                <div key={u.userId} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{u.email}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-6 px-2"
                      onClick={() => togglePermission(u.userId)}
                    >
                      {u.permission}
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => removeUser(u.userId)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not shared with anyone yet</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Sharing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
