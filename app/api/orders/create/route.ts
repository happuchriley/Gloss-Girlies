import { NextRequest, NextResponse } from "next/server"

import { createOrderSchema } from "@/lib/checkout/schemas"
import { dispatchOrderNotifications } from "@/lib/notifications/dispatch-order"
import { resolveCheckoutAddress } from "@/lib/orders/fulfillment"
import { resolveStoredPaymentMethod } from "@/lib/orders/payment"
import { InsufficientStockError } from "@/lib/inventory/stock"
import { createPendingOrder } from "@/lib/orders/create-pending-order"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`order-create:${ip}`, 10, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many order attempts. Please wait and retry." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = createOrderSchema.safeParse(body)

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

    const storedPaymentMethod = resolveStoredPaymentMethod(
      payload.fulfillmentType,
      "cod"
    )

    const order = await createPendingOrder({
      items: payload.items,
      shippingAddress: payload.shippingAddress,
      fulfillmentType: payload.fulfillmentType,
      paymentMethod: storedPaymentMethod,
      total: payload.total,
      userId: user?.id ?? null,
      guest: payload.guest,
    })

    const customerEmail = isGuest
      ? payload.guest!.email
      : user!.email!

    const customerName = isGuest
      ? payload.guest!.name
      : payload.shippingAddress.fullName

    const shippingAddress = resolveCheckoutAddress(
      payload.fulfillmentType,
      payload.shippingAddress
    )

    await dispatchOrderNotifications(
      {
        orderId: order.orderId,
        customerName,
        customerEmail,
        customerPhone:
          shippingAddress.phone || payload.guest?.phone || undefined,
        orderTotal: order.computedTotal,
        orderItems: payload.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod: storedPaymentMethod,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      },
      {
        smsEvent: "order_confirmed",
        fulfillmentType: payload.fulfillmentType,
        notifyAdminSms: true,
      }
    )

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      guestAccessToken: order.guestAccessToken,
      guestEmail: isGuest ? payload.guest!.email : undefined,
    })
  } catch (error) {
    console.error("Create order error:", error)
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 }
    )
  }
}
