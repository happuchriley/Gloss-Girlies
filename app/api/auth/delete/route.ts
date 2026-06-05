import { NextResponse } from "next/server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be deleted." },
        { status: 403 }
      )
    }

    const admin = createAdminClient()
    if (!admin) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      )
    }

    await admin.from("users").delete().eq("id", user.id)

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(user.id)
    if (authDeleteError) {
      console.error("Auth user delete error:", authDeleteError)
    }

    await supabase.auth.signOut()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
