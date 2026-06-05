import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requireAdmin } from "@/lib/auth/session"
import { sendOrderSms } from "@/lib/sms/order-sms"
import { orderStatusToSmsEvent } from "@/lib/sms/messages"

const statusSmsSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled", "pending"]),
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  orderTotal: z.number().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
})

/** Admin-only: send order status SMS after updating an order. */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = statusSmsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      )
    }

    const event = orderStatusToSmsEvent(parsed.data.status)
    if (!event) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: "No SMS for this status",
      })
    }

    const result = await sendOrderSms({
      event,
      orderId: parsed.data.orderId,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      orderTotal: parsed.data.orderTotal,
      trackingNumber: parsed.data.trackingNumber,
      estimatedDelivery: parsed.data.estimatedDelivery,
      notifyAdmin: false,
    })

    return NextResponse.json({
      success: result.customer.success,
      sms: result,
    })
  } catch (error) {
    console.error("Status SMS error:", error)
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
}
