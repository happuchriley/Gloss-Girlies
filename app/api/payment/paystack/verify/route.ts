import { NextRequest, NextResponse } from "next/server"

import { fulfillPaystackPayment } from "@/lib/payments/fulfill-paystack"
import { isPaystackConfigured } from "@/lib/paystack/config"

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference")

  if (!reference) {
    return NextResponse.json(
      { error: "Payment reference is required" },
      { status: 400 }
    )
  }

  if (!isPaystackConfigured()) {
    return NextResponse.json(
      { error: "Paystack is not configured" },
      { status: 503 }
    )
  }

  try {
    const result = await fulfillPaystackPayment(reference)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message ?? "Payment verification failed" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      alreadyFulfilled: result.alreadyFulfilled ?? false,
      orderId: result.orderId,
      isGuest: result.isGuest,
      guestAccessToken: result.guestAccessToken,
      trackingNumber: result.trackingNumber,
    })
  } catch (error) {
    console.error("Paystack verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    )
  }
}
