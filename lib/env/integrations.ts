import { isPaystackConfigured } from "@/lib/paystack/config"
import { isSmsEnabled } from "@/lib/sms/config"
import { isSupabaseConfigured } from "@/lib/supabase"

export interface IntegrationStatus {
  supabase: boolean
  paystack: boolean
  sms: boolean
}

export function getIntegrationStatus(): IntegrationStatus {
  return {
    supabase: isSupabaseConfigured(),
    paystack: isPaystackConfigured(),
    sms: isSmsEnabled(),
  }
}
