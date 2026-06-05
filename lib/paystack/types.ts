export interface PaystackInitializeData {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackApiResponse<T> {
  status: boolean
  message: string
  data: T
}

export interface PaystackTransaction {
  reference: string
  amount: number
  currency: string
  status: string
  paid_at?: string
  channel?: string
  metadata?: {
    order_id?: string
    custom_fields?: Array<{ display_name: string; variable_name: string; value: string }>
  }
}
