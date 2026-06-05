import Link from "next/link"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
  align?: "left" | "center"
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionHref,
  align = "left",
}: SectionHeaderProps) {
  const isCenter = align === "center"

  return (
    <div className={cn("mb-8 sm:mb-10", isCenter && "text-center")}>
      {eyebrow && <p className="label-editorial mb-2">{eyebrow}</p>}
      <div
        className={cn(
          "flex flex-col gap-3",
          isCenter ? "items-center" : "sm:flex-row sm:items-baseline sm:justify-between"
        )}
      >
        <div className={isCenter ? "max-w-xl" : ""}>
          <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p
              className={cn(
                "mt-2 text-sm leading-relaxed text-neutral-500",
                !isCenter && "max-w-md"
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="shrink-0 text-xs font-medium uppercase tracking-wider text-neutral-500 transition-colors hover:text-brand"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
    </div>
  )
}
