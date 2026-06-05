"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"

import { AuthAlert } from "@/components/auth/auth-alert"
import { OtpInput } from "@/components/auth/otp-input"
import { Button } from "@/components/ui/button"

interface RegisterOtpStepProps {
  maskedPhone: string
  loading: boolean
  resendLoading: boolean
  resendCooldown: number
  error: string
  onOtpChange: (otp: string) => void
  onSubmit: (otp: string) => void
  onResend: () => void
  onBack: () => void
}

export function RegisterOtpStep({
  maskedPhone,
  loading,
  resendLoading,
  resendCooldown,
  error,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}: RegisterOtpStepProps) {
  const [otp, setOtp] = useState("")

  useEffect(() => {
    onOtpChange(otp)
  }, [otp, onOtpChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(otp)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      <div className="rounded-xl border border-pink-100 bg-pink-50/40 px-4 py-5 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
          <ShieldCheck className="h-5 w-5 text-pink-600" />
        </div>
        <p className="text-sm font-semibold text-ink">Verify your phone number</p>
        <p className="mt-2 text-sm text-neutral-600">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-ink">{maskedPhone}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Code expires in 10 minutes
        </p>
      </div>

      <div className="space-y-3">
        <OtpInput
          value={otp}
          onChange={setOtp}
          disabled={loading}
          error={!!error}
        />
      </div>

      <Button
        type="submit"
        className="w-full rounded-full bg-pink-600 hover:bg-pink-500"
        size="lg"
        disabled={loading || otp.length !== 6}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Creating account…
          </>
        ) : (
          "Verify & create account"
        )}
      </Button>

      <div className="flex flex-col items-center gap-3 text-sm">
        <button
          type="button"
          onClick={onResend}
          disabled={resendLoading || resendCooldown > 0 || loading}
          className="font-medium text-pink-600 hover:text-pink-500 disabled:cursor-not-allowed disabled:text-neutral-400"
        >
          {resendLoading
            ? "Sending…"
            : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend code"}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to details
        </button>
      </div>
    </form>
  )
}
