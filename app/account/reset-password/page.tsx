"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, Loader2, XCircle } from "lucide-react"

import { AuthLayout } from "@/components/auth/auth-layout"
import { useAuthStore } from "@/store/authStore"
import { resetPasswordSchema } from "@/lib/auth/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordContent() {
  const router = useRouter()
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const initialize = useAuthStore((s) => s.initialize)

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { credentials: "same-origin" })
        const data = (await res.json()) as { user: unknown }
        setIsValidSession(!!data.user)
        if (!data.user) {
          setError("Invalid or expired reset link. Request a new password reset.")
        }
      } catch {
        setError("Error validating reset link. Please try again.")
      } finally {
        setCheckingSession(false)
      }
    }

    void checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input")
      return
    }

    setLoading(true)
    const result = await resetPassword(
      parsed.data.password,
      parsed.data.confirmPassword
    )
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? "Failed to reset password.")
      return
    }

    setSuccess(true)
    await initialize()
    setTimeout(() => router.push("/account"), 2000)
  }

  if (checkingSession) {
    return (
      <AuthLayout title="Reset password" subtitle="Validating your secure link…">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </div>
      </AuthLayout>
    )
  }

  if (!isValidSession) {
    return (
      <AuthLayout title="Link expired" subtitle="This reset link is no longer valid">
        <div className="space-y-4 text-center">
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button className="w-full" asChild>
            <Link href="/account?tab=forgot">Request new link</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="You can sign in with your new password">
        <div className="space-y-4 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="text-sm text-muted-foreground">Redirecting to your account…</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" subtitle="Enter a strong password for your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmNewPassword">Confirm password</Label>
          <Input
            id="confirmNewPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : "Update password"}
        </Button>
      </form>
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
