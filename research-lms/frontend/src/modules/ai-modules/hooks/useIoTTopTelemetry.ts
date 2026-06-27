import { useState, useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '@/store/authStore'

interface TelemetryPoint {
  instrumentId: string
  metric: string
  value: number
  unit: string
  timestamp: string
}

interface UseIoTTopTelemetryOptions {
  instrumentId: string
  onTelemetry?: (point: TelemetryPoint) => void
  onAlert?: (alert: { type: string; message: string }) => void
}

export function useIoTTopTelemetry(options: UseIoTTopTelemetryOptions) {
  const [connected, setConnected] = useState(false)
  const [latestReadings, setLatestReadings] = useState<Record<string, TelemetryPoint>>({})
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const token = useAuthStore((s: any) => s.token)

  useEffect(() => {
    if (!token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/telemetry', {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build()

    connection.on('TelemetryUpdate', (point: TelemetryPoint) => {
      if (point.instrumentId === options.instrumentId) {
        setLatestReadings(prev => ({ ...prev, [point.metric]: point }))
        options.onTelemetry?.(point)
      }
    })

    connection.on('Alert', (alert: { type: string; message: string }) => {
      if (alert.type === 'instrument') {
        options.onAlert?.(alert)
      }
    })

    connection.onreconnecting(() => setConnected(false))
    connection.onreconnected(() => setConnected(true))
    connection.onclose(() => setConnected(false))

    connection.start()
      .then(() => setConnected(true))
      .catch(err => console.error('Telemetry SignalR connection failed:', err))

    connectionRef.current = connection

    return () => {
      connection.stop()
      connectionRef.current = null
    }
  }, [token, options.instrumentId])

  const subscribe = useCallback(async () => {
    const conn = connectionRef.current
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Telemetry hub not connected')
    }
    await conn.invoke('SubscribeToInstrument', options.instrumentId)
  }, [options.instrumentId])

  const unsubscribe = useCallback(async () => {
    const conn = connectionRef.current
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return
    await conn.invoke('UnsubscribeFromInstrument', options.instrumentId)
  }, [options.instrumentId])

  return { connected, latestReadings, subscribe, unsubscribe }
}
