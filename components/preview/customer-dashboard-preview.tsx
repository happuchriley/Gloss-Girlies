"use client"

import { CustomerDashboard } from "@/components/account/customer-dashboard"
import type { User } from "@/store/authStore"
import type { Order } from "@/store/orderStore"

interface CustomerDashboardPreviewProps {
  user: User
  orders: Order[]
}

export function CustomerDashboardPreview({ user, orders }: CustomerDashboardPreviewProps) {
  return (
    <CustomerDashboard
      user={user}
      orders={orders}
      wishlistCount={3}
      preview
    />
  )
}
