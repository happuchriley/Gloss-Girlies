import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"

const trackSchema = z.object({
  orderId: z.string().min(1),
  email: z.string().email(),
  accessToken: z.string().min(8),
})

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const limiter = checkRateLimit(`track-order:${ip}`, 20, 60_000)
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many tracking attempts. Try again shortly." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const parsed = trackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid tracking details" },
        { status: 400 }
      )
    }

    const { orderId, email, accessToken } = parsed.data
    const supabase = await createClient()

    // RPC typed after migration is applied in Supabase
    const { data: orders, error } = await (
      supabase as unknown as {
        rpc: (
          fn: string,
          args: Record<string, string>
        ) => Promise<{ data: unknown; error: { message: string } | null }>
      }
    ).rpc("track_guest_order", {
      p_order_id: orderId,
      p_email: email,
      p_access_token: accessToken,
    })

    if (error) {
      console.error("track_guest_order error:", error.message)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = Array.isArray(orders) ? orders[0] : orders

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const { data: items } = await supabase
      .from("order_items")
      .select(
        `
        quantity,
        price,
        product_id,
        products:product_id ( id, name, image )
      `
      )
      .eq("order_id", order.id)

    return NextResponse.json({
      order: {
        id: order.id,
        status: order.status,
        total: order.total,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery,
        createdAt: order.created_at,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        fulfillmentType: order.fulfillment_type === "pickup" ? "pickup" : "delivery",
        items: (items ?? []).map((item: Record<string, unknown>) => {
          const products = item.products as { name?: string; image?: string } | null
          return {
            id: item.product_id,
            name: products?.name ?? "Product",
            image: products?.image ?? "",
            price: Number(item.price),
            quantity: Number(item.quantity),
          }
        }),
      },
    })
  } catch {
    return NextResponse.json({ error: "Unable to track order" }, { status: 500 })
  }
}
