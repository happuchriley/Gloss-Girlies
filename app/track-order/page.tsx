"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Package } from "lucide-react"

import BackButton from "@/components/BackButton"
import { OrderTrackForm } from "@/components/orders/order-track-form"
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel"
import { ShopPageHeader } from "@/components/shop/shop-page-header"
import { Card, CardContent } from "@/components/ui/card"
import { useTrackOrder } from "@/hooks/use-track-order"
import { getGuestOrderRef } from "@/lib/guest/session"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import { useAuthStore } from "@/store/authStore"
import { useOrderStore } from "@/store/orderStore"

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const { orders, initializeOrders } = useOrderStore()
  const { order, error, loading, track, setError } = useTrackOrder()

  const [form, setForm] = useState({
    orderId: searchParams.get("orderId") ?? "",
    trackingNumber: "",
    guestEmail: "",
    guestToken: "",
  })

  useEffect(() => {
    if (isAuthenticated) initializeOrders()
    const id = searchParams.get("orderId")
    if (id) {
      const saved = getGuestOrderRef(id)
      if (saved) {
        setForm((current) => ({
          ...current,
          orderId: id,
          guestEmail: saved.email,
          guestToken: saved.accessToken,
        }))
      }
    }
  }, [initializeOrders, isAuthenticated, searchParams])

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError("")
  }

  const handleTrack = async () => {
    const result = await track(form)
    if (!result.ok && "autofill" in result && result.autofill) {
      setForm((current) => ({
        ...current,
        guestEmail: result.autofill.email,
        guestToken: result.autofill.accessToken,
      }))
      setError(result.error ?? "")
    }
  }

  const recentOrders = isAuthenticated ? orders.slice(0, 5) : []

  return (
    <div className="container-app py-8 md:py-12">
      <BackButton />

      <div className="mt-6">
        <ShopPageHeader
          eyebrow="Delivery"
          title="Track your order"
          subtitle="Look up live status, tracking number, and delivery progress."
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          <OrderTrackForm
            values={form}
            onChange={updateField}
            onSubmit={handleTrack}
            loading={loading}
            error={error}
            isAuthenticated={isAuthenticated}
          />

          {isAuthenticated && recentOrders.length > 0 && (
            <Card className="overflow-hidden rounded-2xl border-pink-100">
              <CardContent className="p-0">
                <p className="border-b border-pink-100 bg-pink-50/30 px-4 py-3 text-sm font-medium text-ink">
                  Your recent orders
                </p>
                <ul className="divide-y divide-pink-50">
                  {recentOrders.map((recent) => (
                    <li key={recent.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((current) => ({ ...current, orderId: recent.id }))
                          void track({ ...form, orderId: recent.id })
                        }}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-pink-50/40"
                      >
                        <div>
                          <p className="font-mono text-sm text-pink-700">{recent.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(recent.createdAt)} · {recent.status}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-ink">
                          {formatPrice(recent.total)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {order ? (
            <OrderTrackingPanel
              order={order}
              detailHref={isAuthenticated ? `/orders/${order.id}` : undefined}
            />
          ) : (
            <Card className="overflow-hidden rounded-2xl border-dashed border-pink-200 bg-pink-50/20">
              <CardContent className="flex min-h-[20rem] flex-col items-center justify-center px-6 py-12 text-center">
                <Package className="h-12 w-12 text-pink-300" />
                <h2 className="mt-4 font-display text-xl text-ink">Track a shipment</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Enter your order ID to see placement, packing, shipping, and delivery updates in
                  one place.
                </p>
                <Link
                  href="/help/faq"
                  className="mt-4 text-sm font-medium text-brand hover:text-brand-dark"
                >
                  Where do I find my order ID?
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-12">
          <div className="h-32 animate-pulse rounded-3xl bg-pink-50" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  )
}
