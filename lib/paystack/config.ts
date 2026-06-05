export const PAYSTACK_API_BASE = "https://api.paystack.co"

export function getPaystackSecretKey(): string | undefined {
  return process.env.PAYSTACK_SECRET_KEY
}

export function getPaystackPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
}

export function isPaystackConfigured(): boolean {
  return Boolean(getPaystackSecretKey() && getPaystackPublicKey())
}

export const PAYSTACK_CURRENCY = "GHS"

/** Paystack expects amount in pesewas (smallest GHS unit). */
export function toPaystackAmount(ghs: number): number {
  return Math.round(ghs * 100)
}

export function fromPaystackAmount(pesewas: number): number {
  return pesewas / 100
}

export { getAppUrl } from "@/lib/env/app-url"
