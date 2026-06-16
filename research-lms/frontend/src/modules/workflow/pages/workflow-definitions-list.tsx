import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  WorkflowDefinitionDto,
  getWorkflowDefinitions,
  publishWorkflowDefinition,
  unpublishWorkflowDefinition,
  deleteWorkflowDefinition,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

export default function WorkflowDefinitionsListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [definitions, setDefinitions] = useState<WorkflowDefinitionDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDefinitions()
  }, [])

  async function loadDefinitions() {
    try {
      const data = await getWorkflowDefinitions()
      setDefinitions(data)
    } catch {
      toast({ title: 'Error', description: 'Failed to load workflow definitions', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handlePublish(def: WorkflowDefinitionDto) {
    try {
      if (def.isPublished) {
        await unpublishWorkflowDefinition(def.id, 'current-user')
        toast({ title: 'Unpublished', description: `"${def.name}" unpublished` })
      } else {
        await publishWorkflowDefinition(def.id, 'current-user')
        toast({ title: 'Published', description: `"${def.name}" published` })
      }
      loadDefinitions()
    } catch {
      toast({ title: 'Error', description: 'Failed to update publish status', variant: 'destructive' })
    }
  }

  async function handleDelete(def: WorkflowDefinitionDto) {
    if (!confirm(`Delete "${def.name}"?`)) return
    try {
      await deleteWorkflowDefinition(def.id, 'current-user')
      toast({ title: 'Deleted', description: `"${def.name}" deleted` })
      loadDefinitions()
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const filtered = definitions.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.entityTypeHint || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflow Definitions</h1>
        <Button onClick={() => navigate('/workflow/designer/new')}>
          <Plus className="h-4 w-4 mr-2" /> New Workflow
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No workflow definitions found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((def) => (
            <Card key={def.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{def.name}</CardTitle>
                    {def.description && (
                      <p className="text-sm text-gray-500 mt-1">{def.description}</p>
                    )}
                  </div>
                  <Badge variant={def.isPublished ? 'default' : 'secondary'}>
                    {def.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">v{def.version}</Badge>
                  {def.entityTypeHint && (
                    <Badge variant="outline">{def.entityTypeHint}</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/workflow/designer/${def.id}`)}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(def)}
                  >
                    {def.isPublished ? (
                      <XCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    )}
                    {def.isPublished ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(def)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
