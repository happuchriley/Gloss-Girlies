"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"

import { PageTransition } from "@/components/layout/page-transition"
import { saveGuestOrderRef } from "@/lib/guest/session"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams.get("reference")
  const { clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [orderId, setOrderId] = useState<string | null>(null)
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("Missing payment reference.")
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const res = await fetch(
          `/api/payment/paystack/verify?reference=${encodeURIComponent(reference!)}`
        )
        const data = (await res.json()) as {
          success?: boolean
          error?: string
          orderId?: string
          isGuest?: boolean
          guestAccessToken?: string
          trackingNumber?: string
        }

        if (cancelled) return

        if (!res.ok || !data.success) {
          setStatus("error")
          setMessage(data.error ?? "Payment could not be verified.")
          return
        }

        const emailParam = searchParams.get("email")
        if (data.isGuest && data.guestAccessToken && data.orderId && emailParam) {
          saveGuestOrderRef({
            orderId: data.orderId,
            accessToken: data.guestAccessToken,
            email: emailParam,
          })
        }

        await clearCart()
        setOrderId(data.orderId ?? null)
        setTrackingNumber(data.trackingNumber ?? null)
        setStatus("success")
      } catch {
        if (!cancelled) {
          setStatus("error")
          setMessage("Verification failed. If you were charged, contact support with your reference.")
        }
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [reference, clearCart, searchParams])

  useEffect(() => {
    if (status !== "success" || !orderId) return
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.push(`/orders/${orderId}`)
      } else {
        router.push(`/track-order?orderId=${orderId}`)
      }
    }, 4000)
    return () => clearTimeout(timer)
  }, [status, orderId, isAuthenticated, router])

  return (
    <PageTransition className="container-app flex min-h-[50vh] items-center justify-center py-16">
      <Card className="w-full max-w-md text-center">
        <CardContent className="space-y-4 p-8">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <h1 className="heading-display text-xl font-semibold">
                Confirming payment…
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your Paystack payment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
              <h1 className="heading-display text-xl font-semibold">
                Payment successful
              </h1>
              <p className="text-sm text-muted-foreground">
                Thank you! Your order is confirmed.
                {orderId && (
                  <>
                    <br />
                    Order <span className="font-medium text-foreground">{orderId}</span>
                  </>
                )}
                {trackingNumber && (
                  <>
                    <br />
                    Tracking: {trackingNumber}
                  </>
                )}
                <br />
                <span className="text-xs">
                  Order updates will be sent to your phone by SMS.
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Redirecting…</p>
              <Button asChild className="w-full">
                <Link href={orderId ? `/orders/${orderId}` : "/orders"}>
                  View order
                </Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="heading-display text-xl font-semibold">
                Payment issue
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              {reference && (
                <p className="text-xs text-muted-foreground">Reference: {reference}</p>
              )}
              <div className="flex flex-col gap-2 pt-2">
                <Button asChild variant="outline">
                  <Link href="/checkout">Back to checkout</Link>
                </Button>
                <Button asChild>
                  <Link href="/help/contact">Contact support</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
