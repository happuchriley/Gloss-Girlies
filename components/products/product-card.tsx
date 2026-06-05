"use client"

import Link from "next/link"
import Image from "next/image"

import type { ProductWithInventory } from "@/store/productStore"
import { formatPrice } from "@/lib/products/format"
import { WishlistButton } from "@/components/products/wishlist-button"
import { AddToCartButton } from "@/components/products/add-to-cart-button"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: ProductWithInventory
  className?: string
  priority?: boolean
  showBadge?: boolean
  badgeLabel?: string
}

export function ProductCard({
  product,
  className,
  priority,
  showBadge = false,
  badgeLabel = "New",
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 10

  return (
    <article className={cn("group flex flex-col", className)}>
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-pink-50">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                isOutOfStock && "opacity-50"
              )}
              priority={priority}
            />
          ) : (
            <div
              className={cn(
                "flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-pink-50",
                isOutOfStock && "opacity-50"
              )}
            >
              <span className="text-xs uppercase tracking-wider text-pink-300">
                No image
              </span>
            </div>
          )}
        </Link>

        <div className="absolute right-2 top-2 z-20">
          <WishlistButton productId={product.id} size="sm" />
        </div>

        {showBadge && !isOutOfStock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-pink-700 shadow-sm">
            {badgeLabel}
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-neutral-700 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
        {lowStock && !isOutOfStock && (
          <span className="absolute bottom-14 left-2 z-10 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink md:bottom-2">
            Low stock
          </span>
        )}

        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 z-20 hidden translate-y-full p-2 transition-transform duration-300 group-hover:translate-y-0 md:block">
            <AddToCartButton
              product={product}
              size="sm"
              showLabel
              className="w-full rounded-full bg-ink hover:bg-neutral-800"
            />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-1 flex-col">
        <Link href={`/products/${product.id}`} className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-medium text-ink transition-colors group-hover:text-pink-700">
            {product.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-pink-700">
            {formatPrice(product.price)}
          </p>
          {product.brand && (
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-400">
              {product.brand}
            </p>
          )}
        </Link>

        {!isOutOfStock ? (
          <AddToCartButton
            product={product}
            size="sm"
            showLabel
            className="mt-3 w-full rounded-full bg-pink-600 hover:bg-pink-500"
          />
        ) : (
          <p className="mt-3 text-center text-xs font-medium uppercase tracking-wider text-neutral-400">
            Unavailable
          </p>
        )}
      </div>
    </article>
  )
}
