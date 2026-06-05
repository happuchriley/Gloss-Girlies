"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

import { AdminProfileView } from "@/components/admin/admin-profile-view"
import { PageTransition } from "@/components/layout/page-transition"
import { useOrderStore } from "@/store/orderStore"
import { useProductStore } from "@/store/productStore"
import { useAuthStore } from "@/store/authStore"

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, updateUser, changePassword, logout } = useAuthStore()
  const { orders, initializeOrders } = useOrderStore()
  const { products, initializeProducts } = useProductStore()

  useEffect(() => {
    initializeOrders()
    initializeProducts()
  }, [initializeOrders, initializeProducts])

  const stats = useMemo(() => {
    const totalOrders = (orders ?? []).length
    const toFulfill = (orders ?? []).filter((o) =>
      ["pending", "confirmed"].includes(o.status)
    ).length
    const lowStock = (products ?? []).filter((p) => p.stock > 0 && p.stock < 20).length
    return {
      orders: totalOrders,
      toFulfill,
      lowStock,
    }
  }, [orders, products])

  if (!user) return null

  return (
    <PageTransition className="container-app py-4 md:py-8">
      <AdminProfileView
        user={user}
        stats={stats}
        onProfileUpdate={async (data) =>
          updateUser({
            name: data.name,
            phone: data.phone,
            marketingOptIn: data.marketingOptIn,
          })
        }
        onPasswordChange={async (data) => {
          const ok = await changePassword(
            data.oldPassword,
            data.newPassword,
            data.confirmPassword
          )
          return ok
            ? { ok: true }
            : { ok: false, error: "Current password is incorrect" }
        }}
        onSignOut={async () => {
          await logout()
          router.push("/account?tab=login")
        }}
      />
    </PageTransition>
  )
}
