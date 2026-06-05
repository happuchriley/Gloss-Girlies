/**
 * Normalize phone numbers for Ghana SMS gateways (mNotify expects 233XXXXXXXXX).
 */
export function normalizeGhanaPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null

  if (digits.startsWith("233") && digits.length >= 12) {
    return digits.slice(0, 12)
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `233${digits.slice(1)}`
  }

  if (digits.length === 9) {
    return `233${digits}`
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return digits
  }

  return null
}
