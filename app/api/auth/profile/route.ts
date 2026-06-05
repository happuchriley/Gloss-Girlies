import { NextRequest, NextResponse } from "next/server"

import { mapProfileToUser, USER_PROFILE_SELECT } from "@/lib/auth/profile"
import { profileUpdateSchema } from "@/lib/auth/validation"
import { normalizeGhanaPhone } from "@/lib/sms/phone"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = profileUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizeGhanaPhone(parsed.data.phone)

    const { data: profile, error } = await supabase
      .from("users")
      .update({
        name: parsed.data.name,
        phone: normalizedPhone,
        marketing_opt_in: parsed.data.marketingOptIn,
      })
      .eq("id", authUser.id)
      .select(USER_PROFILE_SELECT)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: "Failed to update profile." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: mapProfileToUser(profile, authUser.email_confirmed_at),
    })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
