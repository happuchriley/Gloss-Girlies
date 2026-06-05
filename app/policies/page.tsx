"use client"

import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent } from "@/components/ui/card"

const POLICY_LINKS = [
  {
    href: "/policies/terms",
    title: "Terms of Service",
    description: "How you may use Gloss Girlies and our services.",
  },
  {
    href: "/policies/privacy",
    title: "Privacy Policy",
    description: "What we collect, how we use it, and your rights.",
  },
  {
    href: "/policies/shipping",
    title: "Shipping",
    description: "Delivery times, areas, and order processing.",
  },
  {
    href: "/policies/returns",
    title: "Returns & Refunds",
    description: "How to return products and receive refunds.",
  },
  {
    href: "/policies/cancellation",
    title: "Cancellation",
    description: "Cancelling orders before and after shipment.",
  },
] as const

export default function PoliciesPage() {
  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <ShopPageHeader
          eyebrow="Legal"
          title="Policies"
          subtitle="Everything you need to know about shopping, privacy, and your orders."
        />

        <div className="mt-8 space-y-3">
          {POLICY_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-pink-100 p-2.5">
                      <FileText className="h-4 w-4 text-pink-600" />
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
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
