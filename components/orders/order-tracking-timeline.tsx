"use client"

import { Check, Package, Truck, XCircle } from "lucide-react"

import type { FulfillmentType } from "@/lib/orders/fulfillment"
import {
  getOrderTrackingSteps,
  type TrackingStep,
} from "@/lib/orders/tracking"
import { cn } from "@/lib/utils"

const STEP_ICONS = {
  placed: Package,
  pending: Package,
  confirmed: Check,
  shipped: Truck,
  delivered: Check,
  cancelled: XCircle,
} as const

interface OrderTrackingTimelineProps {
  status: string
  fulfillmentType?: FulfillmentType
  variant?: "vertical" | "horizontal"
  className?: string
}

export function OrderTrackingTimeline({
  status,
  fulfillmentType = "delivery",
  variant = "vertical",
  className,
}: OrderTrackingTimelineProps) {
  const steps = getOrderTrackingSteps(status, fulfillmentType)
  const isCancelled = status === "cancelled"

  if (variant === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        <div className="hidden md:block">
          <HorizontalTimeline steps={steps} isCancelled={isCancelled} />
        </div>
        <div className="md:hidden">
          <VerticalTimeline steps={steps} isCancelled={isCancelled} />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <VerticalTimeline steps={steps} isCancelled={isCancelled} />
    </div>
  )
}

function VerticalTimeline({
  steps,
  isCancelled,
}: {
  steps: TrackingStep[]
  isCancelled: boolean
}) {
  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] ?? Package
        const isLast = index === steps.length - 1

        return (
          <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[1.125rem] top-9 h-[calc(100%-2.25rem)] w-px",
                  step.completed && !isCancelled ? "bg-brand" : "bg-pink-100"
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
                step.current && isCancelled
                  ? "border-destructive bg-destructive text-white"
                  : step.current
                    ? "border-brand bg-brand text-white"
                    : step.completed
                      ? "border-brand bg-brand-light text-brand"
                      : "border-pink-100 bg-white text-pink-300"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.completed || step.current ? "text-ink" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function HorizontalTimeline({
  steps,
  isCancelled,
}: {
  steps: TrackingStep[]
  isCancelled: boolean
}) {
  return (
    <ol className="grid gap-4" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((step, index) => {
        const Icon = STEP_ICONS[step.key as keyof typeof STEP_ICONS] ?? Package
        const isLast = index === steps.length - 1

        return (
          <li key={step.key} className="relative text-center">
            {!isLast && (
              <span
                className={cn(
                  "absolute left-[calc(50%+1.125rem)] top-[1.125rem] h-px w-[calc(100%-2.25rem)]",
                  step.completed && !isCancelled ? "bg-brand" : "bg-pink-100"
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2",
                step.current && isCancelled
                  ? "border-destructive bg-destructive text-white"
                  : step.current
                    ? "border-brand bg-brand text-white"
                    : step.completed
                      ? "border-brand bg-brand-light text-brand"
                      : "border-pink-100 bg-white text-pink-300"
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p
              className={cn(
                "mt-3 text-xs font-medium uppercase tracking-wider",
                step.completed || step.current ? "text-ink" : "text-muted-foreground"
              )}
            >
              {step.label}
            </p>
          </li>
        )
      })}
    </ol>
  )
}
