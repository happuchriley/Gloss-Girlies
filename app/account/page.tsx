"use client"

import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"

import { CustomerDashboard } from "@/components/account/customer-dashboard"
import { AccountAuthPanel } from "@/components/auth/account-auth-panel"
import { useAuthStore } from "@/store/authStore"
import { useCartStore } from "@/store/cartStore"
import { useOrderStore } from "@/store/orderStore"
import { useWishlistStore } from "@/store/wishlistStore"

function AccountPageContent() {
  const {
    isAuthenticated,
    user,
    logout,
    updateUser,
    changePassword,
    deleteAccount,
    loading: authLoading,
  } = useAuthStore()
  const { getOrdersByUser, initializeOrders } = useOrderStore()
  const { productIds, initializeWishlist } = useWishlistStore()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeOrders()
      initializeWishlist()
    }
  }, [isAuthenticated, user, initializeOrders, initializeWishlist])

  useEffect(() => {
    if (!authLoading && user?.role === "admin") {
      router.replace("/admin/profile")
    }
  }, [authLoading, user, router])

  const handleLogout = async () => {
    useCartStore.setState({ items: [] })
    useCartStore.getState().clearCart().catch(() => {})
    try {
      const logoutPromise = logout()
      const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000))
      await Promise.race([logoutPromise, timeoutPromise])
    } catch (err) {
      console.error("Error during logout:", err)
    }
    router.push("/account")
  }

  if (authLoading) {
    return (
      <div className="container-app py-16">
        <div className="mx-auto max-w-md animate-pulse space-y-4">
          <div className="h-8 w-1/2 rounded-2xl bg-pink-100" />
          <div className="h-10 rounded-2xl bg-pink-100" />
          <div className="h-10 rounded-2xl bg-pink-100" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <AccountAuthPanel />
  }

  const userOrders = getOrdersByUser(user.id)

  return (
    <CustomerDashboard
      user={user}
      orders={userOrders}
      wishlistCount={productIds.length}
      onLogout={handleLogout}
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
      onDeleteAccount={async () => {
        const ok = await deleteAccount()
        if (ok) router.push("/")
        return ok
      }}
    />
  )
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-16">
          <div className="mx-auto max-w-md animate-pulse space-y-4">
            <div className="h-8 w-1/2 rounded-2xl bg-pink-100" />
            <div className="h-10 rounded-2xl bg-pink-100" />
          </div>
        </div>
      }
    >
      <AccountPageContent />
    </Suspense>
  )
}
