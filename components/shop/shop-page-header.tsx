interface ShopPageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center"
}

export function ShopPageHeader({
  eyebrow = "Shop",
  title,
  subtitle,
  align = "left",
}: ShopPageHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-pink-100/40 px-6 py-10 sm:px-10 sm:py-12 ${
        centered ? "text-center" : ""
      }`}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-200/40 blur-2xl" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-500">
        {eyebrow}
      </p>
      <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">{title}</h1>
      {subtitle && (
        <p
          className={`mt-3 text-sm leading-relaxed text-neutral-600 ${
            centered ? "mx-auto max-w-lg" : "max-w-xl"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
