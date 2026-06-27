import { useState, useEffect } from 'react'
import { BarChart3, Clock, Ticket, MessageSquare, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/shared/shared/page-container'
import { Card } from '@/shared/ui/card'
import { getHelpdeskMetrics, type HelpdeskMetricsDto } from '@/services/api/ai'

export default function HelpdeskSlaDashboard() {
  const [metrics, setMetrics] = useState<HelpdeskMetricsDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      setLoading(true)
      const data = await getHelpdeskMetrics()
      setMetrics(data)
    } catch {
      setError('Failed to load SLA metrics.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <PageContainer title="Helpdesk SLA Dashboard"><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading metrics...</p></div></PageContainer>
  if (error) return <PageContainer title="Helpdesk SLA Dashboard"><div className="flex items-center justify-center h-64"><p className="text-destructive">{error}</p></div></PageContainer>
  if (!metrics) return null

  const slaCards = [
    { label: 'Avg First Response', value: `${metrics.avgFirstResponseTimeHours.toFixed(1)}h`, icon: Clock, color: 'text-blue-500' },
    { label: 'Avg Resolution Time', value: `${metrics.avgResolutionTimeHours.toFixed(1)}h`, icon: Clock, color: 'text-green-500' },
    { label: 'Open Conversations', value: metrics.openConversations, icon: MessageSquare, color: 'text-amber-500' },
    { label: 'Open Tickets', value: metrics.openTickets, icon: Ticket, color: 'text-red-500' },
    { label: 'Total Conversations', value: metrics.totalConversations, icon: MessageSquare, color: 'text-indigo-500' },
    { label: 'Total Tickets', value: metrics.totalTickets, icon: Ticket, color: 'text-purple-500' },
    { label: 'Tickets from Chat', value: metrics.ticketsCreatedFromChat, icon: BarChart3, color: 'text-cyan-500' },
  ]

  return (
    <PageContainer title="Helpdesk SLA Dashboard" description="Performance metrics and service level agreements">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {slaCards.map(card => {
            const Icon = card.icon
            return (
              <Card key={card.label} className="p-4 flex flex-col items-center justify-center text-center space-y-1">
                <Icon className={`h-6 w-6 ${card.color}`} />
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets by Status
            </h3>
            <div className="space-y-2">
              {Object.entries(metrics.ticketsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(count / metrics.totalTickets) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Tickets by Priority
            </h3>
            <div className="space-y-2">
              {Object.entries(metrics.ticketsByPriority).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{priority}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          priority === 'critical' ? 'bg-red-500' :
                          priority === 'high' ? 'bg-orange-500' :
                          priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(count / metrics.totalTickets) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
