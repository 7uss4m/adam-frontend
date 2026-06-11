import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../components/ui/toast"
import { useToast } from "./use-toast"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {isDestructive ? (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-white" />
              ) : (
                <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="grid gap-1">
                {title && <ToastTitle className={isDestructive ? "text-white font-bold" : ""}>{title}</ToastTitle>}
                {description && (
                  <ToastDescription className={isDestructive ? "text-red-50" : ""}>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
