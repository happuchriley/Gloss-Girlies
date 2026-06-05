import { mapProfileToUser, USER_PROFILE_SELECT } from "@/lib/auth/profile"
import type { UserRole } from "@/lib/supabase/types"
import { createClient as createServerClient } from "@/lib/supabase/server"

export interface SessionProfile {
  id: string
  email: string
  name: string
  phone?: string
  role: UserRole
  emailVerified: boolean
  marketingOptIn?: boolean
}

export async function getServerSession(): Promise<{
  user: SessionProfile | null
}> {
  try {
    const supabase = await createServerClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return { user: null }
    }

    const { data: profile } = await supabase
      .from("users")
      .select(USER_PROFILE_SELECT)
      .eq("id", authUser.id)
      .single()

    if (!profile) {
      return { user: null }
    }

    const mapped = mapProfileToUser(profile, authUser.email_confirmed_at)

    return {
      user: {
        id: mapped.id,
        email: mapped.email,
        name: mapped.name,
        phone: mapped.phone,
        role: mapped.role ?? "user",
        emailVerified: !!mapped.emailVerified,
        marketingOptIn: mapped.marketingOptIn,
      },
    }
  } catch {
    return { user: null }
  }
}

export async function requireAdmin(): Promise<SessionProfile> {
  const { user } = await getServerSession()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized")
  }
  return user
}
