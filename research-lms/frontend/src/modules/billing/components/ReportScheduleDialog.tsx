import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'
import {
  getReportSchedules,
  createReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  type ReportScheduleDto,
} from '@/services/api/billing'
import { Clock, Plus, Trash2, Calendar } from 'lucide-react'

const CRON_PRESETS = [
  { label: 'Daily at 8 AM', value: '0 8 * * *' },
  { label: 'Daily at 5 PM', value: '0 17 * * *' },
  { label: 'Weekly Monday 9 AM', value: '0 9 * * 1' },
  { label: 'Weekly Friday 4 PM', value: '0 16 * * 5' },
  { label: 'Monthly 1st 8 AM', value: '0 8 1 * *' },
  { label: 'Monthly 15th 8 AM', value: '0 8 15 * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every hour', value: '0 * * * *' },
]

interface Props {
  reportDefinitionId: string
  reportDefinitionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ReportScheduleDialog({ reportDefinitionId, reportDefinitionName, open, onOpenChange }: Props) {
  const [schedules, setSchedules] = useState<ReportScheduleDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cronExpression, setCronExpression] = useState('0 8 * * *')
  const [timeZoneId, setTimeZoneId] = useState('UTC')
  const [format, setFormat] = useState('Pdf')
  const [recipientEmails, setRecipientEmails] = useState('')
  const [subject, setSubject] = useState('{{ReportName}} - {{Date}}')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchSchedules = async () => {
    setLoading(true)
    try {
      const all = await getReportSchedules()
      setSchedules(all.filter(s => s.reportDefinitionId === reportDefinitionId))
    } catch {
      setError('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchSchedules()
  }, [open, reportDefinitionId])

  const resetForm = () => {
    setCronExpression('0 8 * * *')
    setTimeZoneId('UTC')
    setFormat('Pdf')
    setRecipientEmails('')
    setSubject('{{ReportName}} - {{Date}}')
    setEditingId(null)
  }

  const handleEdit = (s: ReportScheduleDto) => {
    setEditingId(s.id)
    setCronExpression(s.cronExpression)
    setTimeZoneId(s.timeZoneId)
    setFormat(s.format)
    setRecipientEmails(JSON.parse(s.recipients).join(', '))
    setSubject(s.subject)
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const recipients = JSON.stringify(recipientEmails.split(',').map(e => e.trim()).filter(Boolean))
      const payload = {
        reportDefinitionId,
        cronExpression,
        timeZoneId,
        format,
        recipients,
        subject,
      }
      if (editingId) {
        const existing = schedules.find(s => s.id === editingId)
        await updateReportSchedule(editingId, { id: editingId, ...payload, isActive: existing?.isActive ?? true })
      } else {
        await createReportSchedule(payload)
      }
      resetForm()
      await fetchSchedules()
    } catch {
      setError('Failed to save schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReportSchedule(id)
      await fetchSchedules()
    } catch {
      setError('Failed to delete schedule')
    }
  }



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule Report</DialogTitle>
          <DialogDescription>Configure automated delivery for "{reportDefinitionName}"</DialogDescription>
        </DialogHeader>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {schedules.length > 0 && (
          <div className="space-y-2 mb-3">
            <Label>Existing Schedules</Label>
            {schedules.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    {s.cronExpression}
                    <span className={`ml-2 text-xs ${s.isActive ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {s.isActive ? 'Active' : 'Paused'}
                    </span>
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(s)}>
                    <Calendar className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <Label>Cron Expression</Label>
            <div className="flex gap-2">
              <Input value={cronExpression} onChange={e => setCronExpression(e.target.value)} placeholder="0 8 * * *" className="flex-1 font-mono" />
              <Select value={cronExpression} onValueChange={setCronExpression}>
                <SelectTrigger className="w-44"><SelectValue placeholder="Preset" /></SelectTrigger>
                <SelectContent>
                  {CRON_PRESETS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Time Zone</Label>
              <Select value={timeZoneId} onValueChange={setTimeZoneId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="US/Eastern">US/Eastern</SelectItem>
                  <SelectItem value="US/Central">US/Central</SelectItem>
                  <SelectItem value="US/Mountain">US/Mountain</SelectItem>
                  <SelectItem value="US/Pacific">US/Pacific</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Csv">CSV</SelectItem>
                  <SelectItem value="Pdf">PDF</SelectItem>
                  <SelectItem value="Xlsx">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Recipients (comma separated)</Label>
            <Input value={recipientEmails} onChange={e => setRecipientEmails(e.target.value)} placeholder="user@example.com, admin@example.com" />
          </div>

          <div>
            <Label>Subject (use {'{'}ReportName{'}'} and {'{'}Date{'}'})</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false) }}>Close</Button>
          <Button onClick={handleSave} disabled={saving || !cronExpression || !recipientEmails}>
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
