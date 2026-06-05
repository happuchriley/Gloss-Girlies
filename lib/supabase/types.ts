export type UserRole = "admin" | "user"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          role: UserRole
          email_verified_at: string | null
          phone_verified_at: string | null
          avatar_url: string | null
          marketing_opt_in: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone?: string | null
          role?: UserRole
          email_verified_at?: string | null
          phone_verified_at?: string | null
          avatar_url?: string | null
          marketing_opt_in?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          role?: UserRole
          email_verified_at?: string | null
          phone_verified_at?: string | null
          avatar_url?: string | null
          marketing_opt_in?: boolean | null
          updated_at?: string
        }
      }
      registration_otps: {
        Row: {
          id: string
          phone: string
          email: string
          otp_hash: string
          expires_at: string
          attempts: number
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          phone: string
          email: string
          otp_hash: string
          expires_at: string
          attempts?: number
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          phone?: string
          email?: string
          otp_hash?: string
          expires_at?: string
          attempts?: number
          verified_at?: string | null
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          price: number
          image: string
          category: string
          description: string
          stock: number
          sku: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          brand: string
          price: number
          image: string
          category: string
          description: string
          stock?: number
          sku?: string | null
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          price?: number
          image?: string
          category?: string
          description?: string
          stock?: number
          sku?: string | null
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          product_id: string
          quantity: number
        }
        Update: {
          user_id?: string
          product_id?: string
          quantity?: number
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total: number
          status: OrderStatus
          shipping_address: Record<string, unknown>
          payment_method: string
          tracking_number: string | null
          estimated_delivery: string | null
          is_guest: boolean
          guest_email: string | null
          guest_phone: string | null
          guest_access_token: string | null
          guest_name: string | null
          fulfillment_type: "delivery" | "pickup"
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id?: string | null
          total: number
          status?: OrderStatus
          shipping_address: Record<string, unknown>
          payment_method: string
          tracking_number?: string | null
          estimated_delivery?: string | null
          is_guest?: boolean
          guest_email?: string | null
          guest_phone?: string | null
          guest_access_token?: string | null
          guest_name?: string | null
          fulfillment_type?: "delivery" | "pickup"
        }
        Update: {
          id?: string
          user_id?: string | null
          total?: number
          status?: OrderStatus
          shipping_address?: Record<string, unknown>
          payment_method?: string
          tracking_number?: string | null
          estimated_delivery?: string | null
          is_guest?: boolean
          guest_email?: string | null
          guest_phone?: string | null
          guest_access_token?: string | null
          guest_name?: string | null
          fulfillment_type?: "delivery" | "pickup"
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          price: number
        }
        Update: {
          order_id?: string
          product_id?: string
          quantity?: number
          price?: number
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          label: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          country?: string
          is_default?: boolean
        }
        Update: {
          user_id?: string
          label?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          country?: string
          is_default?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          images: string[] | null
          videos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          product_id: string
          rating: number
          comment: string
          images?: string[] | null
          videos?: string[] | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          rating?: number
          comment?: string
          images?: string[] | null
          videos?: string[] | null
        }
      }
      wishlist: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          product_id: string
        }
        Update: {
          user_id?: string
          product_id?: string
        }
      }
      shop_categories: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          description?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          title: string
          excerpt: string
          content: string
          image: string
          published: boolean
          author_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          slug: string
          title: string
          excerpt?: string
          content?: string
          image?: string
          published?: boolean
          author_name?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          excerpt?: string
          content?: string
          image?: string
          published?: boolean
          author_name?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          provider: string
          reference: string | null
          amount: number
          currency: string
          status: PaymentStatus
          metadata: Record<string, unknown> | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_id: string
          provider?: string
          reference?: string | null
          amount: number
          currency?: string
          status?: PaymentStatus
          metadata?: Record<string, unknown> | null
        }
        Update: {
          order_id?: string
          provider?: string
          reference?: string | null
          amount?: number
          currency?: string
          status?: PaymentStatus
          metadata?: Record<string, unknown> | null
        }
      }
    }
    Views: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
    Functions: {
      track_guest_order: {
        Args: {
          p_order_id: string
          p_email: string
          p_access_token: string
        }
        Returns: {
          id: string
          user_id: string | null
          total: number
          status: OrderStatus
          shipping_address: Record<string, unknown>
          payment_method: string
          tracking_number: string | null
          estimated_delivery: string | null
          is_guest: boolean
          guest_email: string | null
          guest_phone: string | null
          guest_access_token: string | null
          guest_name: string | null
          created_at: string
          updated_at: string
        }[]
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
  }
}
