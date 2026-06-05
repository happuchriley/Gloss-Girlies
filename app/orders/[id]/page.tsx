'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import BackButton from '@/components/BackButton'
import { OrderStatusBadge } from '@/components/admin/order-status-badge'
import { FulfillmentBadge } from '@/components/orders/fulfillment-badge'
import { OrderTrackingPanel } from '@/components/orders/order-tracking-panel'
import { PageTransition } from '@/components/layout/page-transition'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/dateUtils'
import { getPaymentMethodLabel } from '@/lib/orders/payment'
import { formatPrice } from '@/lib/products/format'
import { useAuthStore } from '@/store/authStore'
import { useOrderStore } from '@/store/orderStore'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { getOrderById, cancelOrder, initializeOrders } = useOrderStore()
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/account')
      return
    }
    initializeOrders()
  }, [isAuthenticated, user, router, initializeOrders])

  if (!isAuthenticated || !user) return null

  const order = getOrderById(params.id as string)

  if (!order) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Link href="/orders" className="mt-2 inline-block text-primary hover:underline">
          Back to orders
        </Link>
      </div>
    )
  }

  const canCancel = order.status === 'pending' || order.status === 'confirmed'

  const handleCancelOrder = async () => {
    if (
      !confirm('Are you sure you want to cancel this order? This action cannot be undone.')
    )
      return
    setIsCancelling(true)
    try {
      const success = await cancelOrder(order.id, user.id)
      if (!success) {
        alert('Cannot cancel this order. It may already be shipped or delivered.')
      }
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <div className="mb-6">
        <div className="mb-4">
          <BackButton label="Back to Orders" />
        </div>
        <h1 className="heading-display text-3xl font-semibold">Order details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <FulfillmentBadge type={order.fulfillmentType ?? "delivery"} />
                </div>
              </div>

              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="mt-4"
                >
                  {isCancelling ? 'Cancelling…' : 'Cancel order'}
                </Button>
              )}

            </CardContent>
          </Card>

          <OrderTrackingPanel
            order={{
              id: order.id,
              status: order.status,
              fulfillmentType: order.fulfillmentType,
              total: order.total,
              trackingNumber: order.trackingNumber,
              estimatedDelivery: order.estimatedDelivery,
              createdAt: order.createdAt,
              shippingAddress: order.shippingAddress,
              paymentMethod: order.paymentMethod,
              items: order.items,
            }}
            showItems={false}
            showAddress={false}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Order items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {order.fulfillmentType === 'pickup' ? 'Pickup details' : 'Shipping address'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1">Phone: {order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment method
                </p>
                <p className="mt-1 font-medium">
                  {getPaymentMethodLabel(
                    order.paymentMethod,
                    order.fulfillmentType ?? 'delivery'
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}

