"use client"

import Image from "next/image"
import { CheckCircle2, Loader2 } from "lucide-react"

import { pickupLocation } from "@/config/pickup"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import { getFulfillmentLabel } from "@/lib/orders/fulfillment"
import {
  getCheckoutReviewCta,
  getPaymentMethodLabel,
} from "@/lib/orders/payment"
import { formatPrice } from "@/lib/products/format"
import { FulfillmentBadge } from "@/components/orders/fulfillment-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ShippingAddress } from "@/store/orderStore"
import type { CartItem } from "@/store/cartStore"
import type { CheckoutPaymentMethod } from "./payment-step"

interface ReviewStepProps {
  fulfillmentType: FulfillmentType
  address: ShippingAddress
  items: CartItem[]
  total: number
  paymentMethod: CheckoutPaymentMethod
  guestEmail?: string
  processing: boolean
  errorMessage?: string
  onBack: () => void
  onPlaceOrder: () => void
}

export function ReviewStep({
  fulfillmentType,
  address,
  items,
  total,
  paymentMethod,
  guestEmail,
  processing,
  errorMessage,
  onBack,
  onPlaceOrder,
}: ReviewStepProps) {
  const ctaLabel = getCheckoutReviewCta(paymentMethod, fulfillmentType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review your order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {errorMessage && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </p>
        )}

        <section className="rounded-lg border border-border p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">
              {fulfillmentType === "pickup" ? "Pickup details" : "Shipping to"}
            </h3>
            <FulfillmentBadge type={fulfillmentType} />
          </div>
          <p className="mt-2 text-muted-foreground">
            {address.fullName}
            <br />
            {fulfillmentType === "pickup" ? (
              <>
                {pickupLocation.name}
                <br />
                {pickupLocation.addressLine1}, {pickupLocation.city}
                <br />
                {pickupLocation.hours}
              </>
            ) : (
              <>
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                <br />
                {address.city}
                {address.state ? `, ${address.state}` : ""}, {address.country}
              </>
            )}
            <br />
            {address.phone}
          </p>
          {guestEmail && (
            <p className="mt-2 text-muted-foreground">Email: {guestEmail}</p>
          )}
        </section>

        <section className="rounded-lg border border-border p-4 text-sm">
          <h3 className="font-semibold">Payment</h3>
          <p className="mt-2 text-muted-foreground">
            {paymentMethod === "paystack"
              ? "Paystack (card / mobile money / bank)"
              : getPaymentMethodLabel(paymentMethod, fulfillmentType)}
          </p>
        </section>

        <section className="rounded-lg border border-border p-4 text-sm">
          <h3 className="font-semibold">Order updates</h3>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll send {getFulfillmentLabel(fulfillmentType).toLowerCase()} updates by SMS
            to {address.phone}.
            {guestEmail ? ` Email confirmations go to ${guestEmail}.` : ""}
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Items ({items.length})</h3>
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="text-sm font-medium">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
          <p className="text-right text-base font-semibold">
            Total {formatPrice(total)}
          </p>
        </section>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={processing}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={onPlaceOrder}
            disabled={processing}
            className="flex-1"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {ctaLabel}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
