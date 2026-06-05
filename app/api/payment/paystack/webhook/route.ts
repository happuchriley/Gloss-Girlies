import { NextRequest, NextResponse } from "next/server"

import { fulfillPaystackPayment } from "@/lib/payments/fulfill-paystack"
import { verifyPaystackWebhookSignature } from "@/lib/paystack/webhook"

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get("x-paystack-signature")

  if (!verifyPaystackWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string
      data?: { reference?: string }
    }

    if (event.event === "charge.success" && event.data?.reference) {
      await fulfillPaystackPayment(event.data.reference)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Paystack webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
