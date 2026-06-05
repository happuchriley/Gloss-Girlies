"use client"

import { useState } from "react"
import Link from "next/link"
import { Copy, Check, MapPin, Package } from "lucide-react"

import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { FulfillmentBadge } from "@/components/orders/fulfillment-badge"
import { OrderTrackingTimeline } from "@/components/orders/order-tracking-timeline"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import type { TrackedOrderView } from "@/lib/orders/tracking"
import { getTrackingProgress } from "@/lib/orders/tracking"

interface OrderTrackingPanelProps {
  order: TrackedOrderView
  showItems?: boolean
  showAddress?: boolean
  detailHref?: string
}

export function OrderTrackingPanel({
  order,
  showItems = true,
  showAddress = true,
  detailHref,
}: OrderTrackingPanelProps) {
  const [copied, setCopied] = useState(false)
  const progress = getTrackingProgress(order.status)

  const copyTracking = async () => {
    if (!order.trackingNumber) return
    try {
      await navigator.clipboard.writeText(order.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-pink-100">
      <CardHeader className="border-b border-pink-100 bg-pink-50/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label-editorial">Order tracking</p>
            <CardTitle className="mt-1 font-display text-xl">Order {order.id}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            {order.fulfillmentType && (
              <FulfillmentBadge type={order.fulfillmentType} />
            )}
          </div>
        </div>

        {order.status !== "cancelled" && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {order.fulfillmentType === "pickup" ? "Pickup progress" : "Delivery progress"}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-pink-100">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {(order.trackingNumber || order.estimatedDelivery) && (
          <div className="grid gap-3 rounded-xl border border-pink-100 bg-pink-50/40 p-4 sm:grid-cols-2">
            {order.trackingNumber && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Tracking number
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {order.trackingNumber}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-pink-600 hover:bg-pink-100"
                    onClick={copyTracking}
                    aria-label="Copy tracking number"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            {order.estimatedDelivery && order.fulfillmentType !== "pickup" && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-pink-500">
                  Estimated delivery
                </p>
                <p className="mt-1 text-sm font-medium text-ink">
                  {formatDate(order.estimatedDelivery)}
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="mb-4 text-sm font-medium text-ink">Shipment status</p>
          <OrderTrackingTimeline
            status={order.status}
            fulfillmentType={order.fulfillmentType}
            variant="horizontal"
          />
        </div>

        {showItems && order.items && order.items.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
              <Package className="h-4 w-4 text-pink-500" />
              Items in this order
            </p>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-pink-100 p-3"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-14 rounded-lg border border-pink-100 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-pink-100 bg-pink-50 text-xs text-pink-400">
                      IMG
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
            {typeof order.total === "number" && (
              <div className="mt-3 flex justify-between border-t border-pink-100 pt-3 text-sm">
                <span className="text-muted-foreground">Order total</span>
                <span className="font-semibold text-ink">{formatPrice(order.total)}</span>
              </div>
            )}
          </div>
        )}

        {showAddress && order.shippingAddress && (
          <div className="rounded-xl border border-pink-100 p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              <MapPin className="h-4 w-4 text-pink-500" />
              Delivery address
            </p>
            <address className="not-italic text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-ink">{order.shippingAddress.fullName}</span>
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && (
                <>
                  <br />
                  {order.shippingAddress.addressLine2}
                </>
              )}
              <br />
              {order.shippingAddress.city}
              {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
              {order.shippingAddress.pincode ? ` ${order.shippingAddress.pincode}` : ""}
              <br />
              {order.shippingAddress.country}
            </address>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {detailHref && (
            <Button asChild className="rounded-full bg-brand hover:bg-brand-dark">
              <Link href={detailHref}>View full order</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-full border-pink-200">
            <Link href="/categories">Continue shopping</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full text-pink-600">
            <Link href="/help/contact">Need help?</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
