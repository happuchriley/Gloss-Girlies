import { createHash, randomInt, timingSafeEqual } from "crypto"

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_VERIFY_ATTEMPTS = 5

export function getOtpTtlMs(): number {
  return OTP_TTL_MS
}

export function getMaxOtpVerifyAttempts(): number {
  return MAX_VERIFY_ATTEMPTS
}

export function generateOtpCode(): string {
  return String(randomInt(100_000, 1_000_000))
}

function getOtpSecret(): string {
  return (
    process.env.OTP_HASH_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "gloss-girlies-otp-dev"
  )
}

export function hashOtpCode(code: string, phone: string): string {
  return createHash("sha256")
    .update(`${phone}:${code}:${getOtpSecret()}`)
    .digest("hex")
}

export function verifyOtpCode(
  code: string,
  phone: string,
  storedHash: string
): boolean {
  const computed = hashOtpCode(code, phone)
  try {
    const a = Buffer.from(computed, "hex")
    const b = Buffer.from(storedHash, "hex")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MS)
}

export function maskPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.length < 4) return phone
  const tail = digits.slice(-4)
  if (digits.startsWith("233") && digits.length >= 12) {
    return `+233 *** *** ${tail}`
  }
  if (digits.length === 10 && digits.startsWith("0")) {
    return `0** *** ${tail}`
  }
  return `***${tail}`
}
