import Link from "next/link"
import { Package, Shield, ShoppingBag, User } from "lucide-react"

import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function PreviewHubPage() {
  return (
    <PageTransition className="container-app py-10 md:py-14">
      <ShopPageHeader
        eyebrow="Design preview"
        title="UI previews"
        subtitle="Browse customer and admin screens with sample data — no login required."
        align="center"
      />

      <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100/60">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <User className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="mt-4 font-display text-xl">Customer account</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Overview, orders, profile, and security — as a signed-in shopper would see.
            </p>
            <Button className="mt-6 w-full rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/preview/customer">View customer page</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-ink/10 bg-ink text-white transition-all hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-4 font-display text-xl">Admin dashboard</h2>
            <p className="mt-2 text-sm text-white/70">
              Store overview with metrics, alerts, and recent orders.
            </p>
            <Button className="mt-6 w-full rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/preview/admin">View admin dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <ShoppingBag className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="mt-4 font-display text-xl">Manage orders</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Search, filter, and update order status — try the full orders table.
            </p>
            <Button className="mt-6 w-full rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/preview/admin/orders">Preview orders page</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-lg">
          <CardContent className="p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100">
              <Package className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="mt-4 font-display text-xl">Manage products</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Catalog, stock levels, low-stock alerts — add and edit products in preview.
            </p>
            <Button className="mt-6 w-full rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/preview/admin/products">Preview products page</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mx-auto mt-10 max-w-lg text-center text-xs text-neutral-500">
        For live data, create an account at{" "}
        <Link href="/account?tab=register" className="text-pink-600 hover:underline">
          /account
        </Link>
        .
      </p>
    </PageTransition>
  )
}
