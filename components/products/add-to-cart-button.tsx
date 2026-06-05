"use client"

import { useState } from "react"
import { ShoppingBag, Check } from "lucide-react"

import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { ProductWithInventory } from "@/store/productStore"

interface AddToCartButtonProps {
  product: ProductWithInventory
  quantity?: number
  className?: string
  size?: "sm" | "default" | "lg" | "icon"
  variant?: "default" | "secondary" | "outline" | "luxury"
  showLabel?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  className,
  size = "default",
  variant = "default",
  showLabel = true,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const { isAdmin } = useAuthStore()
  const [added, setAdded] = useState(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAdmin) return
    if (product.stock <= 0) return

    const qty = Math.min(quantity, product.stock)
    for (let i = 0; i < qty; i++) {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    toast.success(
      qty > 1 ? `Added ${qty} to your bag` : "Added to your bag",
      product.name
    )
  }

  if (size === "icon") {
    return (
      <Button
        type="button"
        size="icon"
        variant={variant}
        className={cn("rounded-full", className)}
        disabled={isAdmin || product.stock <= 0}
        onClick={handleClick}
        aria-label={`Add ${product.name} to cart`}
      >
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
      variant={variant}
      className={cn("gap-2", className)}
      disabled={isAdmin || product.stock <= 0}
      onClick={handleClick}
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
      {showLabel &&
        (added
          ? "Added"
          : isAdmin
            ? "Admin only"
            : product.stock <= 0
              ? "Out of stock"
              : "Add to bag")}
    </Button>
  )
}
