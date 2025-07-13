import * as React from "react"

interface ToastActionElement {
  altText: string
  action: () => void
}

interface Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (props: Omit<Toast, "id">) => void
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

let toastCount = 0

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback((props: Omit<Toast, "id">) => {
    const id = String(toastCount++)
    const newToast = { ...props, id }
    setToasts((toasts) => [...toasts, newToast])
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((toasts) => toasts.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = React.useCallback((toastId?: string) => {
    setToasts((toasts) =>
      toastId === undefined
        ? []
        : toasts.filter((t) => t.id !== toastId)
    )
  }, [])

  return {
    toasts,
    toast,
    dismiss,
  }
}