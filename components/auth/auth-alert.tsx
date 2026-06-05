import { cn } from "@/lib/utils"

interface AuthAlertProps {
  variant: "error" | "success"
  children: React.ReactNode
  className?: string
}

export function AuthAlert({ variant, children, className }: AuthAlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl px-3 py-2.5 text-sm",
        variant === "error"
          ? "border border-red-200 bg-red-50 text-red-800"
          : "border border-emerald-200 bg-emerald-50 text-emerald-800",
        className
      )}
    >
      {children}
    </div>
  )
}
