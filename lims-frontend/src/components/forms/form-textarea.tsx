"use client"

import { useFormContext } from "react-hook-form"
import { Textarea, type TextareaProps } from "@/components/ui/textarea"

interface FormTextareaProps extends Omit<TextareaProps, "error"> {
  name: string
}

export function FormTextarea({ name, ...props }: FormTextareaProps) {
  const { register, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <Textarea
      {...props}
      {...register(name)}
      error={error}
    />
  )
}
