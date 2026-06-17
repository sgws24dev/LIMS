"use client"

import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AlertDialog({ children }: AlertDialogProps) {
  return <>{children}</>
}

export function AlertDialogTrigger({ children, asChild, ...props }: { children: ReactNode; asChild?: boolean } & Record<string, unknown>) {
  return <>{children}</>
}

export function AlertDialogPortal({ children }: { children: ReactNode }) {
  return <>{children}</>
}

export function AlertDialogOverlay({ className, ...props }: { className?: string } & Record<string, unknown>) {
  return <div className={cn("fixed inset-0 z-50 bg-black/80", className)} {...props} />
}

export function AlertDialogContent({ className, children, ...props }: { className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div className={cn("fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg", className)} {...props}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ className, ...props }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
}

export function AlertDialogFooter({ className, ...props }: { className?: string; children: ReactNode }) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
}

export function AlertDialogTitle({ className, ...props }: { className?: string; children: ReactNode }) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

export function AlertDialogDescription({ className, ...props }: { className?: string; children: ReactNode }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function AlertDialogAction({ className, ...props }: { className?: string; children: ReactNode } & Record<string, unknown>) {
  return <button className={cn("inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90", className)} {...props} />
}

export function AlertDialogCancel({ className, ...props }: { className?: string; children: ReactNode } & Record<string, unknown>) {
  return <button className={cn("inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground", className)} {...props} />
}
