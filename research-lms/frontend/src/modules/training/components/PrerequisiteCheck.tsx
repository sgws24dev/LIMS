import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { validatePrerequisites, type PrerequisiteResult } from '@/services/api/training'

interface PrerequisiteCheckProps {
  userId: string
  instrumentId: string
  onValidationComplete?: (isAllowed: boolean) => void
}

export default function PrerequisiteCheck({ userId, instrumentId, onValidationComplete }: PrerequisiteCheckProps) {
  const [result, setResult] = useState<PrerequisiteResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function check() {
      setLoading(true)
      try {
        const res = await validatePrerequisites({ userId, instrumentId })
        if (!cancelled) {
          setResult(res)
          onValidationComplete?.(res.isAllowed)
        }
      } catch {
        if (!cancelled) {
          setResult({ isAllowed: true, unmetPrerequisites: [] })
          onValidationComplete?.(true)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [userId, instrumentId, onValidationComplete])

  if (loading) return null
  if (!result || result.isAllowed) return null

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <CardTitle className="text-sm font-medium text-red-800 dark:text-red-400">Prerequisites Not Met</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {result.unmetPrerequisites.map((p, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-0.5 text-red-500">{'\u2022'}</span>
              <div>
                <p className="font-medium text-red-800 dark:text-red-400">{p.competencyName}</p>
                {p.expiresAt && (
                  <p className="text-xs text-red-600 dark:text-red-500">Expired: {new Date(p.expiresAt).toLocaleDateString()}</p>
                )}
                <p className="text-xs text-red-600 dark:text-red-500">{p.suggestedAction}</p>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" className="mt-2 border-red-300 text-red-700 hover:bg-red-100" onClick={() => window.location.href = '/training'}>
            <ExternalLink className="h-3 w-3 mr-1" />Go to Training Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
