import { NextRequest, NextResponse } from "next/server"

import { mapAuthError } from "@/lib/auth/errors"
import { changePasswordSchema } from "@/lib/auth/validation"
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers)
  const limiter = checkRateLimit(`auth-password:${ip}`, 5, 60_000)
  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait and try again." },
      { status: 429 }
    )
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = changePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.oldPassword,
    })

    if (signInError) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      )
    }

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    })

    if (error) {
      return NextResponse.json(
        { error: mapAuthError(error.message) },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
