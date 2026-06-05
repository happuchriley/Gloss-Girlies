"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

import { AdminHeader } from "@/components/admin/admin-header"
import { adminUi } from "@/components/admin/admin-ui"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import { FulfillmentBadge } from "@/components/orders/fulfillment-badge"
import { getAdminStatusLabel } from "@/lib/orders/fulfillment"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import type { Order } from "@/store/orderStore"

const selectClass = adminUi.select

interface AdminOrdersViewProps {
  orders: Order[]
  loading?: boolean
  preview?: boolean
  backHref?: string
  orderLinkPrefix?: string
  onStatusChange?: (orderId: string, status: Order["status"]) => Promise<boolean | void>
}

export function AdminOrdersView({
  orders,
  loading = false,
  preview = false,
  backHref = "/admin",
  orderLinkPrefix = "/admin/orders",
  onStatusChange,
}: AdminOrdersViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)
  const [previewStatuses, setPreviewStatuses] = useState<Record<string, Order["status"]>>({})

  const displayOrders = useMemo(
    () =>
      orders.map((o) => ({
        ...o,
        status: previewStatuses[o.id] ?? o.status,
      })),
    [orders, previewStatuses]
  )

  const filteredOrders = useMemo(() => {
    const byStatus =
      filterStatus === "all"
        ? displayOrders
        : displayOrders.filter((o) => o.status === filterStatus)
    if (!query.trim()) return byStatus
    const q = query.trim().toLowerCase()
    return byStatus.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.shippingAddress?.fullName?.toLowerCase().includes(q) ||
        o.shippingAddress?.phone?.toLowerCase().includes(q)
    )
  }, [displayOrders, filterStatus, query])

  const statusCounts = useMemo(
    () => ({
      pending: filteredOrders.filter((o) => o.status === "pending").length,
      confirmed: filteredOrders.filter((o) => o.status === "confirmed").length,
      shipped: filteredOrders.filter((o) => o.status === "shipped").length,
      delivered: filteredOrders.filter((o) => o.status === "delivered").length,
      cancelled: filteredOrders.filter((o) => o.status === "cancelled").length,
    }),
    [filteredOrders]
  )

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    if (preview) {
      setPreviewStatuses((prev) => ({ ...prev, [orderId]: newStatus }))
      return
    }
    if (!onStatusChange) return
    if (!confirm(`Change order status to ${newStatus}?`)) return
    setSavingOrderId(orderId)
    try {
      await onStatusChange(orderId, newStatus)
    } finally {
      setSavingOrderId(null)
    }
  }

  return (
    <>
      <AdminHeader
        title="Orders"
        subtitle="Search, filter, and update fulfillment status."
        backHref={backHref}
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, customer, phone"
              className={`${adminUi.input} sm:w-64`}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={selectClass}
            >
              <option value="all">All orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        }
      />

      <Card className={adminUi.card}>
        <CardHeader className={adminUi.cardHeader}>
          <CardTitle className={adminUi.cardTitle}>
            {filteredOrders.length} order{filteredOrders.length === 1 ? "" : "s"}
          </CardTitle>
          <CardDescription>
            {preview
              ? "Preview mode — status changes are simulated locally."
              : "Click an order ID for full details. Stock deducts when an order is confirmed."}
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs text-neutral-600">
              Pending {statusCounts.pending}
            </span>
            <span className="rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs text-neutral-600">
              Confirmed {statusCounts.confirmed}
            </span>
            <span className="rounded-full border border-pink-200 bg-white px-2.5 py-1 text-xs text-neutral-600">
              Shipped {statusCounts.shipped}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="p-6 text-sm text-neutral-500">No orders found.</p>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-pink-100 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        {preview ? (
                          <p className="truncate font-mono text-sm text-pink-700">{order.id}</p>
                        ) : (
                          <Link
                            href={`${orderLinkPrefix}/${order.id}`}
                            className="truncate font-mono text-sm text-pink-700 hover:underline"
                          >
                            {order.id}
                          </Link>
                        )}
                        <p className="mt-1 text-sm font-medium text-ink">
                          {order.shippingAddress?.fullName || "Customer"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {order.shippingAddress?.phone || "N/A"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <OrderStatusBadge status={order.status} />
                        <FulfillmentBadge type={order.fulfillmentType ?? "delivery"} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink">{formatPrice(order.total)}</span>
                      <span className="text-xs text-neutral-500">{formatDate(order.createdAt)}</span>
                    </div>
                    <select
                      value={order.status}
                      disabled={!preview && savingOrderId === order.id}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as Order["status"])
                      }
                      className={`${selectClass} mt-3 w-full h-9 text-xs`}
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
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
              <table className="min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-pink-100 bg-pink-50/20 text-left text-xs uppercase tracking-wider text-neutral-500">
                    <th className="px-4 py-3 font-medium sm:px-6">Order</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Customer</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell sm:px-6">Items</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Total</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Status</th>
                    <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-6">Date</th>
                    <th className="px-4 py-3 font-medium sm:px-6">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-pink-50/30">
                      <td className="px-4 py-4 sm:px-6">
                        {preview ? (
                          <span className="font-mono text-pink-700">{order.id}</span>
                        ) : (
                          <Link
                            href={`${orderLinkPrefix}/${order.id}`}
                            className="font-mono text-pink-700 hover:underline"
                          >
                            {order.id}
                          </Link>
                        )}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <p className="font-medium text-ink">
                          {order.shippingAddress?.fullName || "Customer"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {order.shippingAddress?.phone || "N/A"}
                        </p>
                      </td>
                      <td className="hidden px-4 py-4 sm:table-cell sm:px-6">
                        {order.items.length}
                      </td>
                      <td className="px-4 py-4 font-semibold sm:px-6">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <div className="flex flex-col gap-1">
                          <OrderStatusBadge status={order.status} />
                          <FulfillmentBadge type={order.fulfillmentType ?? "delivery"} />
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-neutral-500 md:table-cell sm:px-6">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 sm:px-6">
                        <select
                          value={order.status}
                          disabled={!preview && savingOrderId === order.id}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as Order["status"])
                          }
                          className={`${selectClass} h-9 text-xs`}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
