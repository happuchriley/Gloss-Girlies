"use client"

import { saveGuestOrderRef } from "@/lib/guest/session"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import type { ShippingAddress } from "@/store/orderStore"

export interface CreateOrderItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface CreateCodOrderInput {
  items: CreateOrderItem[]
  shippingAddress: ShippingAddress
  fulfillmentType: FulfillmentType
  total: number
  guest?: { email: string; name: string; phone?: string }
}

export async function createCodOrder(
  input: CreateCodOrderInput
): Promise<
  | { ok: true; orderId: string }
  | { ok: false; error: string }
> {
  const res = await fetch("/api/orders/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: input.items,
      shippingAddress: input.shippingAddress,
      fulfillmentType: input.fulfillmentType,
      total: input.total,
      paymentMethod: "cod",
      guest: input.guest,
    }),
  })

  const data = (await res.json()) as {
    error?: string
    orderId?: string
    guestAccessToken?: string
    guestEmail?: string
  }

  if (!res.ok || !data.orderId) {
    return { ok: false, error: data.error ?? "Could not create order" }
  }

  if (data.guestAccessToken && data.guestEmail) {
    saveGuestOrderRef({
      orderId: data.orderId,
      accessToken: data.guestAccessToken,
      email: data.guestEmail,
    })
  }

  return { ok: true, orderId: data.orderId }
}
