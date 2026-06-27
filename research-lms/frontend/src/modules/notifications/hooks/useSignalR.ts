import { useEffect, useRef, useCallback, useState } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/store/authStore'

interface NotificationPayload {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function useSignalR(onNotification?: (notification: NotificationPayload) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const [connected, setConnected] = useState(false)
  const token = useAuthStore(s => s.token)

  const startConnection = useCallback(async () => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notifications', {
        accessTokenFactory: () => token ?? ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build()

    connection.on('ReceiveNotification', (notification: NotificationPayload) => {
      onNotification?.(notification)
    })

    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => setConnected(true))
    connection.onclose(() => setConnected(false))

    try {
      await connection.start()
      setConnected(true)
    } catch {
      setConnected(false)
    }

    connectionRef.current = connection
  }, [token, onNotification])

  useEffect(() => {
    if (token) {
      startConnection()
    }
    return () => {
      connectionRef.current?.stop()
    }
  }, [token, startConnection])

  return { connected }
}
