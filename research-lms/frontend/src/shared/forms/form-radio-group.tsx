"use client"

import { useFormContext, Controller } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group"
import { Label } from "@/shared/ui/label"

interface FormRadioOption {
  value: string
  label: string
}

interface FormRadioGroupProps {
  name: string
  label?: string
  options: FormRadioOption[]
  disabled?: boolean
}

export function FormRadioGroup({ name, label, options, disabled }: FormRadioGroupProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">{label}</Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            className="flex gap-4"
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                <Label htmlFor={`${name}-${opt.value}`}>{opt.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
