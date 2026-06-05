"use client"

import { CreditCard, Smartphone, Banknote, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import {
  getDeferredPaymentLabel,
  type CheckoutPaymentMethod,
} from "@/lib/orders/payment"
import { isPaystackConfiguredClient } from "@/lib/paystack/public"

export type { CheckoutPaymentMethod }

interface PaymentStepProps {
  fulfillmentType: FulfillmentType
  paymentMethod: CheckoutPaymentMethod
  onPaymentMethodChange: (method: CheckoutPaymentMethod) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}

function paymentOptions(fulfillmentType: FulfillmentType) {
  const isPickup = fulfillmentType === "pickup"
  return [
    {
      id: "paystack" as const,
      title: isPickup ? "Pay now online" : "Pay with Paystack",
      description: isPickup
        ? "Card, mobile money, or bank — collect at the store when ready"
        : "Card, mobile money, and bank transfer — secure checkout",
      icon: CreditCard,
    },
    {
      id: "cod" as const,
      title: getDeferredPaymentLabel(fulfillmentType),
      description: isPickup
        ? "Pay when you collect your order at the store"
        : "Pay when your order arrives",
      icon: Banknote,
    },
  ]
}

export function PaymentStep({
  fulfillmentType,
  paymentMethod,
  onPaymentMethodChange,
  onBack,
  onSubmit,
}: PaymentStepProps) {
  const paystackReady = isPaystackConfiguredClient()
  const options = paymentOptions(fulfillmentType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="h-5 w-5 text-primary" />
          Payment method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            {options.map((option) => {
              const Icon = option.icon
              const isPaystack = option.id === "paystack"
              const disabled = isPaystack && !paystackReady

              return (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors",
                    paymentMethod === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={option.id}
                    checked={paymentMethod === option.id}
                    disabled={disabled}
                    onChange={() => onPaymentMethodChange(option.id)}
                    className="mt-1 accent-primary"
                  />
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium">{option.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                    {disabled && (
                      <p className="mt-1 text-xs text-amber-600">
                        Paystack keys are not configured. Use{" "}
                        {getDeferredPaymentLabel(fulfillmentType).toLowerCase()} or
                        add keys to .env.local.
                      </p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>

          {paymentMethod === "paystack" && paystackReady && (
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                {fulfillmentType === "pickup"
                  ? "Pay now with Paystack — we'll text you when your order is ready to collect."
                  : "You'll be redirected to Paystack to complete payment securely. Your order is confirmed once payment succeeds."}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Back
            </Button>
            <Button type="submit" className="flex-1">
              Review order
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
