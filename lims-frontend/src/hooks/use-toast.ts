"use client"

import { useState, useCallback } from "react"
import type { ToastProps, ToastActionElement } from "@/components/ui/toast"

type ToastOptions = {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success" | "warning"
  duration?: number
  action?: ToastActionElement
}

type Toast = ToastOptions & { id: string; open: boolean }

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((options: ToastOptions) => {
    const id = String(++toastCount)
    const newToast: Toast = { ...options, id, open: true }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, options.duration ?? 3000)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toast, dismiss, toasts }
}
