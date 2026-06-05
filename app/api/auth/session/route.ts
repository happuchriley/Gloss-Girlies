import { NextResponse } from "next/server"

import { mapProfileToUser, USER_PROFILE_SELECT } from "@/lib/auth/profile"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ user: null })
    }

    const { data: profile } = await supabase
      .from("users")
      .select(USER_PROFILE_SELECT)
      .eq("id", authUser.id)
      .single()

    if (!profile) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: mapProfileToUser(profile, authUser.email_confirmed_at),
    })
  } catch {
    return NextResponse.json({ user: null })
  }
}
