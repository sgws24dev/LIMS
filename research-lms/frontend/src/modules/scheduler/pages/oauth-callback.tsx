import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { connectCalendar } from '@/services/api/scheduling'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      setStatus('error')
      setErrorMsg('No authorization code received.')
      return
    }

    let redirectUri = ''
    try {
      const stateData = state ? JSON.parse(state) : {}
      redirectUri = stateData.redirectUri || `${window.location.origin}/scheduler/calendar-sync/callback`
    } catch {
      redirectUri = `${window.location.origin}/scheduler/calendar-sync/callback`
    }

    connectCalendar(code, redirectUri)
      .then(() => {
        setStatus('success')
        toast({ title: 'Calendar connected successfully', variant: 'success' })
        setTimeout(() => navigate('/scheduler/calendar-sync', { replace: true }), 2000)
      })
      .catch((err) => {
        setStatus('error')
        setErrorMsg(err?.response?.data?.error || err?.message || 'Failed to connect calendar.')
        toast({ title: 'Failed to connect calendar', variant: 'destructive' })
      })
  }, [searchParams, navigate, toast])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Connecting your calendar...</h2>
            <p className="text-muted-foreground">Please wait while we complete the setup.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
            <h2 className="text-xl font-semibold">Calendar Connected!</h2>
            <p className="text-muted-foreground">Redirecting to sync settings...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto text-red-500" />
            <h2 className="text-xl font-semibold">Connection Failed</h2>
            <p className="text-muted-foreground">{errorMsg}</p>
            <button
              className="text-sm text-primary underline"
              onClick={() => navigate('/scheduler/calendar-sync', { replace: true })}
            >
              Back to settings
            </button>
          </>
        )}
      </div>
    </div>
  )
}
