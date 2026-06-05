"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { useOrderStore } from "@/store/orderStore"

export default function AuthInitializer() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const onFocus = () => {
      void initialize()
      const { isAuthenticated } = useAuthStore.getState()
      if (isAuthenticated) {
        useOrderStore.getState().initializeOrders()
      }
    }

    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [initialize])

  return null
}
