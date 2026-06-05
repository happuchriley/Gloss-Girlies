"use client"

import type { ProductWithInventory } from "@/store/productStore"
import { ProductCard } from "@/components/products/product-card"

interface RelatedProductsProps {
  products: ProductWithInventory[]
  title?: string
}

export function RelatedProducts({
  products,
  title = "You may also like",
}: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-12 border-t border-border pt-10">
      <h2 className="heading-display mb-6 text-xl font-semibold sm:text-2xl">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
