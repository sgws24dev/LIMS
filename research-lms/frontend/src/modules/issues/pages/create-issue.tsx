import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '@/store/uiStore'
import { PageContainer } from '@/shared/shared/page-container'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useToast } from '@/hooks/use-toast'
import { createIssue, syncIssueToExternal } from '@/services/api/projects'
import { useAuthStore } from '@/store/authStore'
import { Bold, Italic, List, ListOrdered, Code, Minus } from 'lucide-react'

export default function CreateIssuePage() {
  const navigate = useNavigate()
  const { setBreadcrumbs } = useUIStore()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [syncToServiceNow, setSyncToServiceNow] = useState(false)
  const [syncToJira, setSyncToJira] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
  })

  useState(() => {
    setBreadcrumbs([{ label: 'Issues' }, { label: 'New Issue' }])
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    const form = new FormData(e.currentTarget)

    try {
      const issueId = await createIssue({
        title: form.get('title') as string,
        description: editor?.getHTML() || undefined,
        severity: (form.get('severity') as string) as any || 'Minor',
        type: (form.get('type') as string) as any || 'Bug',
        priority: (form.get('priority') as string) as any || 'Medium',
        projectId: (form.get('projectId') as string) || undefined,
        workOrderId: (form.get('workOrderId') as string) || undefined,
        assignedToName: (form.get('assignedToName') as string) || undefined,
        reportedById: user.id,
        reportedByName: user.fullName,
        dueDate: (form.get('dueDate') as string) || undefined,
        tags: (form.get('tags') as string) || undefined,
      })

      if (syncToServiceNow) {
        await syncIssueToExternal(issueId, 'ServiceNow')
      }
      if (syncToJira) {
        await syncIssueToExternal(issueId, 'Jira')
      }

      toast({ title: 'Issue created', variant: 'success' })
      navigate(`/issues/${issueId}`)
    } catch {
      toast({ title: 'Failed to create issue', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageContainer title="Create Issue" description="Report a bug, feature request, or support ticket" status="success"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate('/issues')}>
          Cancel
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" name="title" required maxLength={300} />
        </div>

        <div>
          <Label>Description</Label>
          <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
            <div className="flex items-center gap-1 p-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor?.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                <Bold className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor?.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                <Italic className="h-4 w-4" />
              </button>
              <span className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
              <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor?.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                <List className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor?.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                <ListOrdered className="h-4 w-4" />
              </button>
              <span className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
              <button type="button" onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${editor?.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''}`}>
                <Code className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                <Minus className="h-4 w-4" />
              </button>
            </div>
            <EditorContent editor={editor} className="p-3 min-h-[200px] prose dark:prose-invert max-w-none" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="severity">Severity</Label>
            <Select name="severity" defaultValue="Minor">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Major">Major</SelectItem>
                <SelectItem value="Minor">Minor</SelectItem>
                <SelectItem value="Enhancement">Enhancement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue="Bug">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Documentation">Documentation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue="Medium">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectId">Project (optional)</Label>
            <Input id="projectId" name="projectId" placeholder="Project ID" />
          </div>
          <div>
            <Label htmlFor="workOrderId">Work Order (optional)</Label>
            <Input id="workOrderId" name="workOrderId" placeholder="Work Order ID" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="assignedToName">Assignee</Label>
            <Input id="assignedToName" name="assignedToName" />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" />
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" name="tags" placeholder="e.g. ui, performance" />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-semibold">External Sync</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={syncToServiceNow} onChange={(e) => setSyncToServiceNow(e.target.checked)}
              className="rounded border-gray-300" />
            <span className="text-sm">Sync to ServiceNow after creation</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={syncToJira} onChange={(e) => setSyncToJira(e.target.checked)}
              className="rounded border-gray-300" />
            <span className="text-sm">Sync to Jira after creation</span>
          </label>
        </div>

        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          Create Issue
        </Button>
      </form>
    </PageContainer>
  )
}
