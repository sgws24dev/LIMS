"use client"

import { useFormContext } from "react-hook-form"
import { Input, type InputProps } from "@/shared/ui/input"

interface FormDatePickerProps extends Omit<InputProps, "type" | "error"> {
  name: string
}

export function FormDatePicker({ name, ...props }: FormDatePickerProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <Input
      type="date"
      {...props}
      {...register(name)}
      error={error}
    />
  )
}
