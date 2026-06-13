import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, format: "short" | "long" | "time" | "datetime" = "short") {
  const d = new Date(date)
  switch (format) {
    case "short":
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    case "long":
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    case "time":
      return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    case "datetime":
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }
}

export function formatCurrency(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
