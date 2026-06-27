import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, Megaphone } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageContainer } from '@/shared/shared/page-container'
import {
  createAnnouncement,
  updateAnnouncement,
  getAnnouncements,
  type AnnouncementDto,
} from '@/services/api/communications'

const audienceOptions = [
  { value: '', label: 'All Users' },
  { value: 'Training', label: 'Training' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Operations', label: 'Operations' },
]

export default function CreateAnnouncement() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [priority, setPriority] = useState('Normal')
  const [targetAudience, setTargetAudience] = useState('')
  const [validFrom, setValidFrom] = useState(new Date().toISOString().split('T')[0])
  const [validTo, setValidTo] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (id) {
        await updateAnnouncement(id, {
          title,
          body,
          priority,
          targetAudience: targetAudience || null,
          validFrom: new Date(validFrom).toISOString(),
          validTo: new Date(validTo).toISOString(),
        })
      } else {
        await createAnnouncement({
          title,
          body,
          priority,
          targetAudience: targetAudience || null,
          validFrom: new Date(validFrom).toISOString(),
          validTo: new Date(validTo).toISOString(),
        })
      }
      navigate('/announcements')
    } catch {
      setError('Failed to save announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer title={id ? 'Edit Announcement' : 'Create Announcement'} status={error ? 'error' : 'success'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">{id ? 'Edit Announcement' : 'Create Announcement'}</h1>
          </div>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />{loading ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Announcement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Announcement title" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body">Body *</Label>
              <Textarea
                id="body"
                value={body}
                onChange={e => setBody(e.target.value)}
                required
                rows={6}
                placeholder="Announcement content..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger id="audience"><SelectValue placeholder="All Users" /></SelectTrigger>
                  <SelectContent>
                    {audienceOptions.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input id="validFrom" type="date" value={validFrom} onChange={e => setValidFrom(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="validTo">Valid To *</Label>
                <Input id="validTo" type="date" value={validTo} onChange={e => setValidTo(e.target.value)} required />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </PageContainer>
  )
}
