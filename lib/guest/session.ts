const GUEST_ORDERS_KEY = "gloss-girlies.guest-orders"

export interface GuestOrderRef {
  orderId: string
  accessToken: string
  email: string
}

export function generateGuestAccessToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "")
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`
}

export function saveGuestOrderRef(ref: GuestOrderRef): void {
  if (typeof window === "undefined") return
  const existing = getGuestOrderRefs()
  const next = [ref, ...existing.filter((r) => r.orderId !== ref.orderId)].slice(
    0,
    10
  )
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(next))
}

export function getGuestOrderRefs(): GuestOrderRef[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(GUEST_ORDERS_KEY)
    return raw ? (JSON.parse(raw) as GuestOrderRef[]) : []
  } catch {
    return []
  }
}

export function getGuestOrderRef(orderId: string): GuestOrderRef | undefined {
  return getGuestOrderRefs().find((r) => r.orderId === orderId)
}
