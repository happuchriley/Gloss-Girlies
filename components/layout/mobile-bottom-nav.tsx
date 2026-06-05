"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3X3, ShoppingBag, User } from "lucide-react"
import { motion } from "framer-motion"

import { mobileNav } from "@/config/site"
import { useCartStore } from "@/store/cartStore"
import { cn } from "@/lib/utils"

const iconMap = {
  home: Home,
  grid: Grid3X3,
  bag: ShoppingBag,
  user: User,
} as const

export function MobileBottomNav() {
  const pathname = usePathname()
  const itemCount = useCartStore((state) => state.getItemCount())

  if (pathname.startsWith("/admin") || pathname.startsWith("/preview/admin")) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-pink-100 bg-background/95 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex h-16 items-stretch justify-around safe-area-pb">
        {mobileNav.map((item) => {
          const Icon = iconMap[item.icon]
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          const showBadge = item.icon === "bag" && itemCount > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors",
                isActive ? "text-brand" : "text-muted-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 h-0.5 w-8 bg-brand"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                {showBadge && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-600 px-1 text-[9px] font-bold text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
