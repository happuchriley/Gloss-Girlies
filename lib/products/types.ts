import type { ProductWithInventory } from "@/store/productStore"

export type SortOption = "featured" | "price-asc" | "price-desc" | "name" | "newest"

export interface ProductFilters {
  query?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  featuredOnly?: boolean
  sort?: SortOption
}

export type { ProductWithInventory }
