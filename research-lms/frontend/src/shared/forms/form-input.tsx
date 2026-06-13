"use client"

import { useFormContext } from "react-hook-form"
import { Input, type InputProps } from "@/shared/ui/input"

interface FormInputProps extends Omit<InputProps, "error"> {
  name: string
}

export function FormInput({ name, ...props }: FormInputProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <Input
      {...props}
      {...register(name)}
      error={error}
    />
  )
}
