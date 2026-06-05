import { NextResponse } from "next/server"
import { z } from "zod"

import { syncInventoryForStatusChange } from "@/lib/inventory/stock"
import { getServerSession } from "@/lib/auth/session"
import { sendStatusSmsForOrder } from "@/lib/sms/status-from-order"
import { createAdminClient } from "@/lib/supabase/admin"

const bodySchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
})

export async function POST(request: Request) {
  const { user } = await getServerSession()
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { data: order, error: lookupError } = await admin
    .from("orders")
    .select(
      "id, status, total, fulfillment_type, tracking_number, estimated_delivery, shipping_address, guest_phone, guest_name"
    )
    .eq("id", body.orderId)
    .maybeSingle()

  if (lookupError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }

  const previousStatus = order.status as string
  if (previousStatus === body.status) {
    return NextResponse.json({ ok: true, status: body.status })
  }

  try {
    await syncInventoryForStatusChange(admin, body.orderId, previousStatus, body.status)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Inventory update failed"
    return NextResponse.json({ error: message }, { status: 409 })
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq("id", body.orderId)

  if (updateError) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }

  const smsResult = await sendStatusSmsForOrder(order, body.status)

  return NextResponse.json({
    ok: true,
    status: body.status,
    sms: smsResult,
  })
}
