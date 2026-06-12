"use client"

import { useFormContext } from "react-hook-form"
import { AlertCircle } from "lucide-react"

export function FormErrorSummary() {
  const { formState: { errors } } = useFormContext()
  const errorMessages = Object.values(errors).filter((e) => e?.message)

  if (errorMessages.length === 0) return null

  return (
    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <ul className="list-disc pl-4 space-y-1">
        {errorMessages.map((err, i) => (
          <li key={i}>{err!.message as string}</li>
        ))}
      </ul>
    </div>
  )
}
