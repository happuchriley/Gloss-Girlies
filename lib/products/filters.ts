import { normalizeCategorySlug } from "@/config/categories"
import type { ProductFilters, ProductWithInventory, SortOption } from "@/lib/products/types"

export function filterProducts(
  products: ProductWithInventory[],
  filters: ProductFilters
): ProductWithInventory[] {
  let result = [...products]

  if (filters.inStockOnly !== false) {
    result = result.filter((p) => p.stock > 0)
  }

  if (filters.featuredOnly) {
    result = result.filter((p) => p.featured)
  }

  if (filters.category) {
    const slug = normalizeCategorySlug(filters.category)
    result = result.filter(
      (p) => normalizeCategorySlug(p.category) === slug
    )
  }

  if (filters.brand) {
    result = result.filter(
      (p) => p.brand.toLowerCase() === filters.brand!.toLowerCase()
    )
  }

  if (filters.minPrice != null) {
    result = result.filter((p) => p.price >= filters.minPrice!)
  }

  if (filters.maxPrice != null) {
    result = result.filter((p) => p.price <= filters.maxPrice!)
  }

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    )
  }

  return sortProducts(result, filters.sort ?? "featured")
}

export function sortProducts(
  products: ProductWithInventory[],
  sort: SortOption
): ProductWithInventory[] {
  const list = [...products]

  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price)
    case "price-desc":
      return list.sort((a, b) => b.price - a.price)
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name))
    case "newest":
      return list.sort((a, b) => Number(b.id) - Number(a.id))
    case "featured":
    default:
      return list.sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.price - a.price
      })
  }
}

export function getUniqueBrands(
  products: ProductWithInventory[],
  category?: string
): string[] {
  let list = products
  if (category) {
    const slug = normalizeCategorySlug(category)
    list = list.filter((p) => normalizeCategorySlug(p.category) === slug)
  }
  return Array.from(new Set(list.map((p) => p.brand).filter(Boolean))).sort()
}

export function getRelatedProducts(
  products: ProductWithInventory[],
  productId: string,
  category: string,
  limit = 4
): ProductWithInventory[] {
  return products
    .filter(
      (p) =>
        p.id !== productId &&
        p.stock > 0 &&
        normalizeCategorySlug(p.category) === normalizeCategorySlug(category)
    )
    .slice(0, limit)
}
