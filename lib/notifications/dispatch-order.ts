import type { OrderNotificationData } from "@/lib/notifications"
import type { FulfillmentType } from "@/lib/orders/fulfillment"
import { sendOrderSms } from "@/lib/sms/order-sms"
import type { OrderSmsEvent } from "@/lib/sms/messages"

export interface DispatchOrderNotificationsOptions {
  /** Send SMS to customer (and admin on new orders). */
  smsEvent?: OrderSmsEvent
  fulfillmentType?: FulfillmentType
  notifyAdminSms?: boolean
}

/**
 * Server-side order notifications: SMS via BMS/mNotify (+ email logging hook).
 */
export async function dispatchOrderNotifications(
  data: OrderNotificationData,
  options: DispatchOrderNotificationsOptions = {}
): Promise<{ sms?: Awaited<ReturnType<typeof sendOrderSms>> }> {
  const result: { sms?: Awaited<ReturnType<typeof sendOrderSms>> } = {}

  if (options.smsEvent && data.customerPhone) {
    result.sms = await sendOrderSms({
      event: options.smsEvent,
      orderId: data.orderId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      orderTotal: data.orderTotal,
      trackingNumber: data.trackingNumber,
      estimatedDelivery: data.estimatedDelivery,
      fulfillmentType: options.fulfillmentType ?? data.fulfillmentType,
      notifyAdmin: options.notifyAdminSms ?? options.smsEvent === "order_confirmed",
    })
  }

  console.log("Order notification dispatched:", {
    orderId: data.orderId,
    smsEvent: options.smsEvent,
    smsCustomer: result.sms?.customer,
    smsAdmin: result.sms?.admin,
  })

  return result
}
