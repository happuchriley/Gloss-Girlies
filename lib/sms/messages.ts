import { pickupLocation } from "@/config/pickup"
import { getAppUrl } from "@/lib/paystack/config"
import type { FulfillmentType } from "@/lib/orders/fulfillment"

export type OrderSmsEvent =
  | "order_confirmed"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "admin_new_order"

export interface OrderSmsContext {
  orderId: string
  customerName: string
  orderTotal?: number
  trackingNumber?: string
  estimatedDelivery?: string
  fulfillmentType?: FulfillmentType
}

function trackUrl(orderId: string): string {
  return `${getAppUrl()}/track-order?orderId=${encodeURIComponent(orderId)}`
}

function formatTotal(total?: number): string {
  if (total === undefined) return ""
  return `GHS ${total.toFixed(2)}. `
}

export function buildOrderSmsMessage(
  event: OrderSmsEvent,
  ctx: OrderSmsContext
): string {
  const name = ctx.customerName.split(" ")[0] || "there"
  const id = ctx.orderId
  const track = trackUrl(id)
  const isPickup = ctx.fulfillmentType === "pickup"
  const pickupAddr = `${pickupLocation.addressLine1}, ${pickupLocation.city}`

  switch (event) {
    case "order_confirmed":
      return isPickup
        ? `Gloss Girlies: Hi ${name}! Pickup order ${id} is confirmed. ${formatTotal(ctx.orderTotal)}Collect at ${pickupAddr}. ${pickupLocation.hours}. Track: ${track}`
        : `Gloss Girlies: Hi ${name}! Order ${id} is confirmed. ${formatTotal(ctx.orderTotal)}Track: ${track}`
    case "order_shipped":
      return isPickup
        ? `Gloss Girlies: Order ${id} is ready for pickup at ${pickupAddr}. ${pickupLocation.hours}. ${pickupLocation.note} Track: ${track}`
        : `Gloss Girlies: Order ${id} has shipped!${ctx.trackingNumber ? ` Tracking: ${ctx.trackingNumber}.` : ""}${ctx.estimatedDelivery ? ` Est. delivery ${ctx.estimatedDelivery}.` : ""} ${track}`
    case "order_delivered":
      return isPickup
        ? `Gloss Girlies: Order ${id} was picked up. We hope you love it! Questions? ${getAppUrl()}/help/contact`
        : `Gloss Girlies: Order ${id} was delivered. We hope you love it! Questions? Visit ${getAppUrl()}/help/contact`
    case "order_cancelled":
      return `Gloss Girlies: Order ${id} has been cancelled. Contact us at ${getAppUrl()}/help/contact if you need help.`
    case "admin_new_order":
      return `Gloss Girlies ADMIN: New ${isPickup ? "pickup" : "delivery"} order ${id} from ${ctx.customerName}. ${formatTotal(ctx.orderTotal)}View: ${getAppUrl()}/admin/orders/${id}`
    default:
      return `Gloss Girlies: Update for order ${id}. ${track}`
  }
}

export function orderStatusToSmsEvent(
  status: string
): OrderSmsEvent | null {
  switch (status) {
    case "confirmed":
      return "order_confirmed"
    case "shipped":
      return "order_shipped"
    case "delivered":
      return "order_delivered"
    case "cancelled":
      return "order_cancelled"
    default:
      return null
  }
}
