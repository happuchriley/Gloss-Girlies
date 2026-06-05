"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { HERO_VIDEO_SRC } from "@/config/hero"
import { shopCategories } from "@/config/categories"
import { Button } from "@/components/ui/button"

export function EditorialHero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-ink">
      <video
        src={HERO_VIDEO_SRC}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/75" />
      <div className="absolute inset-0 bg-gradient-to-r from-pink-900/25 via-transparent to-transparent" />

      <div className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-6 pb-28 pt-24 text-center sm:px-10">
        <p className="animate-fade-in-up text-[11px] font-semibold uppercase tracking-[0.45em] text-pink-300">
          Curated beauty · Ghana
        </p>
        <h1 className="animate-fade-in-up mt-5 max-w-3xl font-display text-4xl leading-[1.08] text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Pin-worthy glow,
          <br />
          <span className="italic text-pink-300">every single day</span>
        </h1>
        <p className="animate-fade-in-up mt-5 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
          Skincare, makeup & haircare picked for real routines — soft glam,
          clean formulas, quiet confidence.
        </p>
        <div className="animate-fade-in-up mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="rounded-full bg-pink-600 px-8 hover:bg-pink-500"
            asChild
          >
            <Link href="/categories">
              Shop the collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            asChild
          >
            <Link href="/new">New arrivals</Link>
          </Button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-black/40 px-4 py-4 backdrop-blur-md sm:px-6">
        <div className="scrollbar-hide mx-auto flex max-w-7xl gap-2 overflow-x-auto">
          {shopCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:border-pink-400 hover:bg-pink-600/30"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
