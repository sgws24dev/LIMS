import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Megaphone, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { PageContainer } from '@/shared/shared/page-container'
import {
  getAnnouncements,
  deleteAnnouncement,
  type AnnouncementDto,
} from '@/services/api/communications'

const priorityColors: Record<string, string> = {
  Low: 'bg-gray-100 text-gray-800',
  Normal: 'bg-blue-100 text-blue-800',
  High: 'bg-yellow-100 text-yellow-800',
  Urgent: 'bg-red-100 text-red-800',
}

export default function AnnouncementsList() {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [audienceFilter, setAudienceFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAnnouncements({
        minPriority: priorityFilter || undefined,
        audience: audienceFilter || undefined,
      })
      setAnnouncements(result.items)
    } catch {
      setError('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [priorityFilter, audienceFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    await deleteAnnouncement(id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  const filtered = announcements.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.body.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageContainer title="Announcements" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Announcements</h1>
          </div>
          <Button onClick={() => navigate('/announcements/create')}>
            <Plus className="h-4 w-4 mr-2" />Create Announcement
          </Button>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Search announcements..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <Select value={audienceFilter} onValueChange={setAudienceFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All Audiences" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Audiences</SelectItem>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filtered.map(a => (
                <div key={a.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={priorityColors[a.priority] || ''}>{a.priority}</Badge>
                        {a.targetAudience && (
                          <Badge variant="outline">{a.targetAudience}</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-semibold">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.body}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>From: {format(new Date(a.validFrom), 'MMM d, yyyy')}</span>
                        <span>To: {format(new Date(a.validTo), 'MMM d, yyyy')}</span>
                        <span>Created: {format(new Date(a.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => navigate(`/announcements/${a.id}/edit`)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2" />
                  <p>No announcements found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
