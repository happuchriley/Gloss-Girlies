"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingBag,
  Star,
  User,
  Package,
} from "lucide-react"

import { useAuthStore } from "@/store/authStore"
import { siteConfig, mainNav } from "@/config/site"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface MobileNavSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileNavSheet({ open, onOpenChange }: MobileNavSheetProps) {
  const pathname = usePathname()
  const { isAuthenticated, user, isAdmin } = useAuthStore()

  const accountItems = isAuthenticated
    ? isAdmin
      ? [
          { href: "/admin", label: "Admin dashboard", icon: LayoutDashboard },
          { href: "/admin/profile", label: "My profile", icon: User },
        ]
      : [
          { href: "/account", label: "My Account", icon: User },
          { href: "/orders", label: "My Orders", icon: Package },
        ]
    : [{ href: "/account", label: "Sign In", icon: User }]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[min(100vw-2rem,320px)] p-0">
        <SheetHeader className="border-b border-border px-6 py-5 pr-12 text-left">
          <SheetTitle className="font-display text-xl">{siteConfig.name}</SheetTitle>
          {isAuthenticated && user && (
            <p className="text-sm text-muted-foreground">
              Hello, {user.name.split(" ")[0]}
            </p>
          )}
        </SheetHeader>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {mainNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <Separator className="mx-6" />

        <nav className="flex flex-col gap-1 px-3 py-4">
          {accountItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/reviews"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <Star className="h-4 w-4 text-muted-foreground" />
            Reviews
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
