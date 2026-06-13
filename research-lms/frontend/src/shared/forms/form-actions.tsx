"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/shared/ui/button"
import { Loader2, Save } from "lucide-react"

interface FormActionsProps {
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  onCancel?: () => void
  showCancel?: boolean
}

export function FormActions({
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  onCancel,
  showCancel = true,
}: FormActionsProps) {
  const { formState: { isSubmitting, isValid } } = useFormContext()
  const disabled = loading || isSubmitting

  return (
    <div className="flex items-center gap-3">
      <Button type="submit" disabled={disabled}>
        {disabled ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {submitLabel}
          </>
        )}
      </Button>
      {showCancel && onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
    </div>
  )
}
