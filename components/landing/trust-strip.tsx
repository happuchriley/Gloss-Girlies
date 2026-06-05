import { Heart, Leaf, Truck } from "lucide-react"

const ITEMS = [
  { icon: Leaf, label: "Curated formulas" },
  { icon: Heart, label: "Made for real routines" },
  { icon: Truck, label: "Fast delivery in Ghana" },
] as const

export function TrustStrip() {
  return (
    <section className="border-b border-pink-100 bg-pink-50/60">
      <div className="container-app flex flex-wrap items-center justify-center gap-8 py-5 sm:gap-12">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-sm text-neutral-700">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-pink-600 shadow-sm">
              <Icon className="h-4 w-4" />
            </span>
            <span className="font-medium">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
