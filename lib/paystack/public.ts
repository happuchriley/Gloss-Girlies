/** Client-safe Paystack helpers (public key only). */

export function isPaystackConfiguredClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)
}

export function getPaystackPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
}
