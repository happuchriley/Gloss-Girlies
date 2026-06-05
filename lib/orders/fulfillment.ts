import { pickupLocation } from "@/config/pickup"
import type { ShippingAddress } from "@/store/orderStore"

export type FulfillmentType = "delivery" | "pickup"

export function isFulfillmentType(value: unknown): value is FulfillmentType {
  return value === "delivery" || value === "pickup"
}

export function getFulfillmentLabel(type: FulfillmentType): string {
  return type === "pickup" ? "Store pickup" : "Delivery"
}

/** Admin-facing status labels that reflect delivery vs pickup. */
export function getAdminStatusLabel(
  status: string,
  fulfillmentType: FulfillmentType = "delivery"
): string {
  if (fulfillmentType === "pickup") {
    switch (status) {
      case "shipped":
        return "Ready for pickup"
      case "delivered":
        return "Picked up"
      default:
        break
    }
  }
  switch (status) {
    case "pending":
      return "Pending"
    case "confirmed":
      return "Confirmed"
    case "shipped":
      return "Shipped"
    case "delivered":
      return "Delivered"
    case "cancelled":
      return "Cancelled"
    default:
      return status
  }
}

export function buildPickupShippingAddress(
  contact: Pick<ShippingAddress, "fullName" | "phone">
): ShippingAddress {
  return {
    fullName: contact.fullName.trim(),
    phone: contact.phone.trim(),
    addressLine1: pickupLocation.addressLine1,
    addressLine2: pickupLocation.addressLine2,
    city: pickupLocation.city,
    state: pickupLocation.state,
    country: pickupLocation.country,
  }
}

/** Normalize checkout address based on fulfillment type before persisting. */
export function resolveCheckoutAddress(
  fulfillmentType: FulfillmentType,
  address: Pick<ShippingAddress, "fullName" | "phone"> &
    Partial<Omit<ShippingAddress, "fullName" | "phone">>
): ShippingAddress {
  if (fulfillmentType === "pickup") {
    return buildPickupShippingAddress(address)
  }
  return {
    fullName: address.fullName.trim(),
    phone: address.phone.trim(),
    addressLine1: address.addressLine1?.trim() ?? "",
    addressLine2: address.addressLine2,
    city: address.city?.trim() ?? "",
    state: address.state,
    pincode: address.pincode,
    country: address.country?.trim() ?? "Ghana",
  }
}
