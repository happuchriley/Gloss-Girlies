import { NextRequest, NextResponse } from "next/server"

import { paystackInitializeSchema } from "@/lib/checkout/schemas"
import { InsufficientStockError } from "@/lib/inventory/stock"
import { createPendingOrder } from "@/lib/orders/create-pending-order"
import { initializeTransaction } from "@/lib/paystack/client"
import {
  getAppUrl,
  isPaystackConfigured,
} from "@/lib/paystack/config"
import { generatePaystackReference } from "@/lib/paystack/reference"
import { createAdminClient } from "@/lib/supabase/admin"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers)
    const limiter = checkRateLimit(`paystack-init:${ip}`, 10, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please wait and retry." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        }
      )
    }

    if (!isPaystackConfigured()) {
      return NextResponse.json(
        { error: "Paystack is not configured on this server" },
        { status: 503 }
      )
    }

    const body = await request.json()
    const parsed = paystackInitializeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const payload = parsed.data
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const isGuest = Boolean(payload.guest)
    if (!isGuest && !user) {
      return NextResponse.json(
        { error: "Sign in or use guest checkout" },
        { status: 401 }
      )
    }

    const customerEmail = isGuest
      ? payload.guest!.email
      : user!.email!

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Customer email is required for payment" },
        { status: 400 }
      )
    }

    const order = await createPendingOrder({
      items: payload.items,
      shippingAddress: payload.shippingAddress,
      fulfillmentType: payload.fulfillmentType,
      paymentMethod: "paystack",
      total: payload.total,
      userId: user?.id ?? null,
      guest: payload.guest,
    })

    const reference = generatePaystackReference(order.orderId)
    const admin = createAdminClient()

    if (!admin) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const { error: paymentError } = await admin.from("payments").insert({
      order_id: order.orderId,
      provider: "paystack",
      reference,
      amount: order.computedTotal,
      currency: "GHS",
      status: "pending",
      metadata: { initiated_at: new Date().toISOString() },
    })

    if (paymentError) {
      await admin.from("orders").delete().eq("id", order.orderId)
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 }
      )
    }

    const paystack = await initializeTransaction({
      email: customerEmail,
      amountGhs: order.computedTotal,
      reference,
      callbackUrl: `${getAppUrl()}/checkout/success?reference=${encodeURIComponent(reference)}&email=${encodeURIComponent(customerEmail)}`,
      metadata: {
        order_id: order.orderId,
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: order.orderId,
          },
        ],
      },
    })

    return NextResponse.json({
      success: true,
      authorizationUrl: paystack.authorization_url,
      reference: paystack.reference,
      orderId: order.orderId,
      guestAccessToken: order.guestAccessToken,
      guestEmail: isGuest ? payload.guest!.email : undefined,
    })
  } catch (error) {
    console.error("Paystack initialize error:", error)
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to start payment",
      },
      { status: 500 }
    )
  }
}
