"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { EditorialHero } from "@/components/landing/editorial-hero"
import { TrustStrip } from "@/components/landing/trust-strip"
import { SectionHeader } from "@/components/landing/section-header"
import { CategoryShowcase } from "@/components/landing/category-showcase"
import { BentoPromo } from "@/components/landing/bento-promo"
import { BrandStory } from "@/components/landing/brand-story"
import { ProductGrid } from "@/components/products/product-grid"
import { useProductCatalog } from "@/hooks/use-product-catalog"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { products, loading } = useProductCatalog({ sort: "featured", inStockOnly: true })

  const newArrivals = products.slice(0, 8)
  const heroImage = newArrivals[0]?.image

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <EditorialHero />
      <TrustStrip />

      <section className="container-app py-14 sm:py-16 lg:py-20">
        <SectionHeader
          eyebrow="Discover"
          title="Shop by mood"
          subtitle="Scroll through categories — Pinterest-style picks for every part of your routine."
          align="center"
        />
        <CategoryShowcase />
      </section>

      <section className="container-app pb-14 sm:pb-16 lg:pb-20">
        <SectionHeader
          eyebrow="Inspiration"
          title="Build your board"
          subtitle="Routine ideas, trending edits, and fresh arrivals — all in one place."
        />
        <BentoPromo />
      </section>

      <section className="border-y border-pink-100 bg-gradient-to-b from-pink-50/50 to-white py-14 sm:py-16 lg:py-20">
        <div className="container-app">
          <SectionHeader
            eyebrow="Trending"
            title="Pins you&apos;ll love"
            subtitle="Hand-picked arrivals from the Gloss Girlies edit."
            actionLabel="View all"
            actionHref="/new"
          />
          <ProductGrid
            products={newArrivals}
            loading={loading}
            emptyMessage="No products yet — check back soon."
          />
        </div>
      </section>

      <BrandStory image={heroImage} compact />

      <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-20">
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-pink-600/20 blur-3xl" />
        <div className="container-app relative text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-400">
            Your next favorite
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Save it. Wear it. Glow.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-white/65">
            Explore the full collection — from everyday essentials to the pieces
            you&apos;ll reach for again and again.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/categories">
                Shop all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
              asChild
            >
              <Link href="/wishlist">View wishlist</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
