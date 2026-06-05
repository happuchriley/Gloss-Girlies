import {
  getPaystackSecretKey,
  PAYSTACK_API_BASE,
  PAYSTACK_CURRENCY,
  toPaystackAmount,
} from "./config"
import type {
  PaystackApiResponse,
  PaystackInitializeData,
  PaystackTransaction,
} from "./types"

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<PaystackApiResponse<T>> {
  const secret = getPaystackSecretKey()
  if (!secret) {
    throw new Error("Paystack is not configured")
  }

  const res = await fetch(`${PAYSTACK_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })

  const json = (await res.json()) as PaystackApiResponse<T> & { status: boolean }

  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack request failed")
  }

  return json
}

export interface InitializeTransactionInput {
  email: string
  amountGhs: number
  reference: string
  callbackUrl: string
  metadata?: Record<string, unknown>
}

export async function initializeTransaction(
  input: InitializeTransactionInput
): Promise<PaystackInitializeData> {
  const { data } = await paystackFetch<PaystackInitializeData>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: toPaystackAmount(input.amountGhs),
        currency: PAYSTACK_CURRENCY,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: input.metadata,
      }),
    }
  )
  return data
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackTransaction> {
  const { data } = await paystackFetch<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  )
  return data
}
