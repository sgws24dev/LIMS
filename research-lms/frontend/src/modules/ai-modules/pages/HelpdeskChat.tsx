import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Send, Loader2, MessageSquare, Plus, Ticket,
  ArrowLeft, Bot, User, FileUp
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { PageContainer } from '@/shared/shared/page-container'
import { useToast } from '@/shared/hooks/use-toast'
import { useHelpdeskHub } from '@/modules/ai-modules/hooks/useHelpdeskHub'
import { CreateTicketDialog } from '@/modules/ai-modules/components/helpdesk/CreateTicketDialog'
import {
  getConversations,
  getConversation,
  startConversation as startConversationApi,
  type ConversationDto,
  type MessageDto,
} from '@/services/api/ai'

export default function HelpdeskChat() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<ConversationDto[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [input, setInput] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showTicketDialog, setShowTicketDialog] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [newTopic, setNewTopic] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const onToken = useCallback((token: string) => {
    setStreamingContent(prev => prev + token)
  }, [])

  const onMessageComplete = useCallback(() => {
    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamingContent,
        tokensUsed: null,
        createdAt: new Date().toISOString()
      }
    ])
    setStreamingContent('')
    setSending(false)
    refreshConversations()
  }, [streamingContent])

  const { connected, sendMessage, startConversation } = useHelpdeskHub({
    onToken,
    onMessageComplete,
    onError: (error) => {
      toast({ title: 'Chat error', description: error, variant: 'destructive' })
      setSending(false)
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, streamingContent])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadConversations() }, [])

  useEffect(() => {
    const convId = searchParams.get('conversation')
    if (convId) {
      setActiveConversationId(convId)
      loadConversationMessages(convId)
    }
  }, [searchParams])

  const loadConversationMessages = async (id: string) => {
    try {
      const conv = await getConversation(id)
      if (conv) setMessages(conv.messages)
    } catch {
      toast({ title: 'Error', description: 'Failed to load conversation.', variant: 'destructive' })
    }
  }

  const handleStartConversation = async () => {
    if (!newTopic.trim()) return
    try {
      const id = await startConversation(newTopic.trim())
      setActiveConversationId(id)
      setMessages([])
      setShowNewChat(false)
      setNewTopic('')
      navigate(`/ai/helpdesk?conversation=${id}`, { replace: true })
      refreshConversations()
    } catch {
      toast({ title: 'Error', description: 'Failed to start conversation.', variant: 'destructive' })
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !activeConversationId || sending) return

    const userMessage: MessageDto = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      tokensUsed: null,
      createdAt: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setSending(true)
    setStreamingContent('')

    try {
      await sendMessage(activeConversationId, userMessage.content)
    } catch {
      toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' })
      setSending(false)
    }
  }

  const refreshConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch { /* ignore */ }
  }

  return (
    <PageContainer
      title="AI Helpdesk"
      description="Ask questions, get help, and create support tickets"
    >
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        <div className="w-72 flex-shrink-0 border rounded-lg bg-card flex flex-col">
          <div className="p-3 border-b">
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={() => setShowNewChat(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id)
                  loadConversationMessages(conv.id)
                  navigate(`/ai/helpdesk?conversation=${conv.id}`, { replace: true })
                }}
                className={`w-full text-left p-2 rounded-md text-sm transition-colors flex items-start gap-2 ${
                  activeConversationId === conv.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span className="truncate">{conv.topic}</span>
              </button>
            ))}
            {!loading && conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No conversations yet. Start a new chat!
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 border rounded-lg bg-card flex flex-col">
          {showNewChat ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="max-w-md w-full space-y-4">
                <h3 className="text-lg font-semibold">Start a new conversation</h3>
                <p className="text-sm text-muted-foreground">
                  What would you like help with today?
                </p>
                <Textarea
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="e.g., How do I book a mass spectrometer?"
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleStartConversation()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleStartConversation} disabled={!newTopic.trim()}>
                    Start Chat
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewChat(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : !activeConversationId ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">AI Helpdesk</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Select a conversation from the left or start a new chat.
                </p>
                <Button onClick={() => setShowNewChat(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  New Chat
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => navigate('/ai/helpdesk')}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {conversations.find(c => c.id === activeConversationId)?.topic || 'Chat'}
                  </span>
                  {!connected && (
                    <span className="text-xs text-amber-500 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Reconnecting...
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTicketDialog(true)}
                >
                  <Ticket className="mr-1 h-4 w-4" />
                  Create Ticket
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {streamingContent && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[75%] rounded-lg px-4 py-2 text-sm bg-muted">
                      <p className="whitespace-pre-wrap">{streamingContent}</p>
                      {sending && (
                        <span className="inline-block w-2 h-4 bg-primary/50 ml-1 animate-pulse" />
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={sending}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {activeConversationId && (
        <CreateTicketDialog
          open={showTicketDialog}
          onOpenChange={setShowTicketDialog}
          conversationId={activeConversationId}
          conversationSummary={messages.find(m => m.role === 'user')?.content || ''}
          onCreated={() => {
            toast({ title: 'Ticket created', description: 'Support ticket has been created.' })
            setShowTicketDialog(false)
          }}
        />
      )}
    </PageContainer>
  )
}
