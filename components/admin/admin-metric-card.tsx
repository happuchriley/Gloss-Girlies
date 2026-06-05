import type { ComponentType } from "react"

import { Card, CardContent } from "@/components/ui/card"

interface AdminMetricCardProps {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  critical?: boolean
  href?: string
}

export function AdminMetricCard({
  label,
  value,
  icon: Icon,
  critical = false,
}: AdminMetricCardProps) {
  return (
    <Card className="surface-card">
      <CardContent className="flex items-center justify-between pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p
            className={`mt-1 text-xl font-semibold ${critical ? "text-destructive" : "text-ink"}`}
          >
            {value}
          </p>
        </div>
        <div className="rounded-md bg-brand-light p-2.5">
          <Icon className="h-5 w-5 text-brand" />
        </div>
      </CardContent>
    </Card>
  )
}
