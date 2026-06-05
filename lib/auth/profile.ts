import type { UserRole } from "@/lib/supabase/types"
import type { User } from "@/store/authStore"

export interface UserProfileRow {
  id: string
  email: string
  name: string
  phone: string | null
  role: UserRole
  email_verified_at?: string | null
  phone_verified_at?: string | null
  marketing_opt_in?: boolean | null
}

export function mapProfileToUser(
  profile: UserProfileRow,
  emailConfirmedAt?: string | null
): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone ?? "",
    role: profile.role,
    marketingOptIn: profile.marketing_opt_in ?? false,
    emailVerified:
      !!profile.email_verified_at || !!emailConfirmedAt,
    phoneVerified: !!profile.phone_verified_at,
  }
}

export const USER_PROFILE_SELECT =
  "id, email, name, phone, role, email_verified_at, phone_verified_at, marketing_opt_in"
