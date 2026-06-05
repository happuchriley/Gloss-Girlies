import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

export type { Database } from "@/lib/supabase/types"

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
const supabaseKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
)?.trim() ?? ""

const hasValidUrl =
  supabaseUrl.length > 0 &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"))
const hasValidKey = supabaseKey.length > 0

let supabaseClient: SupabaseClient | null = null

if (hasValidUrl && hasValidKey) {
  try {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseKey)
  } catch (error) {
    console.error("Error initializing Supabase client:", error)
    supabaseClient = null
  }
} else if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.warn("⚠️ Supabase not configured — add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local")
}

function createMockClient(): SupabaseClient {
  const notConfigured = { message: "Supabase not configured" }
  return {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null, session: null }, error: notConfigured }),
      signUp: () =>
        Promise.resolve({ data: { user: null, session: null }, error: notConfigured }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: notConfigured }),
      updateUser: () =>
        Promise.resolve({ data: { user: null }, error: notConfigured }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () =>
      ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: notConfigured }),
            order: () => Promise.resolve({ data: null, error: notConfigured }),
          }),
          in: () => Promise.resolve({ data: null, error: notConfigured }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: notConfigured }),
          }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: notConfigured }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: notConfigured }),
        }),
      }),
    rpc: () => Promise.resolve({ data: null, error: notConfigured }),
  } as unknown as SupabaseClient
}

export const supabase = supabaseClient ?? createMockClient()

export const isSupabaseConfigured = (): boolean =>
  !!(hasValidUrl && hasValidKey && supabaseClient)

export const getSupabaseStatus = () => ({
  configured: isSupabaseConfigured(),
  hasUrl: hasValidUrl,
  hasKey: hasValidKey,
  hasClient: !!supabaseClient,
})
