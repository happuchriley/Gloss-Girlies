"use client"

import Link from "next/link"
import { LogOut, Store } from "lucide-react"

import { LogoutConfirm } from "@/components/feedback/logout-confirm"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { AccountNavItem } from "@/components/account/account-nav"
import type { AccountSection } from "@/components/account/account-nav"

interface AccountShellProps {
  userName: string
  userEmail: string
  activeSection: AccountSection
  onSectionChange: (section: AccountSection) => void
  navItems: AccountNavItem[]
  onLogout?: () => void
  preview?: boolean
  children: React.ReactNode
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: AccountNavItem
  active: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors",
        active
          ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
          : item.id === "danger"
            ? "text-neutral-500 hover:bg-red-50 hover:text-red-700"
            : "text-neutral-600 hover:bg-pink-50 hover:text-ink"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            active ? "bg-white/20 text-white" : "bg-pink-100 text-pink-700"
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}

export function AccountShell({
  userName,
  userEmail,
  activeSection,
  onSectionChange,
  navItems,
  onLogout,
  preview = false,
  children,
}: AccountShellProps) {
  const firstName = userName.split(" ")[0]

  return (
    <div className="container-app py-6 md:py-10">
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-pink-50 via-white to-pink-100/40 px-6 py-8 sm:px-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-pink-200/40 blur-2xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-pink-500">
          My account
        </p>
        <h1 className="mt-2 font-display text-3xl text-ink md:text-4xl">
          Hello, {firstName}
        </h1>
        <p className="mt-2 text-sm text-neutral-600">{userEmail}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
        <aside className="space-y-2">
          <div className="hidden rounded-2xl border border-pink-100 bg-white p-3 lg:block">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-pink-400">
              Menu
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  active={activeSection === item.id}
                  onClick={() => onSectionChange(item.id)}
                />
              ))}
            </nav>
            {!preview && onLogout && (
              <LogoutConfirm
                onLogout={onLogout}
                trigger={(open) => (
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 w-full justify-start gap-3 rounded-2xl text-neutral-500 hover:bg-pink-50 hover:text-ink"
                    onClick={open}
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </Button>
                )}
              />
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems
              .filter((item) => item.id !== "danger")
              .map((item) => {
                const Icon = item.icon
                const active = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-pink-600 text-white"
                        : "border border-pink-200 bg-white text-neutral-600"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="text-xs opacity-80">({item.badge})</span>
                    )}
                  </button>
                )
              })}
          </div>

          <div className="hidden rounded-2xl border border-pink-100 bg-pink-50/30 p-4 lg:block">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-pink-700 hover:text-pink-800"
            >
              <Store className="h-4 w-4" />
              Back to storefront
            </Link>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  )
}
