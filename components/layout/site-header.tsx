"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, Search, ShoppingBag, User, Heart } from "lucide-react"

import { mainNav } from "@/config/site"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet"
export function SiteHeader() {
  const itemCount = useCartStore((state) => state.getItemCount())
  const { isAuthenticated, user, isAdmin } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/95 backdrop-blur-sm">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between md:h-[4.5rem]">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-ink md:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <BrandLogo wordmarkClassName="text-sm sm:text-base" />

              <nav className="ml-6 hidden items-center gap-6 md:flex lg:ml-10" aria-label="Main">
                {mainNav.slice(0, 4).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link
                href="/search"
                className="p-2 text-neutral-600 transition-colors hover:text-ink"
                aria-label="Search"
              >
                <Search className="h-5 w-5" strokeWidth={1.5} />
              </Link>

              <Link
                href="/wishlist"
                className="hidden p-2 text-neutral-600 transition-colors hover:text-ink sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" strokeWidth={1.5} />
              </Link>

              <Link
                href="/cart"
                className="relative p-2 text-neutral-600 transition-colors hover:text-ink"
                aria-label={`Bag${mounted && itemCount > 0 ? `, ${itemCount} items` : ""}`}
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                {mounted && itemCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-medium text-white">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              {mounted && isAuthenticated && user ? (
                <Link
                  href={isAdmin ? "/admin/profile" : "/account"}
                  className="hidden items-center gap-1.5 px-2 text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:text-pink-600 sm:flex"
                  title={isAdmin ? "Admin profile" : "Account"}
                >
                  <User className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                </Link>
              ) : (
                <Link
                  href="/account?tab=login"
                  className="hidden px-2 text-xs font-medium uppercase tracking-wider text-neutral-500 transition-colors hover:text-pink-600 sm:block"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileNavSheet open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  )
}
