import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar'
import { useToast } from '@/shared/hooks/use-toast'
import { useUIStore } from '@/store/uiStore'

interface IssueCommentDto {
  id: string
  content: string
  authorName: string
  createdAt: string
}

interface IssueCommentThreadProps {
  issueId: string
}

export function IssueCommentThread({ issueId: _issueId }: IssueCommentThreadProps) {
  const [comments, setComments] = useState<IssueCommentDto[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!newComment.trim()) return
    setLoading(true)
    try {
      const comment: IssueCommentDto = {
        id: crypto.randomUUID(),
        content: newComment.trim(),
        authorName: 'Current User',
        createdAt: new Date().toISOString(),
      }
      setComments((prev) => [...prev, comment])
      setNewComment('')
      toast({ title: 'Comment added' })
    } catch {
      toast({ title: 'Error', description: 'Failed to add comment.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">Comments ({comments.length})</h3>
      <div className="space-y-4 mb-4 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {comment.authorName?.charAt(0).toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.authorName}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2 border-t pt-4">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={2}
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={loading || !newComment.trim()}>
            {loading ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </div>
  )
}
