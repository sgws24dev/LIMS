import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Checkbox } from '@/shared/components/ui/checkbox'
import { useToast } from '@/shared/hooks/use-toast'
import SignaturePad from '@uiw/react-signature'

interface FieldDef {
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

interface DynamicFormRendererProps {
  fields: FieldDef[]
  onSubmit: (data: Record<string, unknown>) => void
  submitLabel?: string
  defaultValues?: Record<string, unknown>
  readOnly?: boolean
}

function parseFields(schemaJson: string): FieldDef[] {
  try {
    const schema = JSON.parse(schemaJson)
    const result: FieldDef[] = []
    if (!schema.properties) return result

    for (const [key, prop] of Object.entries(schema.properties)) {
      const p = prop as Record<string, unknown>
      const type = inferType(p)
      const field: FieldDef = {
        id: key,
        type,
        label: (p.title as string) || key,
        required: Array.isArray(schema.required) && schema.required.includes(key),
      }
      if (p.description) field.placeholder = p.description as string
      if (p.minLength !== undefined) field.minLength = p.minLength as number
      if (p.maxLength !== undefined) field.maxLength = p.maxLength as number
      if (p.minimum !== undefined) field.min = p.minimum as number
      if (p.maximum !== undefined) field.max = p.maximum as number
      if (type === 'select' && Array.isArray(p.enum)) {
        field.options = (p.enum as string[]).map((v) => ({ label: v, value: v }))
      }
      if (type === 'multi-select') {
        const items = p.items as Record<string, unknown> | undefined
        if (items && Array.isArray(items.enum)) {
          field.options = (items.enum as string[]).map((v) => ({ label: v, value: v }))
        }
      }
      result.push(field)
    }
    return result
  } catch {
    return []
  }
}

function inferType(prop: Record<string, unknown>): string {
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

function buildZodSchema(fields: FieldDef[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const field of fields) {
    let schema: z.ZodTypeAny

    switch (field.type) {
      case 'text':
      case 'textarea':
        schema = z.string()
        if (field.minLength) schema = (schema as z.ZodString).min(field.minLength)
        if (field.maxLength) schema = (schema as z.ZodString).max(field.maxLength)
        if (field.required) schema = (schema as z.ZodString).min(1, `${field.label} is required`)
        break
      case 'number':
        schema = z.coerce.number()
        if (field.min !== undefined) schema = (schema as z.ZodNumber).min(field.min)
        if (field.max !== undefined) schema = (schema as z.ZodNumber).max(field.max)
        break
      case 'date':
        schema = z.string()
        if (field.required) schema = (schema as z.ZodString).min(1, `${field.label} is required`)
        break
      case 'select':
        schema = z.string()
        if (field.required) schema = (schema as z.ZodString).min(1, `${field.label} is required`)
        break
      case 'multi-select':
        schema = z.array(z.string())
        if (field.required) schema = (schema as z.ZodArray<z.ZodString>).min(1, `${field.label} is required`)
        break
      case 'file-upload':
        schema = z.string()
        break
      case 'signature':
        schema = z.string()
        break
      case 'repeatable-section':
        schema = z.array(z.object({ value: z.string() }))
        break
      default:
        schema = z.string()
    }

    if (!field.required && field.type !== 'multi-select') {
      schema = schema.optional().or(z.literal(''))
    }

    shape[field.id] = schema
  }

  return z.object(shape)
}

export default function DynamicFormRenderer({
  fields: externalFields,
  schemaJson,
  onSubmit,
  submitLabel = 'Submit',
  defaultValues,
  readOnly = false,
}: DynamicFormRendererProps & { schemaJson?: string }) {
  const { toast } = useToast()
  const fields = externalFields || (schemaJson ? parseFields(schemaJson) : [])

  const formSchema = buildZodSchema(fields)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {},
  })

  const { control, handleSubmit, formState: { errors } } = form

  const handleFormSubmit = (data: Record<string, unknown>) => {
    onSubmit(data)
  }

  const renderField = (field: FieldDef) => {
    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Input
                {...f}
                placeholder={field.placeholder}
                readOnly={readOnly}
              />
            )}
          />
        )

      case 'number':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Input
                type="number"
                {...f}
                placeholder={field.placeholder}
                readOnly={readOnly}
              />
            )}
          />
        )

      case 'textarea':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Textarea
                {...f}
                placeholder={field.placeholder}
                readOnly={readOnly}
              />
            )}
          />
        )

      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Input type="date" {...f} readOnly={readOnly} />
            )}
          />
        )

      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Select
                value={f.value}
                onValueChange={f.onChange}
                disabled={readOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder || 'Select...'} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )

      case 'multi-select': {
        const { fields: multiFields, append, remove } = useFieldArray({
          control,
          name: field.id,
        })
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <Controller
                  name={field.id}
                  control={control}
                  render={({ field: f }) => {
                    const selected = Array.isArray(f.value) ? f.value : []
                    const checked = selected.includes(opt.value)
                    return (
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          if (checked) {
                            f.onChange(selected.filter((v: string) => v !== opt.value))
                          } else {
                            f.onChange([...selected, opt.value])
                          }
                        }}
                        disabled={readOnly}
                      />
                    )
                  }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        )
      }

      case 'file-upload':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) f.onChange(URL.createObjectURL(file))
                }}
                disabled={readOnly}
              />
            )}
          />
        )

      case 'signature':
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <div className="border rounded p-2">
                  <SignaturePad
                    style={{ width: '100%', height: 150 }}
                    defaultPoints={f.value ? (typeof f.value === 'string' ? JSON.parse(f.value) : f.value) : undefined}
                    onPointer={(points) => f.onChange(points)}
                    readonly={readOnly}
                  />
              </div>
            )}
          />
        )

      case 'repeatable-section': {
        const { fields: sectionFields, append, remove } = useFieldArray({
          control,
          name: field.id,
        })
        return (
          <div className="space-y-2">
            {sectionFields.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2">
                <Controller
                  name={`${field.id}.${index}.value`}
                  control={control}
                  render={({ field: f }) => (
                    <Input {...f} placeholder="Value" readOnly={readOnly} />
                  )}
                />
                {!readOnly && (
                  <Button variant="ghost" size="sm" onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={() => append({ value: '' })}>
                + Add Item
              </Button>
            )}
          </div>
        )
      }

      default:
        return (
          <Controller
            name={field.id}
            control={control}
            render={({ field: f }) => (
              <Input {...f} placeholder={field.placeholder} readOnly={readOnly} />
            )}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {fields.map((field) => (
        <div key={field.id}>
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {renderField(field)}
          {errors[field.id] && (
            <p className="text-sm text-destructive mt-1">
              {errors[field.id]?.message as string}
            </p>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button type="submit">{submitLabel}</Button>
      )}
    </form>
  )
}

export { parseFields, buildZodSchema }
