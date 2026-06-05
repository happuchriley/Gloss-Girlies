import Link from "next/link"

import { shopCategories } from "@/config/categories"

const PIN_GRADIENTS = [
  "from-pink-200 via-pink-100 to-white",
  "from-rose-200 via-pink-50 to-white",
  "from-fuchsia-100 via-pink-100 to-neutral-50",
  "from-pink-300/40 via-rose-100 to-white",
] as const

export function CategoryShowcase() {
  return (
    <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-0 sm:px-0">
      {shopCategories.map((category, index) => (
        <Link
          key={category.id}
          href={`/categories/${category.id}`}
          className="group w-[11.5rem] shrink-0 sm:w-[13rem] md:w-[15rem]"
        >
          <div
            className={`relative aspect-[3/4] overflow-hidden rounded-3xl bg-gradient-to-br ${PIN_GRADIENTS[index % PIN_GRADIENTS.length]} shadow-md shadow-pink-100/50 transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-pink-200/60`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-pink-200">
                Shop
              </p>
              <h3 className="mt-1 font-display text-xl leading-tight">
                {category.name}
              </h3>
            </div>
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-pink-700 opacity-0 transition-opacity group-hover:opacity-100">
              →
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-center text-xs text-neutral-500">
            {category.description}
          </p>
        </Link>
      ))}
    </div>
  )
}
