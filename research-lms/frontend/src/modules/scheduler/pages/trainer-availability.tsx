import { useEffect, useState, useCallback } from 'react'
import moment from 'moment'
import { useUIStore } from '@/store/uiStore'
import { PageContainer, type PageStatus } from '@/shared/shared/page-container'
import {
  getTrainerAvailability, addTrainerAvailability, updateTrainerAvailability,
  deleteTrainerAvailability,
  type TrainerAvailabilityDto, type AddTrainerAvailabilityRequest,
} from '@/services/api/scheduling'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/shared/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/shared/ui/dialog'
import { Switch } from '@/shared/ui/switch'
import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from '@/shared/ui/table'
import { Plus, Pencil, Trash2, RotateCw, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const SOURCE_LABELS: Record<string, string> = { Manual: 'Manual', CalendarSync: 'Calendar Sync' }

export default function TrainerAvailability() {
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading')
  const [items, setItems] = useState<TrainerAvailabilityDto[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TrainerAvailabilityDto | null>(null)
  const [form, setForm] = useState({
    dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00',
    isAvailable: true, effectiveFrom: moment().format('YYYY-MM-DD'), effectiveTo: '', notes: '',
  })

  useEffect(() => {
    setBreadcrumbs([{ label: 'Scheduling' }, { label: 'Trainer Availability' }])
  }, [setBreadcrumbs])

  const fetchData = useCallback(async () => {
    setPageStatus('loading')
    try {
      const data = await getTrainerAvailability()
      setItems(data)
      setPageStatus(data.length === 0 ? 'empty' : 'success')
    } catch {
      setPageStatus('error')
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({ dayOfWeek: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true, effectiveFrom: moment().format('YYYY-MM-DD'), effectiveTo: '', notes: '' })
    setDialogOpen(true)
  }

  const openEdit = (item: TrainerAvailabilityDto) => {
    setEditing(item)
    setForm({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime.slice(0, 5),
      endTime: item.endTime.slice(0, 5),
      isAvailable: item.isAvailable,
      effectiveFrom: item.effectiveFrom,
      effectiveTo: item.effectiveTo || '',
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editing) {
        await updateTrainerAvailability(editing.id, {
          startTime: form.startTime,
          endTime: form.endTime,
          isAvailable: form.isAvailable,
          effectiveTo: form.effectiveTo || undefined,
          notes: form.notes || undefined,
        })
        toast({ title: 'Availability updated', variant: 'success' })
      } else {
        const request: AddTrainerAvailabilityRequest = {
          dayOfWeek: form.dayOfWeek as DayOfWeek,
          startTime: form.startTime,
          endTime: form.endTime,
          isAvailable: form.isAvailable,
          effectiveFrom: form.effectiveFrom || undefined,
          effectiveTo: form.effectiveTo || undefined,
          notes: form.notes || undefined,
        }
        await addTrainerAvailability(request)
        toast({ title: 'Availability added', variant: 'success' })
      }
      setDialogOpen(false)
      fetchData()
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTrainerAvailability(id)
      toast({ title: 'Availability deleted', variant: 'success' })
      fetchData()
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const groupedItems = DAYS.map((day) => ({
    day,
    items: items
      .filter((i) => i.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }))

  return (
    <PageContainer
      title="Trainer Availability"
      description="Manage your weekly availability schedule"
      status={pageStatus}
      onRetry={fetchData}
      actions={
        <Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" />Add Availability</Button>
      }
    >
      <div className="space-y-6">
        {groupedItems.map(({ day, items: dayItems }) => (
          <div key={day}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {day}
            </h3>
            {dayItems.length === 0 ? (
              <p className="text-xs text-muted-foreground pl-6">No schedule set</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Effective From</TableHead>
                      <TableHead>Effective To</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-sm">
                          {item.startTime.slice(0, 5)} &ndash; {item.endTime.slice(0, 5)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isAvailable ? 'default' : 'secondary'}>
                            {item.isAvailable ? 'Available' : 'Blocked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {SOURCE_LABELS[item.source] || item.source}
                        </TableCell>
                        <TableCell className="text-xs">{item.effectiveFrom}</TableCell>
                        <TableCell className="text-xs">{item.effectiveTo || '-'}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate" title={item.notes}>
                          {item.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Availability' : 'Add Availability'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Day of Week</Label>
              <Select value={form.dayOfWeek} onValueChange={(v) => setForm({ ...form, dayOfWeek: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.isAvailable}
                onCheckedChange={(v) => setForm({ ...form, isAvailable: v })}
              />
              <Label className="cursor-pointer">{form.isAvailable ? 'Available' : 'Blocked'}</Label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Effective From</Label>
                <Input type="date" value={form.effectiveFrom} onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Effective To (optional)</Label>
                <Input type="date" value={form.effectiveTo} onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}

type DayOfWeek = typeof DAYS[number]
