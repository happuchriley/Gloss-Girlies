"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"

import { useProductCatalog } from "@/hooks/use-product-catalog"
import { getUniqueBrands } from "@/lib/products/filters"
import type { SortOption } from "@/lib/products/types"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFiltersBar } from "@/components/products/product-filters"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { SearchBar } from "@/components/layout/search-bar"
import BackButton from "@/components/BackButton"
import { Button } from "@/components/ui/button"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [sort, setSort] = useState<SortOption>("featured")
  const [brand, setBrand] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  const { products, allProducts, loading } = useProductCatalog({
    query,
    brand: brand || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort,
    inStockOnly: true,
  })

  const brands = useMemo(() => getUniqueBrands(allProducts), [allProducts])

  const clearFilters = () => {
    setSort("featured")
    setBrand("")
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <BackButton />

      <div className="mt-6">
        <ShopPageHeader
          eyebrow="Search"
          title={query ? `Results for “${query}”` : "Find your next favorite"}
          subtitle={
            query
              ? loading
                ? "Searching the collection…"
                : `${products.length} product${products.length === 1 ? "" : "s"} found`
              : "Search skincare, makeup, haircare, and more."
          }
        />
      </div>

      <div className="mt-6 max-w-xl">
        <SearchBar placeholder="Search products, brands, categories…" />
      </div>

      {!query ? (
        <div className="mt-10 rounded-3xl border border-dashed border-pink-200 bg-pink-50/40 px-6 py-16 text-center">
          <Search className="mx-auto h-10 w-10 text-pink-300" />
          <p className="mt-4 text-neutral-600">Type a product name or brand above to start.</p>
          <Button className="mt-6 rounded-full" variant="outline" asChild>
            <Link href="/categories">Browse all categories</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
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
            onClear={clearFilters}
            className="hidden rounded-2xl border-pink-100 bg-pink-50/30 lg:block"
          />
          <div>
            <ProductGrid
              products={products}
              loading={loading}
              emptyMessage={`No products found for “${query}”.`}
            />
            {!loading && products.length === 0 && (
              <Button className="mt-6 rounded-full" asChild>
                <Link href="/categories">Browse categories</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </PageTransition>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-12">
          <div className="h-32 animate-pulse rounded-3xl bg-pink-50" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
