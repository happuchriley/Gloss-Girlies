import { NextRequest, NextResponse } from "next/server"

import { mapAuthError } from "@/lib/auth/errors"
import { mapProfileToUser, USER_PROFILE_SELECT } from "@/lib/auth/profile"
import {
  OtpVerificationError,
  verifyRegistrationOtp,
} from "@/lib/auth/registration-otp"
import { registerSchema } from "@/lib/auth/validation"
import { getAppUrl } from "@/lib/env/app-url"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { normalizeGhanaPhone } from "@/lib/sms/phone"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`auth-register:${ip}`, 5, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const {
      name,
      email,
      phone,
      password,
      marketingOptIn,
      verificationId,
      otp,
    } = parsed.data
    const normalizedPhone = normalizeGhanaPhone(phone)

    if (!normalizedPhone) {
      return NextResponse.json(
        { error: "Enter a valid Ghana phone number" },
        { status: 400 }
      )
    }

    try {
      await verifyRegistrationOtp({
        verificationId,
        phone: normalizedPhone,
        email,
        code: otp,
      })
    } catch (error) {
      if (error instanceof OtpVerificationError) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name, phone: normalizedPhone },
        emailRedirectTo: `${getAppUrl()}/api/auth/callback?next=/account`,
      },
    })

    if (error) {
      return NextResponse.json(
        { error: mapAuthError(error.message) },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Registration failed." },
        { status: 500 }
      )
    }

    const phoneVerifiedAt = new Date().toISOString()
    const admin = createAdminClient()
    if (admin) {
      await admin.from("users").upsert({
        id: data.user.id,
        email: email.trim(),
        name,
        phone: normalizedPhone,
        role: "user",
        marketing_opt_in: marketingOptIn,
        email_verified_at: data.user.email_confirmed_at ?? null,
        phone_verified_at: phoneVerifiedAt,
      })
    }

    const { data: profile } = await supabase
      .from("users")
      .select(USER_PROFILE_SELECT)
      .eq("id", data.user.id)
      .single()

    const needsEmailVerification = !data.session

    if (data.session && profile) {
      return NextResponse.json({
        success: true,
        needsEmailVerification: false,
        phoneVerified: true,
        user: mapProfileToUser(profile, data.user.email_confirmed_at),
      })
    }

    return NextResponse.json({
      success: true,
      needsEmailVerification,
      phoneVerified: true,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
