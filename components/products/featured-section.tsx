"use client"

import Link from "next/link"

import { useProductCatalog } from "@/hooks/use-product-catalog"
import { ProductGrid } from "@/components/products/product-grid"
import { PageTransition } from "@/components/layout/page-transition"

interface FeaturedSectionProps {
  title?: string
  limit?: number
  viewAllHref?: string
}

export function FeaturedSection({
  title = "Featured",
  limit = 8,
  viewAllHref = "/categories",
}: FeaturedSectionProps) {
  const { products, loading } = useProductCatalog({
    featuredOnly: true,
    sort: "featured",
  })

  const display = products.slice(0, limit)

  return (
    <PageTransition className="border-t border-neutral-100 bg-surface py-12 md:py-16">
      <div className="container-app">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          <Link
            href={viewAllHref}
            className="text-xs font-medium uppercase tracking-wider text-neutral-500 transition-colors hover:text-brand"
          >
            View all →
          </Link>
        </div>
        <ProductGrid
          products={display}
          loading={loading}
          emptyMessage="Featured products coming soon."
        />
      </div>
    </PageTransition>
  )
}
