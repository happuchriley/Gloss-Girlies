import { MapPin, Store } from "lucide-react"

import type { FulfillmentType } from "@/lib/orders/fulfillment"
import { getFulfillmentLabel } from "@/lib/orders/fulfillment"
import { cn } from "@/lib/utils"

interface FulfillmentBadgeProps {
  type: FulfillmentType
  className?: string
}

export function FulfillmentBadge({ type, className }: FulfillmentBadgeProps) {
  const Icon = type === "pickup" ? Store : MapPin
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        type === "pickup"
          ? "border-pink-200 bg-brand-light text-brand-dark"
          : "border-pink-100 bg-white text-neutral-600",
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {getFulfillmentLabel(type)}
    </span>
  )
}
