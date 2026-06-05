import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { adminUi } from "@/components/admin/admin-ui"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: React.ReactNode
  backHref?: string
  backLabel?: string
}

export function AdminHeader({
  eyebrow = "Store admin",
  title,
  subtitle,
  action,
  backHref,
  backLabel = "Back to dashboard",
}: AdminHeaderProps) {
  return (
    <div className="mb-8">
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-block text-sm text-brand hover:text-brand-dark"
        >
          ← {backLabel}
        </Link>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="label-editorial">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action ? (
          <div className="w-full shrink-0 sm:w-auto">{action}</div>
        ) : (
          <Button
            asChild
            variant="outline"
            className={`w-full shrink-0 sm:w-auto ${adminUi.outlineBtn}`}
          >
            <Link href="/">
              View storefront
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
