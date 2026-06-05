"use client"

import Link from "next/link"
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  Package,
  Plus,
  ShoppingBag,
} from "lucide-react"

import { AdminHeader } from "@/components/admin/admin-header"
import { AdminMetricCard } from "@/components/admin/admin-metric-card"
import { OrderStatusBadge } from "@/components/admin/order-status-badge"
import type { User } from "@/store/authStore"
import type { Order } from "@/store/orderStore"
import { formatDate } from "@/lib/dateUtils"
import { formatPrice } from "@/lib/products/format"
import { PageTransition } from "@/components/layout/page-transition"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminMetrics {
  revenue: number
  totalOrders: number
  totalProducts: number
  pendingOrders: number
  lowStock: number
  outOfStock: number
}

interface AdminDashboardPreviewProps {
  user: User
  metrics: AdminMetrics
  recentOrders: Order[]
}

export function AdminDashboardPreview({
  user,
  metrics,
  recentOrders,
}: AdminDashboardPreviewProps) {
  const needsAttention = metrics.pendingOrders + metrics.lowStock + metrics.outOfStock

  return (
      <PageTransition className="container-app py-6 md:py-10">
        <AdminHeader
          title="Store overview"
          subtitle="Orders, products, and stock — everything in one place."
          action={
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full bg-pink-600 hover:bg-pink-500" disabled>
                <Plus className="h-4 w-4" />
                Add product
              </Button>
              <Button variant="outline" className="rounded-full border-pink-200" asChild>
                <Link href="/">
                  View storefront
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          }
        />

        {needsAttention > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <strong>{needsAttention}</strong> items need attention in the live admin panel.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetricCard
            label="Revenue"
            value={formatPrice(metrics.revenue)}
            icon={CircleDollarSign}
          />
          <AdminMetricCard
            label="Orders"
            value={String(metrics.totalOrders)}
            icon={ShoppingBag}
          />
          <AdminMetricCard
            label="Products"
            value={String(metrics.totalProducts)}
            icon={Package}
          />
          <AdminMetricCard
            label="Pending"
            value={String(metrics.pendingOrders)}
            icon={Clock3}
            critical={metrics.pendingOrders > 0}
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <QuickLinkCard
            href="/preview/admin/orders"
            title="Manage orders"
            description="Update status and fulfill orders."
          />
          <QuickLinkCard
            href="/preview/admin/products"
            title="Manage products"
            description="Add, edit, and update stock levels."
            stockNote={
              metrics.lowStock + metrics.outOfStock > 0
                ? `${metrics.outOfStock} out · ${metrics.lowStock} low`
                : undefined
            }
          />
        </div>

        <Card className="mt-6 overflow-hidden rounded-2xl border-pink-100">
          <CardHeader className="border-b border-pink-100 bg-pink-50/30">
            <CardTitle className="font-display text-xl">Recent orders</CardTitle>
            <CardDescription>Latest activity across the store.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-pink-50 p-0">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div>
                  <p className="font-mono text-sm text-pink-700">{order.id}</p>
                  <p className="text-xs text-neutral-500">
                    {order.shippingAddress?.fullName ?? "Customer"} ·{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </PageTransition>
  )
}

function QuickLinkCard({
  href,
  title,
  description,
  stockNote,
}: {
  href: string
  title: string
  description: string
  stockNote?: string
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full rounded-2xl border-pink-100 transition-all hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/50">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h3 className="font-display text-lg">{title}</h3>
            <p className="mt-1 text-sm text-neutral-500">{description}</p>
            {stockNote && (
              <p className="mt-2 text-xs font-medium text-amber-700">{stockNote}</p>
            )}
          </div>
          <ArrowRight className="h-5 w-5 text-pink-400 transition-transform group-hover:translate-x-0.5" />
        </CardContent>
      </Card>
    </Link>
  )
}
