"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Box, FileText, ShoppingBag, Tags, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const TABS: {
  href: string
  label: string
  icon: LucideIcon
  isActive?: (pathname: string) => boolean
}[] = [
  {
    href: "/admin/products",
    label: "Products",
    icon: Box,
    isActive: (pathname) =>
      pathname === "/admin" || pathname.startsWith("/admin/products"),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
    isActive: (pathname) => pathname.startsWith("/admin/categories"),
  },
  {
    href: "/admin/blog",
    label: "Blog",
    icon: FileText,
    isActive: (pathname) => pathname.startsWith("/admin/blog"),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    isActive: (pathname) => pathname.startsWith("/admin/orders"),
  },
]

export function AdminDashboardNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav className={cn("border-b border-pink-100", className)}>
      <div className="-mb-px flex items-center gap-1 overflow-x-auto scrollbar-hide">
        {TABS.map(({ href, label, icon: Icon, isActive }) => {
          const active = isActive?.(pathname) ?? pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm uppercase tracking-[0.06em] transition-colors",
                active
                  ? "border-brand font-semibold text-ink"
                  : "border-transparent font-medium text-muted-foreground hover:text-ink"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
