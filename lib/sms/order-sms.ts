import type { FulfillmentType } from "@/lib/orders/fulfillment"
import { sendBmsSms } from "./client"
import { getAdminPhone } from "./config"
import {
  buildOrderSmsMessage,
  type OrderSmsContext,
  type OrderSmsEvent,
} from "./messages"
import { normalizeGhanaPhone } from "./phone"

export interface SendOrderSmsInput extends OrderSmsContext {
  customerPhone: string
  event: OrderSmsEvent
  fulfillmentType?: FulfillmentType
  notifyAdmin?: boolean
}

export interface SendOrderSmsResult {
  customer: { success: boolean; skipped?: boolean; message?: string }
  admin?: { success: boolean; skipped?: boolean; message?: string }
}

export async function sendOrderSms(
  input: SendOrderSmsInput
): Promise<SendOrderSmsResult> {
  const normalized = normalizeGhanaPhone(input.customerPhone)
  const customerMessage = buildOrderSmsMessage(input.event, input)

  const customerResult = normalized
    ? await sendBmsSms(normalized, customerMessage)
    : {
        success: false,
        message: "Invalid customer phone number",
      }

  let adminResult: SendOrderSmsResult["admin"]

  if (input.notifyAdmin && input.event === "order_confirmed") {
    const adminPhone = getAdminPhone()
    const adminNormalized = adminPhone ? normalizeGhanaPhone(adminPhone) : null
    if (adminNormalized) {
      const adminMessage = buildOrderSmsMessage("admin_new_order", input)
      adminResult = await sendBmsSms(adminNormalized, adminMessage)
    } else {
      adminResult = { success: true, skipped: true, message: "Admin phone not set" }
    }
  }

  return {
    customer: customerResult,
    admin: adminResult,
  }
}
