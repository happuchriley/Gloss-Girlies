import Link from "next/link"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent } from "@/components/ui/card"

interface ContentPageLayoutProps {
  eyebrow?: string
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  children: React.ReactNode
}

export function ContentPageLayout({
  eyebrow = "Gloss Girlies",
  title,
  subtitle,
  backHref = "/",
  backLabel = "Back",
  children,
}: ContentPageLayoutProps) {
  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href={backHref}
          className="mb-4 inline-block text-sm text-pink-600 hover:text-pink-700"
        >
          ← {backLabel}
        </Link>
        <ShopPageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Card className="mt-8 rounded-2xl border-pink-100">
          <CardContent className="space-y-6 p-6 text-sm leading-relaxed text-neutral-700 sm:p-8 md:text-base">
            {children}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}

export function ContentSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="font-display text-lg text-ink md:text-xl">{title}</h2>
      <div className="mt-3 space-y-3 text-neutral-700">{children}</div>
    </section>
  )
}

export function ContentList({
  items,
  ordered = false,
}: {
  items: string[]
  ordered?: boolean
}) {
  const Tag = ordered ? "ol" : "ul"
  return (
    <Tag
      className={`ml-4 space-y-1.5 text-neutral-700 ${ordered ? "list-decimal" : "list-disc"} list-inside`}
    >
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </Tag>
  )
}
