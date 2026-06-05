"use client"

import { usePathname } from "next/navigation"

import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import ScrollToTop from "@/components/ScrollToTop"
import { cn } from "@/lib/utils"

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminArea =
    pathname.startsWith("/admin") || pathname.startsWith("/preview/admin")

  return (
    <>
      <SiteHeader />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)]",
          isAdminArea ? "pb-8 lg:pb-10" : "pb-20 lg:pb-0"
        )}
      >
        {children}
      </main>
      <SiteFooter />
      <MobileBottomNav />
      <ScrollToTop />
    </>
  )
}
