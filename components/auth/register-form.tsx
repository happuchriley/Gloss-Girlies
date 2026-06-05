"use client"



import { useCallback, useEffect, useState } from "react"

import { useRouter } from "next/navigation"

import { Loader2, Lock, Mail, Phone, User } from "lucide-react"



import { AuthAlert } from "@/components/auth/auth-alert"

import { RegisterOtpStep } from "@/components/auth/register-otp-step"

import { useAuthStore } from "@/store/authStore"

import {
  registerDetailsSchema,
  registerSchema,
  registerSendOtpSchema,
} from "@/lib/auth/validation"

import { Button } from "@/components/ui/button"

import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"



function FieldHint({ children }: { children: React.ReactNode }) {

  return <p className="text-xs text-neutral-500">{children}</p>

}



function SectionTitle({ children }: { children: React.ReactNode }) {

  return (

    <p className="text-xs font-semibold uppercase tracking-wider text-pink-600">

      {children}

    </p>

  )

}



type RegisterStep = "details" | "verify"



const RESEND_COOLDOWN_SEC = 60



export function RegisterForm() {

  const router = useRouter()

  const sendRegistrationOtp = useAuthStore((s) => s.sendRegistrationOtp)

  const register = useAuthStore((s) => s.register)



  const [step, setStep] = useState<RegisterStep>("details")

  const [name, setName] = useState("")

  const [email, setEmail] = useState("")

  const [phone, setPhone] = useState("")

  const [password, setPassword] = useState("")

  const [confirmPassword, setConfirmPassword] = useState("")

  const [marketingOptIn, setMarketingOptIn] = useState(false)

  const [verificationId, setVerificationId] = useState("")

  const [maskedPhone, setMaskedPhone] = useState("")

  const [otp, setOtp] = useState("")

  const [error, setError] = useState("")

  const [success, setSuccess] = useState("")

  const [loading, setLoading] = useState(false)

  const [resendLoading, setResendLoading] = useState(false)

  const [resendCooldown, setResendCooldown] = useState(0)



  useEffect(() => {

    if (resendCooldown <= 0) return

    const timer = window.setInterval(() => {

      setResendCooldown((prev) => Math.max(0, prev - 1))

    }, 1000)

    return () => window.clearInterval(timer)

  }, [resendCooldown])



  const handleOtpChange = useCallback((value: string) => {

    setOtp(value)

  }, [])



  const sendOtp = async () => {

    const parsed = registerSendOtpSchema.safeParse({ phone, email })

    if (!parsed.success) {

      setError(parsed.error.issues[0]?.message ?? "Invalid input")

      return false

    }



    const result = await sendRegistrationOtp({

      phone: parsed.data.phone,

      email: parsed.data.email,

    })



    if (!result.success) {

      setError(result.error)

      return false

    }



    setVerificationId(result.verificationId)

    setMaskedPhone(result.maskedPhone)

    setResendCooldown(RESEND_COOLDOWN_SEC)

    setError("")

    return true

  }



  const handleDetailsSubmit = async (e: React.FormEvent) => {

    e.preventDefault()

    setError("")

    setSuccess("")



    const parsed = registerDetailsSchema.safeParse({

      name,

      email,

      password,

      confirmPassword,

      phone,

      marketingOptIn,

    })



    if (!parsed.success) {

      setError(parsed.error.issues[0]?.message ?? "Invalid input")

      return

    }



    setLoading(true)

    const sent = await sendOtp()

    setLoading(false)



    if (!sent) return



    setStep("verify")

  }



  const handleVerifySubmit = async (code: string) => {

    setError("")

    setSuccess("")



    const parsed = registerSchema.safeParse({

      name,

      email,

      password,

      confirmPassword,

      phone,

      marketingOptIn,

      verificationId,

      otp: code,

    })



    if (!parsed.success) {

      setError(parsed.error.issues[0]?.message ?? "Invalid input")

      return

    }



    setLoading(true)

    const result = await register({

      name: parsed.data.name,

      email: parsed.data.email,

      password: parsed.data.password,

      confirmPassword: parsed.data.confirmPassword,

      phone: parsed.data.phone,

      marketingOptIn: parsed.data.marketingOptIn,

      verificationId: parsed.data.verificationId,

      otp: parsed.data.otp,

    })

    setLoading(false)



    if (!result.success) {

      setError(result.error ?? "Registration failed")

      return

    }



    if (result.needsEmailVerification) {

      setSuccess(

        "Phone verified! Check your email to confirm your address, then sign in."

      )

      return

    }



    router.push("/account")

    router.refresh()

  }



  const handleResend = async () => {

    setError("")

    setResendLoading(true)

    const sent = await sendOtp()

    setResendLoading(false)

    if (sent) {

      setOtp("")

    }

  }



  const handleBack = () => {

    setStep("details")

    setOtp("")

    setError("")

  }



  if (step === "verify") {

    return (

      <>

        {success && <AuthAlert variant="success">{success}</AuthAlert>}

        <RegisterOtpStep

          maskedPhone={maskedPhone}

          loading={loading}

          resendLoading={resendLoading}

          resendCooldown={resendCooldown}

          error={error}

          onOtpChange={handleOtpChange}

          onSubmit={handleVerifySubmit}

          onResend={handleResend}

          onBack={handleBack}

        />

      </>

    )

  }



  return (

    <form onSubmit={handleDetailsSubmit} className="space-y-6">

      {error && <AuthAlert variant="error">{error}</AuthAlert>}

      {success && <AuthAlert variant="success">{success}</AuthAlert>}



      <div className="space-y-4">

        <SectionTitle>Your details</SectionTitle>



        <div className="space-y-2">

          <Label htmlFor="name" className="text-ink">

            Full name <span className="text-pink-600">*</span>

          </Label>

          <div className="relative">

            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

            <Input

              id="name"

              value={name}

              onChange={(e) => setName(e.target.value)}

              autoComplete="name"

              className="rounded-xl border-pink-200 pl-10"

              required

            />

          </div>

        </div>



        <div className="space-y-2">

          <Label htmlFor="reg-email" className="text-ink">

            Email address <span className="text-pink-600">*</span>

          </Label>

          <div className="relative">

            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

            <Input

              id="reg-email"

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              autoComplete="email"

              placeholder="you@example.com"

              className="rounded-xl border-pink-200 pl-10"

              required

            />

          </div>

        </div>



        <div className="space-y-2">

          <Label htmlFor="phone" className="text-ink">

            Phone number <span className="text-pink-600">*</span>

          </Label>

          <div className="relative">

            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

            <Input

              id="phone"

              type="tel"

              value={phone}

              onChange={(e) => setPhone(e.target.value)}

              autoComplete="tel"

              placeholder="0XX XXX XXXX"

              className="rounded-xl border-pink-200 pl-10"

              required

            />

          </div>

          <FieldHint>

            We&apos;ll send a one-time code by SMS to verify this number.

          </FieldHint>

        </div>

      </div>



      <div className="space-y-4 border-t border-pink-100 pt-6">

        <SectionTitle>Security</SectionTitle>



        <div className="space-y-2">

          <Label htmlFor="reg-password" className="text-ink">

            Password <span className="text-pink-600">*</span>

          </Label>

          <div className="relative">

            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

            <Input

              id="reg-password"

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              autoComplete="new-password"

              className="rounded-xl border-pink-200 pl-10"

              required

            />

          </div>

          <FieldHint>At least 8 characters with letters and numbers.</FieldHint>

        </div>



        <div className="space-y-2">

          <Label htmlFor="confirm-password" className="text-ink">

            Confirm password <span className="text-pink-600">*</span>

          </Label>

          <div className="relative">

            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-400" />

            <Input

              id="confirm-password"

              type="password"

              value={confirmPassword}

              onChange={(e) => setConfirmPassword(e.target.value)}

              autoComplete="new-password"

              className="rounded-xl border-pink-200 pl-10"

              required

            />

          </div>

        </div>

      </div>



      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-pink-100 bg-pink-50/40 px-3 py-3">

        <input

          type="checkbox"

          checked={marketingOptIn}

          onChange={(e) => setMarketingOptIn(e.target.checked)}

          className="mt-0.5 h-4 w-4 rounded border-pink-300 text-pink-600"

        />

        <span className="text-sm text-neutral-600">

          Send me beauty tips, new arrivals, and offers by email or SMS

          (optional)

        </span>

      </label>



      <Button

        type="submit"

        className="w-full rounded-full bg-pink-600 hover:bg-pink-500"

        size="lg"

        disabled={loading}

      >

        {loading ? (

          <>

            <Loader2 className="animate-spin" />

            Sending code…

          </>

        ) : (

          "Send verification code"

        )}

      </Button>

    </form>

  )

}


