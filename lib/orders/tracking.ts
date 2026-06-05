import type { FulfillmentType } from "@/lib/orders/fulfillment"
import type { Order } from "@/store/orderStore"

export type TrackableOrderStatus = Order["status"]

export interface TrackingStep {
  key: TrackableOrderStatus | "placed"
  label: string
  description: string
  completed: boolean
  current: boolean
}

export interface TrackedOrderView {
  id: string
  status: string
  fulfillmentType?: FulfillmentType
  total?: number
  trackingNumber?: string
  estimatedDelivery?: string
  createdAt: string
  shippingAddress?: {
    fullName: string
    phone?: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    pincode?: string
    country: string
  }
  paymentMethod?: string
  items?: {
    id: string
    name: string
    image: string
    price: number
    quantity: number
  }[]
}

const STATUS_ORDER: TrackableOrderStatus[] = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
]

function stepMeta(fulfillmentType: FulfillmentType = "delivery") {
  const isPickup = fulfillmentType === "pickup"
  return {
    pending: {
      label: "Order placed",
      description: isPickup
        ? "We received your pickup order."
        : "We received your order and are preparing it.",
    },
    confirmed: {
      label: "Confirmed",
      description: isPickup
        ? "Payment verified — we're preparing your items."
        : "Payment verified and your order is being packed.",
    },
    shipped: {
      label: isPickup ? "Ready for pickup" : "Shipped",
      description: isPickup
        ? "Your order is packed and waiting at our store."
        : "Your package is on the way.",
    },
    delivered: {
      label: isPickup ? "Picked up" : "Delivered",
      description: isPickup
        ? "Your order has been collected. Enjoy!"
        : "Your order has arrived.",
    },
    cancelled: {
      label: "Cancelled",
      description: "This order was cancelled.",
    },
  } as const
}

export function getStatusLabel(
  status: string,
  fulfillmentType: FulfillmentType = "delivery"
): string {
  const meta = stepMeta(fulfillmentType)
  if (status in meta) {
    return meta[status as TrackableOrderStatus].label
  }
  return status.replace(/_/g, " ")
}

export function getOrderTrackingSteps(
  status: string,
  fulfillmentType: FulfillmentType = "delivery"
): TrackingStep[] {
  const meta = stepMeta(fulfillmentType)

  if (status === "cancelled") {
    return [
      {
        key: "placed",
        label: "Order placed",
        description: meta.pending.description,
        completed: true,
        current: false,
      },
      {
        key: "cancelled",
        label: "Cancelled",
        description: meta.cancelled.description,
        completed: true,
        current: true,
      },
    ]
  }

  const activeIndex = Math.max(
    0,
    STATUS_ORDER.indexOf(status as TrackableOrderStatus)
  )

  return STATUS_ORDER.map((stepStatus, index) => ({
    key: stepStatus,
    label: meta[stepStatus].label,
    description: meta[stepStatus].description,
    completed: index <= activeIndex,
    current: index === activeIndex,
  }))
}

export function getTrackingProgress(status: string): number {
  if (status === "cancelled") return 0
  const index = STATUS_ORDER.indexOf(status as TrackableOrderStatus)
  if (index < 0) return 0
  return Math.round(((index + 1) / STATUS_ORDER.length) * 100)
}
