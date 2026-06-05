import type { FulfillmentType } from "@/lib/orders/fulfillment"

export type CheckoutPaymentMethod = "paystack" | "cod"

/** Label for pay-later option at checkout (COD vs pay on pickup). */
export function getDeferredPaymentLabel(
  fulfillmentType: FulfillmentType
): string {
  return fulfillmentType === "pickup" ? "Pay on pickup" : "Cash on delivery"
}

/** Customer-facing label for any stored payment method. */
export function getPaymentMethodLabel(
  paymentMethod: string,
  fulfillmentType: FulfillmentType = "delivery"
): string {
  if (paymentMethod === "paystack") {
    return "Paystack"
  }
  if (paymentMethod === "card") {
    return "Credit/Debit card"
  }
  if (
    paymentMethod === "pay_on_pickup" ||
    (paymentMethod === "cod" && fulfillmentType === "pickup")
  ) {
    return "Pay on pickup"
  }
  return "Cash on delivery"
}

/** Persisted value for deferred payment (cod vs pay_on_pickup). */
export function resolveStoredPaymentMethod(
  fulfillmentType: FulfillmentType,
  method: CheckoutPaymentMethod
): string {
  if (method === "paystack") return "paystack"
  return fulfillmentType === "pickup" ? "pay_on_pickup" : "cod"
}

export function getCheckoutReviewCta(
  method: CheckoutPaymentMethod,
  fulfillmentType: FulfillmentType
): string {
  if (method === "paystack") return "Pay securely"
  return fulfillmentType === "pickup" ? "Confirm — pay on pickup" : "Place order"
}
