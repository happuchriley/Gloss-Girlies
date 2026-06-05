import { NextRequest, NextResponse } from "next/server"

import { mapAuthError } from "@/lib/auth/errors"
import { mapProfileToUser, USER_PROFILE_SELECT } from "@/lib/auth/profile"
import { loginSchema } from "@/lib/auth/validation"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`auth-login:${ip}`, 10, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email.trim(),
      password: parsed.data.password,
    })

    if (error) {
      return NextResponse.json(
        { error: mapAuthError(error.message) },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json({ error: "Sign in failed." }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(USER_PROFILE_SELECT)
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Could not load your profile." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: mapProfileToUser(profile, data.user.email_confirmed_at),
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
