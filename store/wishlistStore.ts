import { create } from "zustand"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { useAuthStore } from "@/store/authStore"
import type { ProductWithInventory } from "@/store/productStore"

interface WishlistStore {
  productIds: string[]
  loading: boolean
  initializeWishlist: () => Promise<void>
  toggleWishlist: (productId: string) => Promise<boolean>
  isInWishlist: (productId: string) => boolean
  getWishlistProducts: (products: ProductWithInventory[]) => ProductWithInventory[]
}

const GUEST_WISHLIST_KEY = "gloss-girlies.guest-wishlist"

function readGuestWishlist(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_WISHLIST_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

function writeGuestWishlist(ids: string[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids))
}

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  productIds: [],
  loading: false,

  initializeWishlist: async () => {
    const { user, isAuthenticated } = useAuthStore.getState()

    if (!isAuthenticated || !user) {
      set({ productIds: readGuestWishlist(), loading: false })
      return
    }

    if (!isSupabaseConfigured()) {
      set({ productIds: readGuestWishlist(), loading: false })
      return
    }

    try {
      set({ loading: true })
      const { data, error } = await supabase
        .from("wishlist")
        .select("product_id")
        .eq("user_id", user.id)

      if (error) {
        console.error("Error loading wishlist:", error)
        set({ productIds: readGuestWishlist(), loading: false })
        return
      }

      set({
        productIds: (data ?? []).map((row) => row.product_id),
        loading: false,
      })
    } catch (error) {
      console.error("Error initializing wishlist:", error)
      set({ loading: false })
    }
  },

  toggleWishlist: async (productId) => {
    const { user, isAuthenticated } = useAuthStore.getState()
    const current = get().productIds
    const exists = current.includes(productId)
    const next = exists
      ? current.filter((id) => id !== productId)
      : [...current, productId]

    set({ productIds: next })

    if (!isAuthenticated || !user) {
      writeGuestWishlist(next)
      return !exists
    }

    if (!isSupabaseConfigured()) {
      writeGuestWishlist(next)
      return !exists
    }

    try {
      if (exists) {
        await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId)
      } else {
        await supabase.from("wishlist").insert({
          user_id: user.id,
          product_id: productId,
        })
      }
      return !exists
    } catch (error) {
      console.error("Wishlist toggle error:", error)
      set({ productIds: current })
      return exists
    }
  },

  isInWishlist: (productId) => get().productIds.includes(productId),

  getWishlistProducts: (products) => {
    const ids = new Set(get().productIds)
    return products.filter((p) => ids.has(p.id))
  },
}))
