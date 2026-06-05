import { getTrackingProgress } from "@/lib/orders/tracking"
import { cn } from "@/lib/utils"

interface OrderTrackingMiniProps {
  status: string
  className?: string
}

export function OrderTrackingMini({ status, className }: OrderTrackingMiniProps) {
  const progress = getTrackingProgress(status)
  const isCancelled = status === "cancelled"

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{isCancelled ? "Cancelled" : "Tracking"}</span>
        {!isCancelled && <span>{progress}%</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-pink-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isCancelled ? "w-full bg-destructive/70" : "bg-brand"
          )}
          style={{ width: isCancelled ? "100%" : `${progress}%` }}
        />
      </div>
    </div>
  )
}
