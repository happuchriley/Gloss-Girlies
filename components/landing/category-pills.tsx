"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { useCategoryCatalog } from "@/hooks/use-category-catalog"
import { cn } from "@/lib/utils"

interface CategoryPillsProps {
  activeSlug?: string
}

export function CategoryPills({ activeSlug }: CategoryPillsProps) {
  const pathname = usePathname()
  const { categories } = useCategoryCatalog()
  const onCategoriesPage = pathname === "/categories"

  return (
    <div className="scrollbar-hide -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <nav
        className="mb-8 flex min-w-max gap-2 sm:mb-10 sm:gap-3"
        aria-label="Shop by category"
      >
        <Link
          href="/categories"
          className={cn(
            "shrink-0 touch-manipulation border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
            onCategoriesPage && !activeSlug
              ? "border-pink-600 bg-pink-600 text-white"
              : "border-pink-200 text-neutral-600 hover:border-pink-400 hover:text-pink-700"
          )}
        >
          All
        </Link>
        {categories.map((cat) => {
          const isActive = activeSlug === cat.id
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className={cn(
                "shrink-0 touch-manipulation border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
                isActive
                  ? "border-pink-600 bg-pink-600 text-white"
                  : "border-pink-200 text-neutral-600 hover:border-pink-400 hover:text-pink-700"
              )}
            >
              {cat.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
