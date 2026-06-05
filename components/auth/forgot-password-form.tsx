"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-alert"
import { useAuthStore } from "@/store/authStore"
import { forgotPasswordSchema } from "@/lib/auth/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsed = forgotPasswordSchema.safeParse({ email })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid email")
      return
    }

    setLoading(true)
    const result = await forgotPassword(parsed.data.email)
    setLoading(false)

    if (result.success) {
      setSent(true)
    } else {
      setError(result.error ?? "Could not send reset email")
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <p className="font-medium text-ink">Check your inbox</p>
          <p className="text-sm text-neutral-600">
            If an account exists for{" "}
            <strong className="text-ink">{email}</strong>, we sent a secure link
            to reset your password. The link expires after a short time.
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full rounded-full border-pink-200"
          asChild
        >
          <Link href="/account?tab=login">Back to sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 gap-1.5 text-neutral-600 hover:text-pink-700"
        asChild
      >
        <Link href="/account?tab=login">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <AuthAlert variant="error">{error}</AuthAlert>}

        <p className="text-sm text-neutral-600">
          Enter the email on your account. We&apos;ll send a one-time link to
          choose a new password.
        </p>

        <div className="space-y-2">
          <Label htmlFor="forgot-email" className="text-ink">
            Email address
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
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
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>
    </div>
  )
}
