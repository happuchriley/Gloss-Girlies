import { getAppUrl } from "@/lib/env/app-url"

export const siteConfig = {
  name: "Gloss Girlies",
  description:
    "Contemporary beauty from Ghana. Curated skincare, makeup, and haircare for calm confidence, not noise.",
  url: getAppUrl(),
  supportEmail: "support@glossgirlies.com",
  supportPhone: "1800-123-4567",
} as const

export const developerCredit = {
  label: "THE MISFITS",
  href: "https://www.themisfits.ro/",
} as const

export const mainNav = [
  { href: "/", label: "Home" },
  { href: "/categories/skincare", label: "Skincare" },
  { href: "/categories/makeup", label: "Makeup" },
  { href: "/categories/haircare", label: "Haircare" },
  { href: "/categories/combos", label: "Combos" },
  { href: "/new", label: "New" },
  { href: "/blog", label: "Blog" },
  { href: "/reviews", label: "Reviews" },
] as const

export const mobileNav = [
  { href: "/", label: "Home", icon: "home" as const },
  { href: "/categories", label: "Shop", icon: "grid" as const },
  { href: "/cart", label: "Cart", icon: "bag" as const },
  { href: "/account", label: "Account", icon: "user" as const },
] as const

/** Minimal parent links — Misfits-style footer (hubs, not every page) */
export const footerNav = {
  shop: [
    { href: "/categories", label: "Shop" },
    { href: "/new", label: "New" },
    { href: "/blog", label: "Blog" },
  ],
  explore: [
    { href: "/help", label: "Help" },
    { href: "/track-order", label: "Track order" },
    { href: "/about", label: "About" },
    { href: "/account", label: "Account" },
  ],
  legal: [{ href: "/policies", label: "Policies" }],
} as const
