"use client"

import { useCallback, useState } from "react"

import { getGuestOrderRef, getGuestOrderRefs } from "@/lib/guest/session"
import type { TrackedOrderView } from "@/lib/orders/tracking"
import type { Order } from "@/store/orderStore"
import { useOrderStore } from "@/store/orderStore"

export interface TrackOrderInput {
  orderId: string
  trackingNumber: string
  guestEmail: string
  guestToken: string
}

function toTrackedOrder(order: Order | TrackedOrderView): TrackedOrderView {
  return {
    id: order.id,
    status: order.status,
    fulfillmentType:
      "fulfillmentType" in order ? order.fulfillmentType : undefined,
    total: order.total,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    items: order.items?.map((item) => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    })),
  }
}

export function useTrackOrder() {
  const { getOrderById, orders } = useOrderStore()
  const [order, setOrder] = useState<TrackedOrderView | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const track = useCallback(
    async (input: TrackOrderInput) => {
      setError("")
      setOrder(null)
      setLoading(true)

      try {
        const orderId = input.orderId.trim()
        const trackingNumber = input.trackingNumber.trim()
        const guestEmail = input.guestEmail.trim()
        const guestToken = input.guestToken.trim()

        if (orderId) {
          const foundOrder = getOrderById(orderId)
          if (foundOrder) {
            setOrder(toTrackedOrder(foundOrder))
            return { ok: true as const }
          }
        }

        if (trackingNumber) {
          const foundOrder = orders.find(
            (o) =>
              o.trackingNumber &&
              o.trackingNumber.toUpperCase() === trackingNumber.toUpperCase()
          )
          if (foundOrder) {
            setOrder(toTrackedOrder(foundOrder))
            return { ok: true as const }
          }
        }

        if (orderId && guestEmail && guestToken) {
          const res = await fetch("/api/orders/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              email: guestEmail,
              accessToken: guestToken,
            }),
          })
          const data = (await res.json()) as { order?: TrackedOrderView; error?: string }
          if (res.ok && data.order) {
            setOrder(data.order)
            return { ok: true as const }
          }
        }

        if (orderId && !guestToken) {
          const saved = getGuestOrderRefs().find((r) => r.orderId === orderId)
          if (saved) {
            return {
              ok: false as const,
              error: "We filled your email from this device — tap Track again.",
              autofill: saved,
            }
          }
          const single = getGuestOrderRef(orderId)
          if (single) {
            return {
              ok: false as const,
              error: "We filled your email from this device — tap Track again.",
              autofill: single,
            }
          }
        }

        setError(
          "Order not found. Signed-in users can track by order ID. Guests need order ID, email, and access token."
        )
        return { ok: false as const }
      } catch {
        setError("An error occurred while tracking your order.")
        return { ok: false as const }
      } finally {
        setLoading(false)
      }
    },
    [getOrderById, orders]
  )

  const reset = useCallback(() => {
    setOrder(null)
    setError("")
  }, [])

  return { order, error, loading, track, reset, setError }
}
