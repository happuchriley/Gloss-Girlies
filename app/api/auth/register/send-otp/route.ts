import { NextRequest, NextResponse } from "next/server"

import { maskPhoneForDisplay } from "@/lib/auth/otp"
import {
  assertRegistrationContactAvailable,
  createAndSendRegistrationOtp,
  OtpVerificationError,
} from "@/lib/auth/registration-otp"
import { registerSendOtpSchema } from "@/lib/auth/validation"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { normalizeGhanaPhone } from "@/lib/sms/phone"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`auth-register-otp-ip:${ip}`, 10, 60 * 60 * 1000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many verification requests. Please wait and try again." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = registerSendOtpSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizeGhanaPhone(parsed.data.phone)
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Enter a valid Ghana phone number" },
        { status: 400 }
      )
    }

    const phoneLimiter = checkRateLimit(
      `auth-register-otp-phone:${normalizedPhone}`,
      3,
      15 * 60 * 1000
    )
    if (!phoneLimiter.allowed) {
      return NextResponse.json(
        { error: "Please wait before requesting another code for this number." },
        { status: 429 }
      )
    }

    await assertRegistrationContactAvailable({
      phone: normalizedPhone,
      email: parsed.data.email,
    })

    const result = await createAndSendRegistrationOtp({
      phone: normalizedPhone,
      email: parsed.data.email,
    })

    return NextResponse.json({
      success: true,
      verificationId: result.verificationId,
      expiresAt: result.expiresAt,
      maskedPhone: maskPhoneForDisplay(normalizedPhone),
    })
  } catch (error) {
    if (error instanceof OtpVerificationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error("Register send-otp error:", error)
    return NextResponse.json(
      { error: "Could not send verification code. Please try again." },
      { status: 500 }
    )
  }
}
