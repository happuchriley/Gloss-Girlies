"use client"

import { useEffect, useMemo } from "react"

import { fallbackShopCategories } from "@/config/categories"
import { useCategoryStore } from "@/store/categoryStore"

export function useCategoryCatalog() {
  const { categories, loading, initializeCategories } = useCategoryStore()

  useEffect(() => {
    initializeCategories()
  }, [initializeCategories])

  const catalog = useMemo(
    () => (categories.length > 0 ? categories : fallbackShopCategories),
    [categories]
  )

  const productCategories = useMemo(
    () => catalog.map(({ id, name }) => ({ id, name })),
    [catalog]
  )

  return { categories: catalog, productCategories, loading }
}
