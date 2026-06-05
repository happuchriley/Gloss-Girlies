"use client"

import type { ProductWithInventory } from "@/store/productStore"
import { ProductCard } from "@/components/products/product-card"
import { ProductGridSkeleton } from "@/components/products/product-skeleton"

interface ProductGridProps {
  products: ProductWithInventory[]
  loading?: boolean
  emptyMessage?: string
}

export function ProductGrid({
  products,
  loading,
  emptyMessage = "No products found.",
}: ProductGridProps) {
  if (loading) {
    return <ProductGridSkeleton />
  }

  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-pink-200 bg-pink-50/40 py-16 text-center">
        <p className="text-neutral-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid w-full min-w-0 max-w-full grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          showBadge={index < 2}
          badgeLabel={index === 0 ? "New" : "Edit"}
        />
      ))}
    </div>
  )
}
