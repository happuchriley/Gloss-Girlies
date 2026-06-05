import { InsufficientStockError, validateOrderStock } from "@/lib/inventory/stock"
import { createAdminClient } from "@/lib/supabase/admin"
import {
  calculateEstimatedDelivery,
  generateTrackingNumber,
} from "@/lib/notifications"
import { generateGuestAccessToken } from "@/lib/guest/session"
import {
  type FulfillmentType,
  resolveCheckoutAddress,
} from "@/lib/orders/fulfillment"
import type { ShippingAddress } from "@/store/orderStore"

export interface CreatePendingOrderItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export type CheckoutContactAddress = Pick<ShippingAddress, "fullName" | "phone"> &
  Partial<Omit<ShippingAddress, "fullName" | "phone">>

export interface CreatePendingOrderInput {
  items: CreatePendingOrderItem[]
  shippingAddress: CheckoutContactAddress
  fulfillmentType?: FulfillmentType
  paymentMethod: string
  total: number
  userId?: string | null
  guest?: { email: string; name: string; phone?: string }
}

export interface CreatePendingOrderResult {
  orderId: string
  trackingNumber: string
  estimatedDelivery: string
  computedTotal: number
  guestAccessToken?: string
}

export async function createPendingOrder(
  input: CreatePendingOrderInput
): Promise<CreatePendingOrderResult> {
  const admin = createAdminClient()
  if (!admin) {
    throw new Error("Server configuration error: admin client unavailable")
  }

  const isGuest = Boolean(input.guest)
  if (!isGuest && !input.userId) {
    throw new Error("User must be authenticated or use guest checkout")
  }
  if (isGuest && !input.guest?.email) {
    throw new Error("Guest email is required")
  }

  const productIds = Array.from(
    new Set(input.items.map((i) => i.id).filter(Boolean))
  )
  const { data: products, error: productsError } = await admin
    .from("products")
    .select("id, price, name, image, stock")
    .in("id", productIds)

  if (productsError) {
    throw new Error("Failed to validate products")
  }

  const priceMap = new Map(
    (products ?? []).map((p) => [p.id, Number(p.price)])
  )

  const validItems = input.items.filter((item) => priceMap.has(item.id))
  if (validItems.length === 0) {
    throw new Error("No valid products in order")
  }

  try {
    await validateOrderStock(
      admin,
      validItems.map((item) => ({ product_id: item.id, quantity: item.quantity }))
    )
  } catch (err) {
    if (err instanceof InsufficientStockError) throw err
    throw new Error("Failed to validate inventory")
  }

  const computedTotal = validItems.reduce((sum, item) => {
    const unitPrice = priceMap.get(item.id) ?? item.price
    return sum + unitPrice * item.quantity
  }, 0)

  if (Math.abs(computedTotal - input.total) > 0.02) {
    throw new Error("Order total does not match product prices")
  }

  const orderId = `ORD-${Date.now()}`
  const trackingNumber = generateTrackingNumber()
  const estimatedDelivery = calculateEstimatedDelivery(5)
  const guestToken = isGuest ? generateGuestAccessToken() : undefined

  const fulfillmentType = input.fulfillmentType ?? "delivery"
  const shippingAddress = resolveCheckoutAddress(
    fulfillmentType,
    input.shippingAddress
  )

  const orderInsert: Record<string, unknown> = {
    id: orderId,
    user_id: isGuest ? null : input.userId,
    total: computedTotal,
    status: "pending",
    shipping_address: shippingAddress,
    fulfillment_type: fulfillmentType,
    payment_method: input.paymentMethod,
    tracking_number: trackingNumber,
    estimated_delivery: estimatedDelivery,
    is_guest: isGuest,
  }

  if (isGuest && input.guest) {
    orderInsert.guest_email = input.guest.email.trim()
    orderInsert.guest_phone = input.guest.phone?.trim() ?? null
    orderInsert.guest_name = input.guest.name.trim()
    orderInsert.guest_access_token = guestToken
  }

  const { error: orderError } = await admin.from("orders").insert(orderInsert)

  if (orderError) {
    throw new Error(orderError.message || "Failed to create order")
  }

  const orderItems = validItems.map((item) => ({
    order_id: orderId,
    product_id: item.id,
    quantity: item.quantity,
    price: priceMap.get(item.id) ?? item.price,
  }))

  const { error: itemsError } = await admin.from("order_items").insert(orderItems)

  if (itemsError) {
    await admin.from("orders").delete().eq("id", orderId)
    throw new Error("Failed to create order items")
  }

  return {
    orderId,
    trackingNumber,
    estimatedDelivery,
    computedTotal,
    guestAccessToken: guestToken,
  }
}
