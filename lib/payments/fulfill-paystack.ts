import { syncInventoryForStatusChange } from "@/lib/inventory/stock"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyTransaction } from "@/lib/paystack/client"
import { fromPaystackAmount } from "@/lib/paystack/config"
import { dispatchOrderNotifications } from "@/lib/notifications/dispatch-order"
import { isFulfillmentType } from "@/lib/orders/fulfillment"

export interface FulfillPaystackResult {
  success: boolean
  alreadyFulfilled?: boolean
  orderId?: string
  isGuest?: boolean
  guestAccessToken?: string | null
  trackingNumber?: string
  message?: string
}

export async function fulfillPaystackPayment(
  reference: string
): Promise<FulfillPaystackResult> {
  const admin = createAdminClient()
  if (!admin) {
    return { success: false, message: "Server configuration error" }
  }

  const { data: paymentRow, error: paymentLookupError } = await admin
    .from("payments")
    .select("*")
    .eq("reference", reference)
    .maybeSingle()

  if (paymentLookupError || !paymentRow) {
    return { success: false, message: "Payment record not found" }
  }

  const { data: linkedOrder } = await admin
    .from("orders")
    .select("id, is_guest, guest_access_token, tracking_number")
    .eq("id", paymentRow.order_id)
    .maybeSingle()

  if (paymentRow.status === "success") {
    return {
      success: true,
      alreadyFulfilled: true,
      orderId: linkedOrder?.id ?? paymentRow.order_id,
      isGuest: linkedOrder?.is_guest,
      guestAccessToken: linkedOrder?.guest_access_token,
      trackingNumber: linkedOrder?.tracking_number ?? undefined,
    }
  }

  const transaction = await verifyTransaction(reference)

  if (transaction.status !== "success") {
    await admin
      .from("payments")
      .update({ status: "failed", metadata: { channel: transaction.channel } })
      .eq("reference", reference)
    return { success: false, message: "Payment was not successful" }
  }

  const paidAmount = fromPaystackAmount(transaction.amount)
  if (Math.abs(paidAmount - Number(paymentRow.amount)) > 0.02) {
    return { success: false, message: "Payment amount mismatch" }
  }

  const orderId =
    transaction.metadata?.order_id ?? paymentRow.order_id

  const paidAt = transaction.paid_at ?? new Date().toISOString()

  await admin
    .from("payments")
    .update({
      status: "success",
      paid_at: paidAt,
      metadata: {
        channel: transaction.channel,
        paystack_status: transaction.status,
      },
    })
    .eq("reference", reference)

  const { data: orderBefore } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle()

  const previousStatus = (orderBefore?.status as string) ?? "pending"

  try {
    await syncInventoryForStatusChange(admin, orderId, previousStatus, "confirmed")
  } catch (err) {
    console.error("Inventory deduction failed after payment:", err)
    return { success: false, message: "Payment received but inventory could not be updated" }
  }

  await admin
    .from("orders")
    .update({ status: "confirmed", payment_method: "paystack" })
    .eq("id", orderId)

  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single()

  if (!order) {
    return { success: false, message: "Order not found after payment" }
  }

  const { data: orderItems } = await admin
    .from("order_items")
    .select("quantity, price, products(name)")
    .eq("order_id", orderId)

  const shippingAddress = order.shipping_address as {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    country: string
    phone: string
  }

  const customerEmail = order.is_guest
    ? (order.guest_email as string)
    : await resolveUserEmail(admin, order.user_id as string | null)

  const customerName = order.is_guest
    ? (order.guest_name as string)
    : "Customer"

  const customerPhone =
    shippingAddress.phone ||
    (order.guest_phone as string | null) ||
    undefined

  if (customerEmail || customerPhone) {
    const items = (orderItems ?? []).map((row) => {
      const product = row.products as { name?: string } | null
      return {
        name: product?.name ?? "Product",
        quantity: row.quantity,
        price: Number(row.price),
      }
    })

    await dispatchOrderNotifications(
      {
        orderId,
        customerName: shippingAddress.fullName || customerName,
        customerEmail: customerEmail ?? "",
        customerPhone,
        orderTotal: Number(order.total),
        orderItems: items,
        shippingAddress,
        paymentMethod: "paystack",
        fulfillmentType: isFulfillmentType(order.fulfillment_type)
          ? order.fulfillment_type
          : "delivery",
        trackingNumber: order.tracking_number as string | undefined,
        estimatedDelivery: order.estimated_delivery as string | undefined,
      },
      {
        smsEvent: "order_confirmed",
        fulfillmentType: isFulfillmentType(order.fulfillment_type)
          ? order.fulfillment_type
          : "delivery",
        notifyAdminSms: true,
      }
    )
  }

  return {
    success: true,
    orderId,
    isGuest: Boolean(order.is_guest),
    guestAccessToken: order.guest_access_token as string | null,
    trackingNumber: order.tracking_number as string | undefined,
  }
}

async function resolveUserEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string | null
): Promise<string | undefined> {
  if (!userId) return undefined
  const { data } = await admin.auth.admin.getUserById(userId)
  return data.user?.email ?? undefined
}
