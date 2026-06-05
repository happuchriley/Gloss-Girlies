"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { cn } from "@/lib/utils"

type AuthTab = "login" | "register" | "forgot"

export function AccountAuthPanel() {
  const searchParams = useSearchParams()
  const tab = (searchParams.get("tab") as AuthTab) || "login"

  const tabs: { id: AuthTab; label: string; href: string }[] = [
    { id: "login", label: "Sign in", href: "/account?tab=login" },
    { id: "register", label: "Register", href: "/account?tab=register" },
  ]

  useEffect(() => {
    if (typeof window === "undefined") return
    const vw = window.innerWidth
    const tabsWrap = document.querySelector("[data-auth-tabs]")
    const tabsRight =
      tabsWrap instanceof HTMLElement ? tabsWrap.getBoundingClientRect().right : null
    // #region agent log
    fetch("http://127.0.0.1:7499/ingest/3cd75832-0f0a-47fa-842a-d550fcddf70b", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d81ef7" }, body: JSON.stringify({ sessionId: "d81ef7", runId: "pre-fix", hypothesisId: "H3", location: "components/auth/account-auth-panel.tsx:26", message: "Auth tabs mobile snapshot", data: { tab, vw, tabsRight, overflow: document.documentElement.scrollWidth - vw }, timestamp: Date.now() }) }).catch(() => {})
    // #endregion
  }, [tab])

  if (tab === "forgot") {
    return (
      <AuthLayout
        title="Forgot password"
        subtitle="We'll email you a secure link to set a new one"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title={tab === "login" ? "Welcome back" : "Create your account"}
      subtitle={
        tab === "login"
          ? "Sign in for faster checkout and order history"
          : "Join Gloss Girlies for exclusive beauty picks"
      }
    >
      <div
        data-auth-tabs
        className="mb-6 flex rounded-full border border-pink-100 bg-pink-50/50 p-1"
      >
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={cn(
              "flex-1 rounded-full py-2 text-center text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-ink text-white shadow-sm"
                : "text-neutral-500 hover:text-pink-700"
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "login" ? <LoginForm /> : <RegisterForm />}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Prefer to shop without an account?{" "}
        <Link href="/checkout" className="font-medium text-foreground hover:underline">
          Continue as guest
        </Link>
      </p>
    </AuthLayout>
  )
}
