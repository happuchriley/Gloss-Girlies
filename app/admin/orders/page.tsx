"use client"

import { useEffect } from "react"

import { AdminOrdersView } from "@/components/admin/admin-orders-view"
import { PageTransition } from "@/components/layout/page-transition"
import { useOrderStore } from "@/store/orderStore"

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, initializeOrders, loading } = useOrderStore()

  useEffect(() => {
    initializeOrders()
  }, [initializeOrders])

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <AdminOrdersView
        orders={orders ?? []}
        loading={loading}
        onStatusChange={updateOrderStatus}
      />
    </PageTransition>
  )
}
