"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { PageTransition } from "@/components/layout/page-transition"
import { AddressStep } from "@/components/checkout/address-step"
import { CheckoutSteps, type CheckoutStepId } from "@/components/checkout/checkout-steps"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"
import {
  PaymentStep,
  type CheckoutPaymentMethod,
} from "@/components/checkout/payment-step"
import { ReviewStep } from "@/components/checkout/review-step"
import { createCodOrder } from "@/hooks/use-create-order"
import { startPaystackCheckout } from "@/hooks/use-paystack-checkout"
import { isPaystackConfiguredClient } from "@/lib/paystack/public"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import {
  getDeferredPaymentLabel,
  getPaymentMethodLabel,
} from "@/lib/orders/payment"
import { normalizeGhanaPhone } from "@/lib/sms/phone"
import { toast } from "@/lib/toast"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { useOrderStore, type ShippingAddress } from "@/store/orderStore"
import { useAddressStore } from "@/store/addressStore"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const defaultAddress: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Ghana",
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotal, clearCart, initializeCart } = useCartStore()
  const { isAuthenticated, user, isAdmin } = useAuthStore()
  const { initializeOrders } = useOrderStore()
  const { addresses, getDefaultAddress, initializeAddresses } = useAddressStore()

  const [step, setStep] = useState<CheckoutStepId>("address")
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery")

  const handleFulfillmentTypeChange = (type: FulfillmentType) => {
    setFulfillmentType(type)
    if (type === "pickup" && !isPaystackConfiguredClient()) {
      setPaymentMethod("cod")
    }
  }
  const [address, setAddress] = useState<ShippingAddress>(defaultAddress)
  const [guestEmail, setGuestEmail] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>(
    isPaystackConfiguredClient() ? "paystack" : "cod"
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    initializeCart()
  }, [initializeCart])

  useEffect(() => {
    if (user && isAuthenticated) {
      initializeAddresses()
    }
  }, [user, isAuthenticated, initializeAddresses])

  useEffect(() => {
    if (!user) return
    const defaultAddr = getDefaultAddress()
    if (defaultAddr?.fullName) {
      setAddress({
        fullName: defaultAddr.fullName,
        phone: defaultAddr.phone || "",
        addressLine1: defaultAddr.addressLine1,
        addressLine2: defaultAddr.addressLine2,
        city: defaultAddr.city,
        state: defaultAddr.state,
        country: defaultAddr.country || "Ghana",
      })
    } else {
      setAddress((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        phone: user.phone || prev.phone,
      }))
    }
  }, [user, getDefaultAddress])

  if (isAdmin) {
    return (
      <div className="container-app py-16 text-center">
        <Card className="mx-auto max-w-md p-8">
          <h1 className="heading-display text-xl font-semibold">
            Admin accounts cannot purchase
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use a customer account to shop.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin">Admin dashboard</Link>
          </Button>
        </Card>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="heading-display text-2xl font-semibold">Your bag is empty</h1>
        <Button className="mt-6" asChild>
          <Link href="/categories">Continue shopping</Link>
        </Button>
      </div>
    )
  }

  const total = getTotal()

  const validateAddress = () => {
    const next: Record<string, string> = {}
    if (!address.fullName.trim()) next.fullName = "Full name is required"
    if (!address.phone.trim()) {
      next.phone = "Phone is required"
    } else if (!normalizeGhanaPhone(address.phone)) {
      next.phone = "Use format 0XX XXX XXXX or 233XXXXXXXXX"
    }
    if (fulfillmentType === "delivery") {
      if (!address.addressLine1.trim()) next.addressLine1 = "Address is required"
      if (!address.city.trim()) next.city = "City is required"
    }
    if (!isAuthenticated && !guestEmail.trim()) {
      next.guestEmail = "Email is required for guest checkout"
    } else if (
      !isAuthenticated &&
      guestEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)
    ) {
      next.guestEmail = "Enter a valid email"
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAddress()) return
    setStep("payment")
  }

  const handleUseSavedAddress = (saved: {
    fullName?: string
    full_name?: string
    phone?: string
    addressLine1?: string
    address_line1?: string
    addressLine2?: string
    address_line2?: string
    city?: string
    state?: string
    country?: string
  }) => {
    setAddress({
      fullName: saved.fullName || saved.full_name || "",
      phone: saved.phone || "",
      addressLine1: saved.addressLine1 || saved.address_line1 || "",
      addressLine2: saved.addressLine2 || saved.address_line2 || "",
      city: saved.city || "",
      state: saved.state || "",
      country: saved.country || "Ghana",
    })
    setStep("payment")
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (paymentMethod === "paystack" && !isPaystackConfiguredClient()) {
      setErrorMessage(
        `Paystack is not configured. Choose ${getDeferredPaymentLabel(fulfillmentType).toLowerCase()} or contact support.`
      )
      return
    }
    setErrorMessage("")
    setStep("review")
  }

  const handlePlaceOrder = async () => {
    if (!isAuthenticated && !guestEmail.trim()) {
      setErrorMessage("Please enter your email for order updates.")
      return
    }

    setProcessing(true)
    setErrorMessage("")

    try {
      const cartPayload = items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      }))

      if (paymentMethod === "paystack") {
        const result = await startPaystackCheckout({
          items: cartPayload,
          shippingAddress: address,
          fulfillmentType,
          total,
          guest: !isAuthenticated
            ? {
                email: guestEmail.trim(),
                name: address.fullName,
                phone: address.phone,
              }
            : undefined,
        })

        if (!result.ok) {
          setErrorMessage(result.error)
          setProcessing(false)
        }
        return
      }

      const result = await createCodOrder({
        items: cartPayload,
        shippingAddress: address,
        fulfillmentType,
        total,
        guest: !isAuthenticated
          ? {
              email: guestEmail.trim(),
              name: address.fullName,
              phone: address.phone,
            }
          : undefined,
      })

      if (!result.ok) {
        setErrorMessage(result.error)
        setProcessing(false)
        return
      }

      await clearCart()
      void initializeOrders()
      setProcessing(false)
      toast.success(
        "Order placed!",
        fulfillmentType === "pickup"
          ? "We'll text you when your order is ready for pickup."
          : "We'll text order updates to your phone."
      )
      router.push(
        isAuthenticated
          ? `/orders/${result.orderId}`
          : `/track-order?orderId=${result.orderId}`
      )
    } catch {
      setErrorMessage("Something went wrong. Please try again.")
      setProcessing(false)
    }
  }

  const paymentLabel = getPaymentMethodLabel(paymentMethod, fulfillmentType)

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <h1 className="heading-display text-2xl font-semibold md:text-3xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CheckoutSteps current={step} />

          {step === "address" && (
            <AddressStep
              fulfillmentType={fulfillmentType}
              onFulfillmentTypeChange={handleFulfillmentTypeChange}
              address={address}
              onAddressChange={setAddress}
              guestEmail={guestEmail}
              onGuestEmailChange={setGuestEmail}
              isAuthenticated={isAuthenticated}
              savedAddresses={addresses}
              onUseSavedAddress={handleUseSavedAddress}
              errors={errors}
              onSubmit={handleAddressSubmit}
            />
          )}

          {step === "payment" && (
            <PaymentStep
              fulfillmentType={fulfillmentType}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onBack={() => setStep("address")}
              onSubmit={handlePaymentSubmit}
            />
          )}

          {step === "review" && (
            <ReviewStep
              fulfillmentType={fulfillmentType}
              address={address}
              items={items}
              total={total}
              paymentMethod={paymentMethod}
              guestEmail={!isAuthenticated ? guestEmail : undefined}
              processing={processing}
              errorMessage={errorMessage}
              onBack={() => setStep("payment")}
              onPlaceOrder={handlePlaceOrder}
            />
          )}
        </div>

        <div>
          <CheckoutSummary
            items={items}
            total={total}
            paymentLabel={step !== "address" ? paymentLabel : undefined}
          />
        </div>
      </div>
    </PageTransition>
  )
}
