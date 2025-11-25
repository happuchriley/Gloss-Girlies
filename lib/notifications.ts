// Notification utilities for sending emails

export interface OrderNotificationData {
  orderId: string
  customerName: string
  customerEmail: string
  orderTotal: number
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  shippingAddress: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state?: string
    country: string
    phone: string
  }
  paymentMethod: string
  trackingNumber?: string
  estimatedDelivery?: string
}

export async function sendOrderNotification(
  type: 'customer' | 'admin',
  data: OrderNotificationData
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        ...data,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending notification:', error)
    return false
  }
}

export function generateTrackingNumber(): string {
  // Generate a tracking number: GG + timestamp + random 4 digits
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.floor(1000 + Math.random() * 9000)
  return `GG${timestamp}${random}`
}

export function calculateEstimatedDelivery(days: number = 5): string {
  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + days)
  return deliveryDate.toISOString().split('T')[0]
}

