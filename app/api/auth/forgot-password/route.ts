import { NextRequest, NextResponse } from "next/server"

import { mapAuthError } from "@/lib/auth/errors"
import { forgotPasswordSchema } from "@/lib/auth/validation"
import { getAppUrl } from "@/lib/env/app-url"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`auth-forgot:${ip}`, 5, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid email" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email.trim(),
      { redirectTo: `${getAppUrl()}/account/reset-password` }
    )

    if (error) {
      return NextResponse.json(
        { error: mapAuthError(error.message) },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
