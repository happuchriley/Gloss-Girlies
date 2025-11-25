import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Supabase configuration - get from environment variables only
// CRITICAL: Next.js only loads NEXT_PUBLIC_* variables at BUILD/START time
// You MUST restart the dev server after creating/updating .env.local

// Get raw values with explicit undefined checks
const supabaseUrlRaw: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKeyRaw: string | undefined =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// Validate and trim - ensure we never pass undefined to createClient
const supabaseUrl: string =
  supabaseUrlRaw && typeof supabaseUrlRaw === "string"
    ? supabaseUrlRaw.trim()
    : "";
const supabaseKey: string =
  supabaseKeyRaw && typeof supabaseKeyRaw === "string"
    ? supabaseKeyRaw.trim()
    : "";

// Create Supabase client with error handling
let supabaseClient: SupabaseClient | null = null;

// CRITICAL: Only create client if BOTH URL and key are valid non-empty strings
// This prevents the "supabaseUrl is required" error
const hasValidUrl = supabaseUrl && supabaseUrl.length > 0;
const hasValidKey = supabaseKey && supabaseKey.length > 0;
const isValidUrlFormat =
  hasValidUrl &&
  (supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://"));

if (hasValidUrl && hasValidKey && isValidUrlFormat) {
  try {
    // Double-check before calling createClient
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          // Session storage: 'localStorage' for persistent sessions (remember me)
          // 'sessionStorage' for temporary sessions (forget on browser close)
          storage:
            typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "supabase.auth.token",
        },
      });

      if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        console.log("✅ Supabase client initialized successfully");
        console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
      }
    }
  } catch (error: any) {
    console.error(
      "Error initializing Supabase client:",
      error?.message || error
    );
    supabaseClient = null;
  }
} else {
  // Log warnings only in browser and development mode
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    if (!hasValidUrl) {
      console.warn("⚠️ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local");
      console.warn(
        "   Add: NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
      );
      console.warn(
        "   ⚠️ IMPORTANT: Restart your dev server (npm run dev) after adding this!"
      );
    }
    if (!hasValidKey) {
      console.warn(
        "⚠️ Supabase key not found. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_KEY in .env.local"
      );
      console.warn("   Add: NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here");
      console.warn(
        "   ⚠️ IMPORTANT: Restart your dev server (npm run dev) after adding this!"
      );
    }
    if (hasValidUrl && !isValidUrlFormat) {
      console.warn(
        "⚠️ NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP/HTTPS URL"
      );
    }
  }
}

// Export supabase client or a safe fallback
export const supabase = supabaseClient || createMockClient();

// Mock client for when Supabase is not configured
function createMockClient(): SupabaseClient {
  return {
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      signUp: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      signOut: () => Promise.resolve({ error: null }),
      updateUser: () =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      onAuthStateChange: () => ({
        data: { subscription: null },
        error: null,
      }),
    },
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          order: (column: string, options?: any) =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured" },
            }),
          single: () =>
            Promise.resolve({
              data: null,
              error: { message: "Supabase not configured" },
            }),
        }),
        single: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
      }),
      insert: (values: any) =>
        Promise.resolve({
          data: null,
          error: { message: "Supabase not configured" },
        }),
      update: (values: any) => ({
        eq: (column: string, value: any) =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
      }),
      delete: () => ({
        eq: (column: string, value: any) =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
      }),
    }),
  } as any;
}

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl &&
    supabaseKey &&
    supabaseUrl.length > 0 &&
    supabaseKey.length > 0 &&
    supabaseClient
  );
};

// Helper to get connection status
export const getSupabaseStatus = (): {
  configured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  hasClient: boolean;
} => {
  return {
    configured: !!(supabaseUrl && supabaseKey && supabaseClient),
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    hasClient: !!supabaseClient,
  };
};

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          phone?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          price: number;
          image: string;
          category: string;
          description: string;
          stock: number;
          sku: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          price: number;
          image: string;
          category: string;
          description: string;
          stock?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          price?: number;
          image?: string;
          category?: string;
          description?: string;
          stock?: number;
          sku?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          total: number;
          status:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          shipping_address: any;
          payment_method: string;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total: number;
          status?:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          shipping_address: any;
          payment_method: string;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total?: number;
          status?:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          shipping_address?: any;
          payment_method?: string;
          tracking_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          full_name: string;
          phone: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          pincode: string;
          country: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          full_name?: string;
          phone?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          pincode?: string;
          country?: string;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment: string;
          images: string[] | null;
          videos: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          rating: number;
          comment: string;
          images?: string[] | null;
          videos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          rating?: number;
          comment?: string;
          images?: string[] | null;
          videos?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
