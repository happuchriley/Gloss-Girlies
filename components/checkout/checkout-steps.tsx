import { cn } from "@/lib/utils"

const steps = [
  { id: "address", label: "Shipping" },
  { id: "payment", label: "Payment" },
  { id: "review", label: "Review" },
] as const

export type CheckoutStepId = (typeof steps)[number]["id"]

interface CheckoutStepsProps {
  current: CheckoutStepId
}

export function CheckoutSteps({ current }: CheckoutStepsProps) {
  const currentIndex = steps.findIndex((s) => s.id === current)

  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="flex items-center gap-2 sm:gap-4">
        {steps.map((step, index) => {
          const done = index < currentIndex
          const active = step.id === current
          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-4">
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-sm text-xs font-medium transition-colors",
                    done && "bg-foreground text-background",
                    active && !done && "border border-foreground text-foreground",
                    !done && !active && "bg-secondary text-muted-foreground"
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    active ? "font-medium text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden h-px flex-1 sm:block",
                    index < currentIndex ? "bg-foreground" : "bg-border"
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
