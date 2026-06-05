"use client"

import { useMemo, useState } from "react"
import { useParams } from "next/navigation"

import { getCategoryById } from "@/config/categories"
import { useCategoryCatalog } from "@/hooks/use-category-catalog"
import { useProductCatalog } from "@/hooks/use-product-catalog"
import { getUniqueBrands } from "@/lib/products/filters"
import type { SortOption } from "@/lib/products/types"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFiltersBar } from "@/components/products/product-filters"
import { CategoryPills } from "@/components/landing/category-pills"
import { PageTransition } from "@/components/layout/page-transition"
import BackButton from "@/components/BackButton"

export default function CategoryPage() {
  const params = useParams()
  const categoryId = (params.category as string).toLowerCase()
  const { categories } = useCategoryCatalog()
  const meta = getCategoryById(categoryId, categories)

  const [sort, setSort] = useState<SortOption>("featured")
  const [brand, setBrand] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const { products, allProducts, loading } = useProductCatalog({
    category: categoryId,
    brand: brand || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
  })

  const brands = useMemo(
    () => getUniqueBrands(allProducts, categoryId),
    [allProducts, categoryId]
  )

  const title = meta?.name ?? categoryId

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <BackButton />

      <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-neutral-900 to-pink-950 px-6 py-10 text-white sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-300">
          Category
        </p>
        <h1 className="mt-2 font-display text-3xl capitalize sm:text-4xl">{title}</h1>
        {meta?.description && (
          <p className="mt-3 max-w-xl text-sm text-white/70">{meta.description}</p>
        )}
        <p className="mt-4 text-xs text-pink-200/80">
          {loading ? "Loading…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
        </p>
      </div>

      <div className="mt-8">
        <CategoryPills activeSlug={categoryId} />
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFiltersBar
          sort={sort}
          onSortChange={setSort}
          brand={brand}
          brands={brands}
          onBrandChange={setBrand}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onClear={() => {
            setSort("featured")
            setBrand("")
            setMinPrice("")
            setMaxPrice("")
          }}
          className="rounded-2xl border-pink-100 bg-pink-50/30"
        />
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={`No products in ${title} yet.`}
        />
      </div>
    </PageTransition>
  )
}
