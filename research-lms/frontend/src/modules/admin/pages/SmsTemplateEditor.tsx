import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Send, MessageSquare } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Label } from '@/shared/ui/label'
import { Switch } from '@/shared/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageContainer } from '@/shared/shared/page-container'
import {
  getNotificationTemplates,
  updateNotificationTemplate,
  sendTestNotification,
  type NotificationTemplateDto,
} from '@/services/api/communications'

const PLACEHOLDERS = [
  '{{userName}}', '{{competencyName}}', '{{expiryDate}}',
  '{{bookingDate}}', '{{instrumentName}}', '{{otpCode}}',
]

export default function SmsTemplateEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<NotificationTemplateDto[]>([])
  const [template, setTemplate] = useState<NotificationTemplateDto | null>(null)
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testPhone, setTestPhone] = useState('')
  const [sendingTest, setSendingTest] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getNotificationTemplates()
      const smsTemplates = result.items.filter(t => t.channel === 'Sms')
      setTemplates(smsTemplates)

      const current = id ? smsTemplates.find(t => t.id === id) : smsTemplates[0]
      if (current) {
        setTemplate(current)
        setBody(current.body)
        setName(current.name)
        setIsDefault(current.isDefault)
      }
    } catch {
      setError('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async () => {
    if (!template) return
    setSaving(true)
    try {
      await updateNotificationTemplate(template.id, {
        name,
        channel: 'Sms',
        subject: body,
        body,
        isDefault,
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestSend = async () => {
    if (!template || !testPhone) return
    setSendingTest(true)
    try {
      await sendTestNotification(template.id, { phoneNumber: testPhone })
    } finally {
      setSendingTest(false)
    }
  }

  const insertPlaceholder = (placeholder: string) => {
    setBody(prev => prev + placeholder)
  }

  return (
    <PageContainer title="SMS Template Editor" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">SMS Template Editor</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map(t => (
                <Button
                  key={t.id}
                  variant={template?.id === t.id ? 'default' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setTemplate(t)
                    setBody(t.body)
                    setName(t.name)
                    setIsDefault(t.isDefault)
                    navigate(`/admin/notifications/templates/sms/${t.id}`)
                  }}
                >
                  {t.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {template && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Template Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={isDefault} onCheckedChange={setIsDefault} />
                      <Label>Default Template</Label>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Body</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground mr-2 self-center">Placeholders:</span>
                      {PLACEHOLDERS.map(p => (
                        <Button key={p} variant="outline" size="sm" onClick={() => insertPlaceholder(p)} className="text-xs">
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Character count: {body.length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Send</CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Input
                      placeholder="Enter phone number..."
                      value={testPhone}
                      onChange={e => setTestPhone(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="secondary" onClick={handleTestSend} disabled={sendingTest || !testPhone}>
                      <Send className="h-4 w-4 mr-2" />{sendingTest ? 'Sending...' : 'Send Test'}
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
