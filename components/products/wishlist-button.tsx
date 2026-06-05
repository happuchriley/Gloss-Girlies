"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"

import { useWishlistStore } from "@/store/wishlistStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface WishlistButtonProps {
  productId: string
  className?: string
  size?: "sm" | "default"
}

export function WishlistButton({
  productId,
  className,
  size = "default",
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlistStore()
  const { isAuthenticated } = useAuthStore()
  const [pending, setPending] = useState(false)
  const active = isInWishlist(productId)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (pending) return
    const wasActive = active
    setPending(true)
    await toggleWishlist(productId)
    setPending(false)
    toast.success(
      wasActive ? "Removed from wishlist" : "Saved to wishlist",
      !isAuthenticated ? "Sign in to sync across devices" : undefined
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm hover:bg-background",
        size === "sm" ? "h-8 w-8" : "h-9 w-9",
        className
      )}
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      title={
        !isAuthenticated
          ? "Saved locally — sign in to sync across devices"
          : undefined
      }
    >
      <motion.span
        whileTap={{ scale: 0.85 }}
        animate={active ? { scale: [1, 1.2, 1] } : {}}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            active ? "fill-primary text-primary" : "text-foreground"
          )}
        />
      </motion.span>
    </Button>
  )
}
