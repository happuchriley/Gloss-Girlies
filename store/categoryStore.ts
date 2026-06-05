import { create } from "zustand"

import { fallbackShopCategories, type ShopCategory } from "@/config/categories"
import { formatSupabaseError, isMissingRelationError } from "@/lib/supabase/errors"
import { slugify } from "@/lib/slug"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

interface CategoryStore {
  categories: ShopCategory[]
  loading: boolean
  initialized: boolean
  initializeCategories: () => Promise<void>
  addCategory: (input: { name: string; description: string; id?: string }) => Promise<boolean>
  updateCategory: (
    id: string,
    input: Partial<Pick<ShopCategory, "name" | "description">>
  ) => Promise<boolean>
  deleteCategory: (id: string) => Promise<boolean>
}

function mapRow(row: Record<string, unknown>): ShopCategory {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
  }
}

let missingTableWarned = false

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: fallbackShopCategories,
  loading: false,
  initialized: false,

  initializeCategories: async () => {
    if (get().initialized && get().categories.length > 0) {
      return
    }

    if (!isSupabaseConfigured()) {
      set({ categories: fallbackShopCategories, loading: false, initialized: true })
      return
    }

    try {
      set({ loading: true })
      const { data, error } = await supabase
        .from("shop_categories")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        if (isMissingRelationError(error, "shop_categories")) {
          if (!missingTableWarned && process.env.NODE_ENV === "development") {
            missingTableWarned = true
            console.warn(
              "[Gloss Girlies] shop_categories table not found. Run supabase/migrations/20250601_categories_blog.sql in the Supabase SQL Editor. Using built-in categories."
            )
          }
        } else {
          console.error(
            "Error fetching categories:",
            formatSupabaseError(error)
          )
        }
        set({ categories: fallbackShopCategories, loading: false, initialized: true })
        return
      }

      const categories =
        data && data.length > 0
          ? data.map((row) => mapRow(row as Record<string, unknown>))
          : fallbackShopCategories

      set({ categories, loading: false, initialized: true })
    } catch (error) {
      console.error("Error initializing categories:", formatSupabaseError(error))
      set({ categories: fallbackShopCategories, loading: false, initialized: true })
    }
  },

  addCategory: async ({ name, description, id }) => {
    const categoryId = id ?? slugify(name).replace(/-/g, "")
    const newCategory: ShopCategory = { id: categoryId, name, description }

    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("shop_categories").insert({
        id: categoryId,
        name,
        description,
      })
      if (error) {
        console.error("Error adding category:", formatSupabaseError(error))
        if (isMissingRelationError(error, "shop_categories")) {
          console.warn(
            "Apply supabase/migrations/20250601_categories_blog.sql to enable category management."
          )
        }
        return false
      }
    }

    set({ categories: [...get().categories, newCategory] })
    return true
  },

  updateCategory: async (id, input) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("shop_categories")
        .update({
          ...(input.name ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
      if (error) {
        console.error("Error updating category:", formatSupabaseError(error))
        return false
      }
    }

    set({
      categories: get().categories.map((c) =>
        c.id === id ? { ...c, ...input } : c
      ),
    })
    return true
  },

  deleteCategory: async (id) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.from("shop_categories").delete().eq("id", id)
      if (error) {
        console.error("Error deleting category:", formatSupabaseError(error))
        return false
      }
    }

    set({ categories: get().categories.filter((c) => c.id !== id) })
    return true
  },
}))
