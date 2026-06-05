"use client"

import { useEffect, useMemo } from "react"
import { useProductStore } from "@/store/productStore"
import { filterProducts } from "@/lib/products/filters"
import type { ProductFilters } from "@/lib/products/types"

export function useProductCatalog(filters: ProductFilters = {}) {
  const { products, loading, initializeProducts } = useProductStore()

  useEffect(() => {
    initializeProducts()
  }, [initializeProducts])

  const filtered = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  )

  return { products: filtered, allProducts: products, loading }
}
