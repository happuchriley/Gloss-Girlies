export interface ShopCategory {
  id: string
  name: string
  description: string
}

export const fallbackShopCategories: ShopCategory[] = [
  {
    id: "skincare",
    name: "Skincare",
    description: "Serums, cleansers & sun care for glowing skin",
  },
  {
    id: "makeup",
    name: "Makeup",
    description: "Foundation, lips & eyes — everyday glam",
  },
  {
    id: "haircare",
    name: "Haircare",
    description: "Treatments & styling for healthy hair",
  },
  {
    id: "combos",
    name: "Combos",
    description: "Curated bundles at better value",
  },
]

/** @deprecated Use fallbackShopCategories or category store */
export const shopCategories = fallbackShopCategories

export type ShopCategoryId = string

export const productCategories = fallbackShopCategories.map(({ id, name }) => ({
  id,
  name,
}))

export function getCategoryById(
  id: string,
  categories: ShopCategory[] = fallbackShopCategories
): ShopCategory | undefined {
  return categories.find((c) => c.id === id.toLowerCase())
}

export function normalizeCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, "")
}