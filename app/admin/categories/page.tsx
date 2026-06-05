"use client"

import { useEffect } from "react"

import { AdminCategoriesView } from "@/components/admin/admin-categories-view"
import { PageTransition } from "@/components/layout/page-transition"
import { useCategoryStore } from "@/store/categoryStore"

export default function AdminCategoriesPage() {
  const { categories, loading, initializeCategories, addCategory, updateCategory, deleteCategory } =
    useCategoryStore()

  useEffect(() => {
    initializeCategories()
  }, [initializeCategories])

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <AdminCategoriesView
        categories={categories}
        loading={loading}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
    </PageTransition>
  )
}
