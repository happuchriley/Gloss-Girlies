"use client"

import { useProductCatalog } from "@/hooks/use-product-catalog"
import { ProductGrid } from "@/components/products/product-grid"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"

export default function NewArrivalsPage() {
  const { products, loading } = useProductCatalog({ sort: "newest" })

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <ShopPageHeader
        eyebrow="Just dropped"
        title="New arrivals"
        subtitle="Fresh picks from the Gloss Girlies edit — tap Add to bag on any card."
        align="center"
      />
      <div className="mt-10">
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage="No new arrivals yet — check back soon."
        />
      </div>
    </PageTransition>
  )
}
