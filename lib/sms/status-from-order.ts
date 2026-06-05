import { isFulfillmentType, type FulfillmentType } from "@/lib/orders/fulfillment"
import { orderStatusToSmsEvent } from "@/lib/sms/messages"
import { sendOrderSms } from "@/lib/sms/order-sms"

type OrderRow = {
  id: string
  total: number | string
  fulfillment_type?: string | null
  tracking_number?: string | null
  estimated_delivery?: string | null
  shipping_address?: {
    fullName?: string
    phone?: string
  } | null
  guest_phone?: string | null
  guest_name?: string | null
}

export async function sendStatusSmsForOrder(
  order: OrderRow,
  status: string
) {
  const event = orderStatusToSmsEvent(status)
  if (!event) {
    return { skipped: true as const, reason: "No SMS for this status" }
  }

  const shipping = order.shipping_address ?? {}
  const customerPhone = shipping.phone?.trim() || order.guest_phone?.trim() || ""
  const customerName = shipping.fullName?.trim() || order.guest_name?.trim() || "Customer"

  if (!customerPhone) {
    return { skipped: true as const, reason: "No customer phone on order" }
  }

  const fulfillmentType: FulfillmentType = isFulfillmentType(order.fulfillment_type)
    ? order.fulfillment_type
    : "delivery"

  const sms = await sendOrderSms({
    event,
    orderId: order.id,
    customerName,
    customerPhone,
    orderTotal: Number(order.total),
    trackingNumber: order.tracking_number ?? undefined,
    estimatedDelivery: order.estimated_delivery ?? undefined,
    fulfillmentType,
    notifyAdmin: false,
  })

  return { skipped: false as const, sms }
}
