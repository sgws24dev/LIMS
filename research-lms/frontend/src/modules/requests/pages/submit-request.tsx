import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getFormDefinitions, getFormDefinitionById, createServiceRequest, submitServiceRequest } from '@/services/api/serviceWorkflow'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useToast } from '@/shared/hooks/use-toast'
import DynamicFormRenderer, { parseFields } from '../components/dynamic-form-renderer'

export default function SubmitRequestPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [forms, setForms] = useState<{ id: string; title: string }[]>([])
  const [selectedFormId, setSelectedFormId] = useState(formId || '')
  const [formSchema, setFormSchema] = useState('')
  const [formVersion, setFormVersion] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [approvalRouting, setApprovalRouting] = useState('ChainOfCommand')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const tenantId = '00000000-0000-0000-0000-000000000001'
    getFormDefinitions(tenantId, true).then((published) => {
      setForms(published.map((f) => ({ id: f.id, title: f.title })))
    })
  }, [])

  useEffect(() => {
    if (selectedFormId) {
      getFormDefinitionById(selectedFormId).then((form) => {
        setFormSchema(form.schema)
        setFormVersion(form.version)
      })
    }
  }, [selectedFormId])

  const handleFormSubmit = async (formData: Record<string, unknown>) => {
    if (!selectedFormId || !title) {
      toast({ title: 'Validation', description: 'Please select a form and provide a title.', variant: 'destructive' })
      return
    }

    setSubmitting(true)
    try {
      const request = await createServiceRequest({
        formDefinitionId: selectedFormId,
        title,
        description: description || undefined,
        formData: JSON.stringify(formData),
        approvalRouting,
      })

      await submitServiceRequest(request.id)
      toast({ title: 'Submitted', description: 'Service request has been submitted.' })
      navigate(`/requests/${request.id}`)
    } catch {
      toast({ title: 'Error', description: 'Failed to submit request.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const fields = formSchema ? parseFields(formSchema) : []

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Submit Service Request</h1>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Form Template *</Label>
            <Select value={selectedFormId} onValueChange={setSelectedFormId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a form..." />
              </SelectTrigger>
              <SelectContent>
                {forms.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Request Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter request title" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <div>
            <Label>Approval Routing</Label>
            <Select value={approvalRouting} onValueChange={setApprovalRouting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ChainOfCommand">Chain of Command (sequential)</SelectItem>
                <SelectItem value="Parallel">Parallel (all must approve)</SelectItem>
                <SelectItem value="AnyOf">Any Of (first response decides)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formVersion > 0 && (
            <p className="text-sm text-muted-foreground">
              Form version: {formVersion}
            </p>
          )}
        </CardContent>
      </Card>

      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Form Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <DynamicFormRenderer
              fields={fields}
              onSubmit={handleFormSubmit}
              submitLabel={submitting ? 'Submitting...' : 'Submit Request'}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
