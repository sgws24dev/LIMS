"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Checkbox } from "@/shared/ui/checkbox"
import { Label } from "@/shared/ui/label"

interface FormCheckboxProps {
  name: string
  label: string
  disabled?: boolean
}

export function FormCheckbox({ name, label, disabled }: FormCheckboxProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
        <Label htmlFor={name} className="text-sm font-normal cursor-pointer">
          {label}
        </Label>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
