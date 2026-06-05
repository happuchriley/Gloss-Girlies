import Link from "next/link"
import { Droplets, Sparkles, Sun } from "lucide-react"

const TILES = [
  {
    href: "/categories/skincare",
    icon: Droplets,
    label: "Routine",
    title: "Morning skincare ritual",
    copy: "Cleansers, serums & SPF for your everyday glow.",
    className: "md:col-span-2 md:row-span-2 bg-gradient-to-br from-pink-100 via-white to-pink-50",
    large: true,
  },
  {
    href: "/categories/makeup",
    icon: Sparkles,
    label: "Trending",
    title: "Soft glam edit",
    copy: "Lips, eyes & base — effortless, not overdone.",
    className: "bg-ink text-white",
    large: false,
  },
  {
    href: "/new",
    icon: Sun,
    label: "Just in",
    title: "Fresh drops",
    copy: "See what just landed on the shelf.",
    className: "bg-gradient-to-br from-pink-600 to-pink-800 text-white",
    large: false,
  },
] as const

export function BentoPromo() {
  return (
    <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
      {TILES.map((tile) => {
        const Icon = tile.icon
        return (
          <Link
            key={tile.href}
            href={tile.href}
            className={`group relative overflow-hidden rounded-3xl p-6 transition-transform hover:-translate-y-0.5 ${tile.className} ${tile.large ? "min-h-[280px] md:min-h-0" : "min-h-[160px]"}`}
          >
            <Icon
              className={`h-5 w-5 ${tile.className.includes("text-white") ? "text-pink-200" : "text-pink-500"}`}
            />
            <p
              className={`mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] ${tile.className.includes("text-white") ? "text-pink-200" : "text-pink-500"}`}
            >
              {tile.label}
            </p>
            <h3
              className={`mt-2 font-display text-xl sm:text-2xl ${tile.large ? "md:text-3xl" : ""}`}
            >
              {tile.title}
            </h3>
            <p
              className={`mt-2 max-w-xs text-sm ${tile.className.includes("text-white") ? "text-white/70" : "text-neutral-600"}`}
            >
              {tile.copy}
            </p>
            <span
              className={`mt-5 inline-block text-xs font-medium uppercase tracking-wider transition-opacity group-hover:opacity-80 ${tile.className.includes("text-white") ? "text-pink-200" : "text-ink"}`}
            >
              Explore →
            </span>
          </Link>
        )
      })}
    </div>
  )
}
