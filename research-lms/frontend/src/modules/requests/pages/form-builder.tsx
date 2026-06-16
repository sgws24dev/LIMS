import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  FormDefinitionDto,
  getFormDefinitionById,
  createFormDefinition,
  updateFormDefinition,
  publishFormDefinition,
} from '@/services/api/serviceWorkflow'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useToast } from '@/shared/hooks/use-toast'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'

const DEFAULT_FIELD_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'number', label: 'Number' },
  { type: 'textarea', label: 'Textarea' },
  { type: 'date', label: 'Date' },
  { type: 'select', label: 'Select' },
  { type: 'multi-select', label: 'Multi Select' },
  { type: 'file-upload', label: 'File Upload' },
  { type: 'signature', label: 'Signature' },
  { type: 'repeatable-section', label: 'Repeatable Section' },
]

interface FieldDefinition {
  id: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

function buildJsonSchema(fields: FieldDefinition[]): string {
  const properties: Record<string, unknown> = {}
  const required: string[] = []

  for (const field of fields) {
    if (field.required) required.push(field.id)

    const prop: Record<string, unknown> = {
      title: field.label,
    }

    switch (field.type) {
      case 'text':
        prop.type = 'string'
        if (field.minLength) prop.minLength = field.minLength
        if (field.maxLength) prop.maxLength = field.maxLength
        if (field.placeholder) prop.description = field.placeholder
        break
      case 'number':
        prop.type = 'number'
        if (field.min !== undefined) prop.minimum = field.min
        if (field.max !== undefined) prop.maximum = field.max
        break
      case 'textarea':
        prop.type = 'string'
        prop.contentMediaType = 'text/plain'
        if (field.maxLength) prop.maxLength = field.maxLength
        break
      case 'date':
        prop.type = 'string'
        prop.format = 'date'
        break
      case 'select':
        prop.type = 'string'
        if (field.options?.length) {
          prop.enum = field.options.map((o) => o.value)
        }
        break
      case 'multi-select':
        prop.type = 'array'
        if (field.options?.length) {
          prop.items = { type: 'string', enum: field.options.map((o) => o.value) }
          prop.uniqueItems = true
        }
        break
      case 'file-upload':
        prop.type = 'string'
        prop.format = 'uri'
        prop.description = field.placeholder || 'Upload a file'
        break
      case 'signature':
        prop.type = 'string'
        prop.contentEncoding = 'base64'
        break
      case 'repeatable-section':
        prop.type = 'array'
        prop.items = {
          type: 'object',
          properties: {
            value: { type: 'string' },
          },
        }
        break
    }

    properties[field.id] = prop
  }

  const schema = {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  }

  return JSON.stringify(schema, null, 2)
}

function parseJsonSchema(schemaJson: string): FieldDefinition[] {
  try {
    const schema = JSON.parse(schemaJson)
    const fields: FieldDefinition[] = []

    if (!schema.properties) return fields

    for (const [key, prop] of Object.entries(schema.properties)) {
      const p = prop as Record<string, unknown>
      const type = inferFieldType(p)
      const field: FieldDefinition = {
        id: key,
        type,
        label: (p.title as string) || key,
        required: Array.isArray(schema.required) && schema.required.includes(key),
      }

      if (p.minimum !== undefined) field.min = p.minimum as number
      if (p.maximum !== undefined) field.max = p.maximum as number
      if (p.minLength !== undefined) field.minLength = p.minLength as number
      if (p.maxLength !== undefined) field.maxLength = p.maxLength as number
      if (p.description) field.placeholder = p.description as string

      if (type === 'select' || type === 'multi-select') {
        if (type === 'select' && Array.isArray(p.enum)) {
          field.options = (p.enum as string[]).map((v) => ({ label: v, value: v }))
        }
        if (type === 'multi-select') {
          const items = p.items as Record<string, unknown> | undefined
          if (items && Array.isArray(items.enum)) {
            field.options = (items.enum as string[]).map((v) => ({ label: v, value: v }))
          }
        }
      }

      fields.push(field)
    }

    return fields
  } catch {
    return []
  }
}

function inferFieldType(prop: Record<string, unknown>): string {
  if (prop.type === 'number' || prop.type === 'integer') return 'number'
  if (prop.type === 'array') {
    if ((prop.items as Record<string, unknown>)?.type === 'object') return 'repeatable-section'
    return 'multi-select'
  }
  if (prop.format === 'date') return 'date'
  if (prop.format === 'uri') return 'file-upload'
  if (prop.contentEncoding === 'base64') return 'signature'
  if (prop.contentMediaType === 'text/plain') return 'textarea'
  if (Array.isArray(prop.enum)) return 'select'
  return 'text'
}

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [fields, setFields] = useState<FieldDefinition[]>([])
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [existing, setExisting] = useState<FormDefinitionDto | null>(null)

  useEffect(() => {
    if (id) {
      getFormDefinitionById(id).then((form) => {
        setExisting(form)
        setTitle(form.title)
        setDescription(form.description || '')
        setCategory(form.category)
        setFields(parseJsonSchema(form.schema))
      })
    }
  }, [id])

  const handleAddField = (type: string) => {
    const newField: FieldDefinition = {
      id: generateId(),
      type,
      label: `New ${type} field`,
      required: false,
    }
    setFields((prev) => [...prev, newField])
    setSelectedFieldIndex(fields.length)
  }

  const handleDeleteField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
    setSelectedFieldIndex(null)
  }

  const handleFieldChange = (index: number, updates: Partial<FieldDefinition>) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(fields)
    const [reordered] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reordered)
    setFields(items)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const schema = buildJsonSchema(fields)
      if (existing) {
        await updateFormDefinition(existing.id, { title, description: description || undefined, schema, category })
        toast({ title: 'Form updated', description: 'Form definition has been updated.' })
      } else {
        const result = await createFormDefinition({ title, description: description || undefined, schema, category })
        toast({ title: 'Form created', description: 'Form definition has been created.' })
        navigate(`/requests/forms/${result.id}`, { replace: true })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save form.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }, [title, description, category, fields, existing, navigate, toast])

  const handlePublish = async () => {
    if (!existing) return
    try {
      await publishFormDefinition(existing.id)
      toast({ title: 'Published', description: 'Form has been published.' })
    } catch {
      toast({ title: 'Error', description: 'Failed to publish form.', variant: 'destructive' })
    }
  }

  const selectedField = selectedFieldIndex !== null ? fields[selectedFieldIndex] : null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{existing ? 'Edit Form' : 'Create Form'}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/requests/forms')}>
            Cancel
          </Button>
          {existing && existing.status === 'Draft' && (
            <Button variant="secondary" onClick={handlePublish}>
              Publish
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input placeholder="Form title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-2">
          <h2 className="font-semibold text-lg">Field Types</h2>
          {DEFAULT_FIELD_TYPES.map((ft) => (
            <Button
              key={ft.type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAddField(ft.type)}
            >
              + {ft.label}
            </Button>
          ))}
        </div>

        <div className="col-span-5">
          <h2 className="font-semibold text-lg mb-2">Form Fields</h2>
          {fields.length === 0 ? (
            <p className="text-muted-foreground">Add fields from the left panel to build your form.</p>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded cursor-pointer flex items-center justify-between ${
                              selectedFieldIndex === index ? 'border-primary ring-2 ring-primary' : ''
                            }`}
                            onClick={() => setSelectedFieldIndex(index)}
                          >
                            <div>
                              <span className="font-medium">{field.label}</span>
                              <span className="ml-2 text-xs text-muted-foreground">({field.type})</span>
                              {field.required && <span className="ml-1 text-destructive">*</span>}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); handleDeleteField(index) }}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="col-span-4">
          {selectedField && (
            <Card>
              <CardHeader>
                <CardTitle>Field Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Label</label>
                  <Input
                    value={selectedField.label}
                    onChange={(e) => handleFieldChange(selectedFieldIndex!, { label: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input value={selectedField.type} disabled />
                </div>
                {(selectedField.type === 'text' || selectedField.type === 'textarea') && (
                  <>
                    <div>
                      <label className="text-sm font-medium">Placeholder</label>
                      <Input
                        value={selectedField.placeholder || ''}
                        onChange={(e) => handleFieldChange(selectedFieldIndex!, { placeholder: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <label className="text-sm font-medium">Min Length</label>
                        <Input type="number" value={selectedField.minLength || ''} onChange={(e) => handleFieldChange(selectedFieldIndex!, { minLength: parseInt(e.target.value) || undefined })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Max Length</label>
                        <Input type="number" value={selectedField.maxLength || ''} onChange={(e) => handleFieldChange(selectedFieldIndex!, { maxLength: parseInt(e.target.value) || undefined })} />
                      </div>
                    </div>
                  </>
                )}
                {selectedField.type === 'number' && (
                  <div className="flex gap-2">
                    <div>
                      <label className="text-sm font-medium">Min</label>
                      <Input type="number" value={selectedField.min ?? ''} onChange={(e) => handleFieldChange(selectedFieldIndex!, { min: parseFloat(e.target.value) || undefined })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Max</label>
                      <Input type="number" value={selectedField.max ?? ''} onChange={(e) => handleFieldChange(selectedFieldIndex!, { max: parseFloat(e.target.value) || undefined })} />
                    </div>
                  </div>
                )}
                {(selectedField.type === 'select' || selectedField.type === 'multi-select') && (
                  <div>
                    <label className="text-sm font-medium">Options (comma-separated)</label>
                    <Textarea
                      value={selectedField.options?.map((o) => o.value).join(', ') || ''}
                      onChange={(e) =>
                        handleFieldChange(selectedFieldIndex!, {
                          options: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((v) => ({ label: v, value: v })),
                        })
                      }
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required"
                    checked={selectedField.required}
                    onChange={(e) => handleFieldChange(selectedFieldIndex!, { required: e.target.checked })}
                  />
                  <label htmlFor="required" className="text-sm font-medium">
                    Required
                  </label>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
