"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Switch } from "@/shared/ui/switch"
import { Label } from "@/shared/ui/label"

interface FormSwitchProps {
  name: string
  label: string
  disabled?: boolean
}

export function FormSwitch({ name, label, disabled }: FormSwitchProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <Label htmlFor={name} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Switch
              id={name}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          )}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
