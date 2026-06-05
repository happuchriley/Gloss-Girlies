import { CategoryGrid } from "@/components/products/category-grid"
import { PageTransition } from "@/components/layout/page-transition"

export default function CategoriesPage() {
  return (
    <PageTransition>
      <CategoryGrid />
    </PageTransition>
  )
}
