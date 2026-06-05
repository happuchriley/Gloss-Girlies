"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

import { AdminHeader } from "@/components/admin/admin-header"
import { adminUi } from "@/components/admin/admin-ui"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { FulfillmentBadge } from "@/components/orders/fulfillment-badge"
import { getAdminStatusLabel } from "@/lib/orders/fulfillment"
import { getPaymentMethodLabel } from "@/lib/orders/payment"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import { useOrderStore } from "@/store/orderStore"

const selectClass = adminUi.select

export default function AdminOrderDetailPage() {
  const params = useParams()
  const { getOrderById, updateOrderStatus, initializeOrders } = useOrderStore()
  const [newStatus, setNewStatus] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    initializeOrders()
  }, [initializeOrders])

  const order = getOrderById(params.id as string)

  if (!order) {
    return (
      <PageTransition className="container-app py-16 text-center">
        <h1 className="font-display text-2xl text-ink">Order not found</h1>
        <Link href="/admin/orders" className={`mt-4 inline-block ${adminUi.accentLink}`}>
          Back to orders
        </Link>
      </PageTransition>
    )
  }

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return
    if (!confirm(`Update order status to ${newStatus}?`)) return
    setSaving(true)
    try {
      await updateOrderStatus(order.id, newStatus as Parameters<typeof updateOrderStatus>[1])
      setNewStatus("")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageTransition className="container-app py-6 md:py-10">
      <AdminHeader
        title={`Order ${order.id}`}
        subtitle={`Placed ${formatDate(order.createdAt)}`}
        backHref="/admin/orders"
        backLabel="Back to orders"
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card className={adminUi.card}>
            <CardHeader className={adminUi.cardHeader}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className={adminUi.cardTitle}>Order status</CardTitle>
                  <CardDescription>Update fulfillment progress.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <FulfillmentBadge type={order.fulfillmentType ?? "delivery"} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={newStatus || order.status}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className={selectClass}
                  aria-label="Order status"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">
                    {getAdminStatusLabel("shipped", order.fulfillmentType)}
                  </option>
                  <option value="delivered">
                    {getAdminStatusLabel("delivered", order.fulfillmentType)}
                  </option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {newStatus && newStatus !== order.status && (
                  <Button
                    onClick={handleStatusUpdate}
                    disabled={saving}
                    className={`sm:shrink-0 ${adminUi.primaryBtn}`}
                  >
                    {saving ? "Saving…" : "Update status"}
                  </Button>
                )}
              </div>
              {order.trackingNumber && (
                <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-wider text-neutral-500">Tracking number</p>
                  <p className="mt-1 font-mono font-semibold text-ink">{order.trackingNumber}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className={adminUi.card}>
            <CardHeader className={adminUi.cardHeader}>
              <CardTitle className={adminUi.cardTitle}>Items</CardTitle>
              <CardDescription>{order.items.length} item{order.items.length === 1 ? "" : "s"}</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-pink-50 p-0">
              {(order.items || []).map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl border border-pink-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-ink">{item.name}</h3>
                    <p className="text-sm text-neutral-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={adminUi.card}>
            <CardHeader className={adminUi.cardHeader}>
              <CardTitle className={adminUi.cardTitle}>
                {order.fulfillmentType === "pickup" ? "Pickup details" : "Shipping address"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 text-neutral-700">
              <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.country}</p>
              <p className="mt-2 text-sm">
                <span className="text-neutral-500">Phone:</span> {order.shippingAddress.phone}
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className={`sticky top-20 ${adminUi.card}`}>
            <CardHeader className={adminUi.cardHeader}>
              <CardTitle className={adminUi.cardTitle}>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-pink-100 pt-3">
                <div className="flex justify-between text-lg font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="border-t border-pink-100 pt-3">
                <p className="text-xs uppercase tracking-wider text-neutral-500">Payment</p>
                <p className="mt-1 font-medium text-ink">
                  {getPaymentMethodLabel(
                    order.paymentMethod,
                    order.fulfillmentType ?? "delivery"
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
