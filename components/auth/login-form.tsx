"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Lock, Mail } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-alert"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/lib/toast"
import { loginSchema } from "@/lib/auth/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/account"
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setLoading(true)
    const result = await login(parsed.data.email, parsed.data.password)
    setLoading(false)

    if (result.success) {
      toast.success("Welcome back!", result.user?.name ? `Signed in as ${result.user.name}` : undefined)
      const destination =
        result.user?.role === "admin" && redirect === "/account"
          ? "/admin"
          : redirect
      router.push(destination)
      router.refresh()
    } else {
      setError(result.error ?? "Sign in failed")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-ink">
          Email address
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="rounded-xl border-pink-200 pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-ink">
          Password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-pink-200 pl-10"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full rounded-full bg-pink-600 hover:bg-pink-500"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link
          href="/account?tab=forgot"
          className="font-medium text-pink-700 underline-offset-4 hover:text-pink-600 hover:underline"
        >
          Forgot your password?
        </Link>
      </p>
    </form>
  )
}
