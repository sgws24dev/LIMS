import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getFormDefinitions,
  deleteFormDefinition,
  publishFormDefinition,
  FormDefinitionDto,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { useToast } from '@/shared/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export default function FormListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [forms, setForms] = useState<FormDefinitionDto[]>([])

  useEffect(() => {
    const tenantId = '00000000-0000-0000-0000-000000000001'
    getFormDefinitions(tenantId).then(setForms)
  }, [])

  const handlePublish = async (id: string) => {
    try {
      await publishFormDefinition(id)
      toast({ title: 'Published', description: 'Form has been published.' })
      const tenantId = '00000000-0000-0000-0000-000000000001'
      const updated = await getFormDefinitions(tenantId)
      setForms(updated)
    } catch {
      toast({ title: 'Error', description: 'Failed to publish form.', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return
    try {
      await deleteFormDefinition(id)
      toast({ title: 'Deleted', description: 'Form has been deleted.' })
      setForms((prev) => prev.filter((f) => f.id !== id))
    } catch {
      toast({
        title: 'Error',
        description: 'Cannot delete form with active requests.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Form Definitions</h1>
        <Button onClick={() => navigate('/requests/forms/new')}>Create Form</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No forms found.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((form) => (
                  <TableRow key={form.id}>
                    <TableCell className="font-medium">{form.title}</TableCell>
                    <TableCell>{form.category}</TableCell>
                    <TableCell>v{form.version}</TableCell>
                    <TableCell>
                      <Badge className={
                        form.status === 'Published' ? 'bg-green-100 text-green-800' :
                        form.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {form.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/requests/forms/${form.id}`)}
                        >
                          Edit
                        </Button>
                        {form.status === 'Draft' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePublish(form.id)}
                          >
                            Publish
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(form.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
