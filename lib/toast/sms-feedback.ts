import { toast } from "@/lib/toast"

interface SmsSendResult {
  success: boolean
  skipped?: boolean
  message?: string
}

interface StatusSmsPayload {
  skipped?: boolean
  reason?: string
  sms?: {
    customer: SmsSendResult
    admin?: SmsSendResult
  }
}

/** User-facing feedback after an order status change triggers SMS. */
export function toastStatusSmsResult(payload?: StatusSmsPayload) {
  if (!payload) return

  if (payload.skipped) {
    if (payload.reason === "No SMS for this status") return
    if (payload.reason === "No customer phone on order") {
      toast.info("Status updated", "Add a phone number to notify the customer by SMS.")
    }
    return
  }

  const customer = payload.sms?.customer
  if (!customer) return

  if (customer.skipped) {
    toast.info("Status updated", customer.message ?? "SMS is not configured.")
    return
  }

  if (customer.success) {
    toast.success("Status updated", "Customer notified by SMS.")
    return
  }

  toast.error("Status updated", customer.message ?? "SMS could not be sent.")
}
