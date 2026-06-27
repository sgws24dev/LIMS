import { useState, useEffect, useCallback } from 'react'
import { Save, Bell } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Switch } from '@/shared/ui/switch'
import { PageContainer } from '@/shared/shared/page-container'
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferenceDto,
} from '@/services/api/communications'

const allChannels = ['Email', 'SMS', 'Teams', 'InApp']

export default function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferenceDto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getNotificationPreferences()
      setPreferences(result.items)
    } catch {
      setError('Failed to load preferences')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const isChannelEnabled = (pref: NotificationPreferenceDto, channel: string) =>
    pref.channels.includes(channel)

  const toggleChannel = (pref: NotificationPreferenceDto, channel: string) => {
    setPreferences(prev =>
      prev.map(p =>
        p.id === pref.id
          ? {
              ...p,
              channels: isChannelEnabled(p, channel)
                ? p.channels.filter(c => c !== channel)
                : [...p.channels, channel],
            }
          : p
      )
    )
  }

  const toggleOptOut = (pref: NotificationPreferenceDto) => {
    setPreferences(prev =>
      prev.map(p =>
        p.id === pref.id ? { ...p, isOptedOut: !p.isOptedOut } : p
      )
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const pref of preferences) {
        await updateNotificationPreferences({
          notificationType: pref.notificationType,
          channels: pref.channels,
          isOptedOut: pref.isOptedOut,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer title="Notification Preferences" status={loading ? 'loading' : error ? 'error' : 'success'} onRetry={fetchData}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Notification Preferences</h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />{saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Channel Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm">Notification Type</th>
                    {allChannels.map(channel => (
                      <th key={channel} className="text-center py-3 px-4 font-medium text-sm">{channel}</th>
                    ))}
                    <th className="text-center py-3 px-4 font-medium text-sm">Opted Out</th>
                  </tr>
                </thead>
                <tbody>
                  {preferences.map(pref => (
                    <tr key={pref.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">{pref.notificationType}</td>
                      {allChannels.map(channel => (
                        <td key={channel} className="text-center py-3 px-4">
                          <Checkbox
                            checked={isChannelEnabled(pref, channel)}
                            onCheckedChange={() => toggleChannel(pref, channel)}
                            disabled={pref.isOptedOut}
                          />
                        </td>
                      ))}
                      <td className="text-center py-3 px-4">
                        <Switch checked={pref.isOptedOut} onCheckedChange={() => toggleOptOut(pref)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
