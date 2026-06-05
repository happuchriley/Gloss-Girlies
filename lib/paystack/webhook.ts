import { createHmac, timingSafeEqual } from "crypto"

import { getPaystackSecretKey } from "./config"

export function verifyPaystackWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = getPaystackSecretKey()
  if (!secret || !signature) return false

  const hash = createHmac("sha512", secret).update(rawBody).digest("hex")

  try {
    const a = Buffer.from(hash)
    const b = Buffer.from(signature)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
