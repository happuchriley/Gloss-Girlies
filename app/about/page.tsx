import Link from "next/link"
import { Sparkles } from "lucide-react"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { siteConfig } from "@/config/site"

export default function AboutPage() {
  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <ShopPageHeader
          eyebrow="Our story"
          title="About Gloss Girlies"
          subtitle="Beauty that feels premium, personal, and unmistakably you."
        />

        <Card className="mt-8 rounded-2xl border-pink-100">
          <CardHeader className="flex flex-row items-center gap-3 border-b border-pink-100 bg-pink-50/30">
            <div className="rounded-full bg-pink-100 p-2">
              <Sparkles className="h-5 w-5 text-pink-600" />
            </div>
            <CardTitle className="font-display text-xl">Who we are</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 text-sm leading-relaxed text-neutral-700 md:text-base">
            <p>
              Gloss Girlies was founded to make beauty accessible, expressive, and joyful. We
              curate essentials that feel premium without feeling unreachable — so every shopper
              can find products that match their style and skin journey.
            </p>
            <p>
              From Accra to everywhere in Ghana, we focus on authenticity, thoughtful
              curation, and a smooth experience from discovery to delivery.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="font-display text-lg">What we offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-600">
              <p>Authentic beauty from trusted brands</p>
              <p>Curated skincare, makeup & haircare</p>
              <p>Fast delivery with order tracking</p>
              <p>Easy returns and responsive support</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-pink-100">
            <CardHeader>
              <CardTitle className="font-display text-lg">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-neutral-600">
              <p>Our team is here for product advice and order support.</p>
              <Link href="/help/contact" className="inline-block text-pink-600 hover:underline">
                Contact support
              </Link>
              <p>Email: {siteConfig.supportEmail}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
