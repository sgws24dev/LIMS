"use client"

import { useFormContext, Controller } from "react-hook-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormSelectOption {
  value: string
  label: string
}

interface FormSelectProps {
  name: string
  label?: string
  placeholder?: string
  options: FormSelectOption[]
  disabled?: boolean
}

export function FormSelect({ name, label, placeholder = "Select...", options, disabled }: FormSelectProps) {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium leading-none">{label}</label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger className={error ? "border-destructive/70" : ""}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}
