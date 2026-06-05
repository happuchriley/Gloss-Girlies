"use client"

import { saveGuestOrderRef } from "@/lib/guest/session"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import type { ShippingAddress } from "@/store/orderStore"

export interface PaystackCheckoutItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface StartPaystackCheckoutInput {
  items: PaystackCheckoutItem[]
  shippingAddress: ShippingAddress
  fulfillmentType: FulfillmentType
  total: number
  guest?: { email: string; name: string; phone?: string }
}

export async function startPaystackCheckout(
  input: StartPaystackCheckoutInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/payment/paystack/initialize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  const data = (await res.json()) as {
    error?: string
    authorizationUrl?: string
    orderId?: string
    guestAccessToken?: string
    guestEmail?: string
  }

  if (!res.ok || !data.authorizationUrl) {
    return { ok: false, error: data.error ?? "Could not start payment" }
  }

  if (data.guestAccessToken && data.guestEmail && data.orderId) {
    saveGuestOrderRef({
      orderId: data.orderId,
      accessToken: data.guestAccessToken,
      email: data.guestEmail,
    })
  }

  window.location.href = data.authorizationUrl
  return { ok: true }
}
