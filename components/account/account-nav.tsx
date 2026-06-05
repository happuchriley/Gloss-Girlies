import type { LucideIcon } from "lucide-react"
import {
  Heart,
  LayoutDashboard,
  Lock,
  Package,
  Search,
  ShoppingBag,
  User,
  AlertTriangle,
} from "lucide-react"

export type AccountSection =
  | "overview"
  | "orders"
  | "profile"
  | "security"
  | "danger"

export interface AccountNavItem {
  id: AccountSection
  label: string
  icon: LucideIcon
  badge?: number
}

export interface AccountQuickLink {
  href: string
  label: string
  description: string
  icon: LucideIcon
}

export function buildAccountNav(
  orderCount: number
): AccountNavItem[] {
  return [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: Package, badge: orderCount },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "danger", label: "Delete account", icon: AlertTriangle },
  ]
}

export const ACCOUNT_QUICK_LINKS: AccountQuickLink[] = [
  {
    href: "/wishlist",
    label: "Wishlist",
    description: "Saved products",
    icon: Heart,
  },
  {
    href: "/track-order",
    label: "Track order",
    description: "Guest or order lookup",
    icon: Search,
  },
  {
    href: "/categories",
    label: "Shop",
    description: "Browse collections",
    icon: ShoppingBag,
  },
]
