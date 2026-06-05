"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"

import { PageTransition } from "@/components/layout/page-transition"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { OrderTrackingMini } from "@/components/orders/order-tracking-mini"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import { useAuthStore } from "@/store/authStore"
import { useOrderStore } from "@/store/orderStore"

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuthStore()
  const { getOrdersByUser, initializeOrders } = useOrderStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/account")
      return
    }
    initializeOrders()
  }, [isAuthenticated, user, router, initializeOrders])

  if (!isAuthenticated || !user) return null

  const orders = getOrdersByUser(user.id)

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <ShopPageHeader
          eyebrow="Orders"
          title="My orders"
          subtitle="Track every order and view full details."
        />
        <Button variant="outline" className="rounded-full border-pink-200" asChild>
          <Link href="/track-order">Track by ID</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="mt-10 overflow-hidden rounded-3xl border-pink-100">
          <CardContent className="py-16 text-center">
            <Package className="mx-auto h-12 w-12 text-pink-300" />
            <h2 className="mt-4 font-display text-xl">No orders yet</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Start shopping to see your orders here.
            </p>
            <Button className="mt-6 rounded-full bg-pink-600 hover:bg-pink-500" asChild>
              <Link href="/categories">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-ink">Order #{order.id}</h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </p>
                    <OrderTrackingMini status={order.status} className="mt-3 max-w-xs" />
                    {order.trackingNumber && (
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-pink-700">
                    {formatPrice(order.total)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageTransition>
  )
}
