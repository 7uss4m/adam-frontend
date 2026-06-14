import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../../components/ui/toast"
import { useToast } from "./use-toast"
import { AlertCircle, CheckCircle2, X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={5000} swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive"

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-3 w-full">
              {/* Icon */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                isDestructive
                  ? "bg-white/20"
                  : "bg-emerald-500/20"
              }`}>
                {isDestructive ? (
                  <AlertCircle className="h-5 w-5 text-white" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                {title && (
                  <ToastTitle className={`text-sm font-bold leading-tight ${isDestructive ? "text-white" : "text-foreground"}`}>
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription className={`text-xs mt-0.5 leading-relaxed ${isDestructive ? "text-white/80" : "text-muted-foreground"}`}>
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>

            {action}

            <ToastClose className={`absolute top-2 right-2 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity ${isDestructive ? "text-white hover:bg-white/20" : "text-foreground hover:bg-secondary"}`}>
              <X className="h-3.5 w-3.5" />
            </ToastClose>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
