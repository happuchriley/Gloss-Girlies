import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { dispatchOrderNotifications } from "@/lib/notifications/dispatch-order"

const orderNotificationSchema = z.object({
  type: z.enum(["customer", "admin"]),
  orderId: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  orderTotal: z.number(),
  orderItems: z.array(
    z.object({
      name: z.string(),
      quantity: z.number(),
      price: z.number(),
    })
  ),
  shippingAddress: z.object({
    fullName: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    phone: z.string(),
  }),
  paymentMethod: z.string(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  sendSms: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`notify-order:${ip}`, 20, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = orderNotificationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid notification payload", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const data = parsed.data
    const phone =
      data.customerPhone?.trim() || data.shippingAddress.phone?.trim()

    const payload = {
      orderId: data.orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: phone,
      orderTotal: data.orderTotal,
      orderItems: data.orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery,
    }

    let smsResult

    if (data.type === "customer" && data.sendSms !== false) {
      smsResult = await dispatchOrderNotifications(payload, {
        smsEvent: "order_confirmed",
        notifyAdminSms: true,
      })
    } else if (data.type === "admin") {
      await dispatchOrderNotifications(payload, {})
    }

    return NextResponse.json({
      success: true,
      sms: smsResult?.sms,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    )
  }
}
