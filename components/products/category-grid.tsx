"use client"

import Link from "next/link"

import { useCategoryCatalog } from "@/hooks/use-category-catalog"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { CategoryShowcase } from "@/components/landing/category-showcase"

const PIN_GRADIENTS = [
  "from-pink-200 via-pink-100 to-white",
  "from-rose-200 via-pink-50 to-white",
  "from-fuchsia-100 via-pink-100 to-neutral-50",
  "from-pink-300/40 via-rose-100 to-white",
] as const

export function CategoryGrid() {
  const { categories } = useCategoryCatalog()

  return (
    <div className="container-app space-y-10 py-8 md:py-12">
      <ShopPageHeader
        eyebrow="Discover"
        title="Shop the collection"
        subtitle="Scroll through categories and build your beauty board — skincare, makeup, haircare, and bundles."
        align="center"
      />

      <CategoryShowcase />

      <section>
        <h2 className="mb-5 font-display text-xl text-ink sm:text-2xl">
          All categories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group flex overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/80"
            >
              <div
                className={`flex w-28 shrink-0 items-center justify-center bg-gradient-to-br sm:w-32 ${PIN_GRADIENTS[index % PIN_GRADIENTS.length]}`}
              >
                <span className="font-display text-lg uppercase tracking-wider text-pink-400/80 group-hover:text-pink-600">
                  {category.name.slice(0, 2)}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
                <h3 className="font-display text-lg text-ink group-hover:text-pink-700">
                  {category.name}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                  {category.description}
                </p>
                <span className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-pink-600">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}