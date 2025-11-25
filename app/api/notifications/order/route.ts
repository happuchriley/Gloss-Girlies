import { NextRequest, NextResponse } from 'next/server'

interface OrderNotificationRequest {
  type: 'customer' | 'admin'
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

export async function POST(request: NextRequest) {
  try {
    const data: OrderNotificationRequest = await request.json()

    // In a production environment, you would:
    // 1. Send email via SMTP (using nodemailer, sendgrid, etc.)
    // 2. Send SMS notifications
    // 3. Send push notifications
    // 4. Store notifications in database

    // For now, we'll log the notification and return success
    // You can integrate with email services like:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Nodemailer with SMTP

    if (data.type === 'customer') {
      console.log('📧 Customer Order Notification:', {
        to: data.customerEmail,
        subject: `Order Confirmation - Order #${data.orderId}`,
        orderId: data.orderId,
        total: data.orderTotal,
        trackingNumber: data.trackingNumber,
      })

      // TODO: Implement actual email sending
      // Example with a service like Resend:
      // await resend.emails.send({
      //   from: 'orders@glossgirlies.com',
      //   to: data.customerEmail,
      //   subject: `Order Confirmation - Order #${data.orderId}`,
      //   html: generateCustomerEmailHTML(data),
      // })
    } else if (data.type === 'admin') {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@glossgirlies.com'
      
      console.log('📧 Admin Order Notification:', {
        to: adminEmail,
        subject: `New Order Received - Order #${data.orderId}`,
        orderId: data.orderId,
        customer: data.customerName,
        total: data.orderTotal,
      })

      // TODO: Implement actual email sending
      // await resend.emails.send({
      //   from: 'orders@glossgirlies.com',
      //   to: adminEmail,
      //   subject: `New Order Received - Order #${data.orderId}`,
      //   html: generateAdminEmailHTML(data),
      // })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// Helper function to generate customer email HTML (for future use)
function generateCustomerEmailHTML(data: OrderNotificationRequest): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #db2777; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Thank you for your order! We've received your order and will process it shortly.</p>
            <div class="order-details">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> #${data.orderId}</p>
              <p><strong>Total:</strong> ₵${data.orderTotal.toFixed(2)}</p>
              ${data.trackingNumber ? `<p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>` : ''}
              ${data.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>` : ''}
            </div>
            <p>You can track your order at: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order">Track Order</a></p>
          </div>
          <div class="footer">
            <p>Gloss Girlies - Your Beauty Destination</p>
          </div>
        </div>
      </body>
    </html>
  `
}

// Helper function to generate admin email HTML (for future use)
function generateAdminEmailHTML(data: OrderNotificationRequest): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #db2777; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Order Received</h1>
          </div>
          <div class="content">
            <p>A new order has been placed:</p>
            <div class="order-details">
              <h2>Order #${data.orderId}</h2>
              <p><strong>Customer:</strong> ${data.customerName}</p>
              <p><strong>Email:</strong> ${data.customerEmail}</p>
              <p><strong>Total:</strong> ₵${data.orderTotal.toFixed(2)}</p>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            </div>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/orders/${data.orderId}">View Order Details</a></p>
          </div>
        </div>
      </body>
    </html>
  `
}

