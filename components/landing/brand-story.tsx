import Link from "next/link"
import Image from "next/image"

interface BrandStoryProps {
  image?: string
  compact?: boolean
}

export function BrandStory({ image, compact = false }: BrandStoryProps) {
  return (
    <section className="border-t border-pink-100">
      <div className="container-app py-16 sm:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:order-2">
            <p className="label-editorial">Our story</p>
            <h2 className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl">
              Beauty that feels like you
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
              Premium formulas from Ghana — chosen for real routines, not shelf
              dressing.
              {!compact && " Every product is meant to be worn, layered, and loved."}
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block text-xs font-medium uppercase tracking-wider text-ink transition-colors hover:text-pink-600"
            >
              About us →
            </Link>
          </div>

          <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-pink-50 lg:col-span-7 lg:order-1">
            {image ? (
              <Image
                src={image}
                alt="Gloss Girlies"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 via-white to-pink-50">
                <span className="font-display text-5xl uppercase tracking-[0.2em] text-pink-200">
                  GG
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  )
}
