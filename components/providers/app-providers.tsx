"use client"

import { useEffect } from "react"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AuthInitializer from "@/components/AuthInitializer"
import { useCartStore } from "@/store/cartStore"
import { useCategoryStore } from "@/store/categoryStore"
import { useWishlistStore } from "@/store/wishlistStore"

function StoreInitializer() {
  const initializeCart = useCartStore((s) => s.initializeCart)
  const initializeWishlist = useWishlistStore((s) => s.initializeWishlist)
  const initializeCategories = useCategoryStore((s) => s.initializeCategories)

  useEffect(() => {
    initializeCart()
    initializeWishlist()
    initializeCategories()
  }, [initializeCart, initializeWishlist, initializeCategories])

  return null
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthInitializer />
      <StoreInitializer />
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
