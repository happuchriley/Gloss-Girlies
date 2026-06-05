"use client"

import Link from "next/link"
import { ArrowRight, CircleHelp, Headset, PackageSearch, RefreshCcw } from "lucide-react"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent } from "@/components/ui/card"

const HELP_LINKS = [
  {
    title: "Frequently asked questions",
    description: "Fast answers on orders, payments, shipping, and returns.",
    href: "/help/faq",
    icon: CircleHelp,
  },
  {
    title: "Contact support",
    description: "Reach our team for order issues, product guidance, or returns.",
    href: "/help/contact",
    icon: Headset,
  },
  {
    title: "Track your order",
    description: "Check order status and shipping milestones.",
    href: "/track-order",
    icon: PackageSearch,
  },
  {
    title: "Returns & refunds",
    description: "Review policy details for exchanges and cancellations.",
    href: "/policies/returns",
    icon: RefreshCcw,
  },
] as const

export default function HelpPage() {
  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <ShopPageHeader
          eyebrow="Support"
          title="Help center"
          subtitle="Quick resources for shopping, orders, and your account."
        />

        <div className="mt-8 space-y-3">
          {HELP_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group block">
                <Card className="rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-pink-100 p-2.5">
                        <Icon className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="font-display text-lg text-ink group-hover:text-pink-700">
                          {item.title}
                        </h2>
                        <p className="mt-1 text-sm text-neutral-500">{item.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-pink-400 transition-transform group-hover:translate-x-0.5" />
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </PageTransition>
  )
}
