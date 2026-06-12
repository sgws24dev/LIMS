import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export interface Modal {
  id: string
  type: string
  props?: Record<string, unknown>
}

interface UIState {
  toasts: Toast[]
  modals: Modal[]
  loading: Record<string, boolean>

  showToast: (toast: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  showModal: (modal: Omit<Modal, 'id'>) => void
  closeModal: (id: string) => void
  setLoading: (key: string, isLoading: boolean) => void
}

export const useUIStore = create<UIState>()((set, get) => ({
  toasts: [],
  modals: [],
  loading: {},

  showToast: (toast) => {
    const id = crypto.randomUUID()
    const duration = toast.duration ?? 3000

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    if (duration > 0) {
      setTimeout(() => {
        const { toasts: currentToasts } = get()
        if (currentToasts.some((t) => t.id === id)) {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }))
        }
      }, duration)
    }
  },

  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showModal: (modal) => {
    const id = crypto.randomUUID()
    set((state) => ({
      modals: [...state.modals, { ...modal, id }],
    }))
  },

  closeModal: (id) =>
    set((state) => ({
      modals: state.modals.filter((m) => m.id !== id),
    })),

  setLoading: (key, isLoading) =>
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    })),
}))
