import { useEffect, useRef, useState, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/store/authStore'

interface UseHelpdeskHubOptions {
  onToken?: (token: string) => void
  onMessageComplete?: (data: { conversationId: string; tokensUsed: number }) => void
  onError?: (error: string) => void
}

export function useHelpdeskHub(options: UseHelpdeskHubOptions = {}) {
  const [connected, setConnected] = useState(false)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const token = useAuthStore((s: any) => s.token)

  useEffect(() => {
    if (!token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/helpdesk', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build()

    connection.on('ReceiveToken', (token: string) => {
      options.onToken?.(token)
    })

    connection.on('MessageComplete', (data: { conversationId: string; tokensUsed: number }) => {
      options.onMessageComplete?.(data)
    })

    connection.on('Error', (error: string) => {
      options.onError?.(error)
    })

    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => setConnected(true))
    connection.onclose(() => setConnected(false))

    connection.start()
      .then(() => setConnected(true))
      .catch(err => console.error('SignalR connection failed:', err))

    connectionRef.current = connection

    return () => {
      connection.stop()
      connectionRef.current = null
    }
  }, [token])

  const sendMessage = useCallback(async (conversationId: string, message: string) => {
    const conn = connectionRef.current
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected')
    }
    await conn.invoke('SendMessage', conversationId, message)
  }, [])

  const startConversation = useCallback(async (topic: string): Promise<string> => {
    const conn = connectionRef.current
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR not connected')
    }
    return await conn.invoke('StartConversation', topic)
  }, [])

  return { connected, sendMessage, startConversation }
}
