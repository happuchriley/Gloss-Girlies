import {
  generateOtpCode,
  getMaxOtpVerifyAttempts,
  getOtpExpiryDate,
  hashOtpCode,
  verifyOtpCode,
} from "@/lib/auth/otp"
import { sendBmsSms } from "@/lib/sms/client"
import { isSmsEnabled } from "@/lib/sms/config"
import { createAdminClient } from "@/lib/supabase/admin"

export interface RegistrationOtpRecord {
  id: string
  phone: string
  email: string
  otp_hash: string
  expires_at: string
  attempts: number
  verified_at: string | null
}

export class OtpVerificationError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_found"
      | "expired"
      | "invalid"
      | "too_many_attempts"
      | "phone_mismatch"
      | "email_mismatch"
      | "already_verified"
      | "sms_failed"
  ) {
    super(message)
    this.name = "OtpVerificationError"
  }
}

function registrationOtpMessage(code: string): string {
  return `Gloss Girlies: Your verification code is ${code}. Valid for 10 minutes. Do not share this code.`
}

export async function createAndSendRegistrationOtp(input: {
  phone: string
  email: string
}): Promise<{ verificationId: string; expiresAt: string }> {
  const admin = createAdminClient()
  if (!admin) {
    throw new Error("Server configuration error")
  }

  const code = generateOtpCode()
  const expiresAt = getOtpExpiryDate()

  await admin
    .from("registration_otps")
    .delete()
    .eq("phone", input.phone)
    .is("verified_at", null)

  const { data, error } = await admin
    .from("registration_otps")
    .insert({
      phone: input.phone,
      email: input.email.trim().toLowerCase(),
      otp_hash: hashOtpCode(code, input.phone),
      expires_at: expiresAt.toISOString(),
    })
    .select("id, expires_at")
    .single()

  if (error || !data) {
    throw new Error(error?.message || "Could not create verification code")
  }

  if (!isSmsEnabled()) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        `[dev] Registration OTP for ${input.phone}: ${code} (SMS disabled)`
      )
      return {
        verificationId: data.id,
        expiresAt: data.expires_at,
      }
    }
    throw new OtpVerificationError(
      "SMS verification is not configured. Please try again later.",
      "sms_failed"
    )
  }

  const sms = await sendBmsSms(input.phone, registrationOtpMessage(code))
  if (!sms.success && !sms.skipped) {
    await admin.from("registration_otps").delete().eq("id", data.id)
    throw new OtpVerificationError(
      sms.message || "Could not send verification SMS. Please try again.",
      "sms_failed"
    )
  }

  return {
    verificationId: data.id,
    expiresAt: data.expires_at,
  }
}

export async function verifyRegistrationOtp(input: {
  verificationId: string
  phone: string
  email: string
  code: string
}): Promise<void> {
  const admin = createAdminClient()
  if (!admin) {
    throw new Error("Server configuration error")
  }

  const { data, error } = await admin
    .from("registration_otps")
    .select("id, phone, email, otp_hash, expires_at, attempts, verified_at")
    .eq("id", input.verificationId)
    .maybeSingle()

  if (error || !data) {
    throw new OtpVerificationError(
      "Verification code not found. Request a new code.",
      "not_found"
    )
  }

  const record = data as RegistrationOtpRecord

  if (record.verified_at) {
    throw new OtpVerificationError(
      "This code was already used. Request a new code.",
      "already_verified"
    )
  }

  if (record.phone !== input.phone) {
    throw new OtpVerificationError(
      "Phone number does not match this verification.",
      "phone_mismatch"
    )
  }

  if (record.email !== input.email.trim().toLowerCase()) {
    throw new OtpVerificationError(
      "Email does not match this verification.",
      "email_mismatch"
    )
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    throw new OtpVerificationError(
      "Verification code expired. Request a new code.",
      "expired"
    )
  }

  if (record.attempts >= getMaxOtpVerifyAttempts()) {
    throw new OtpVerificationError(
      "Too many incorrect attempts. Request a new code.",
      "too_many_attempts"
    )
  }

  const valid = verifyOtpCode(input.code, input.phone, record.otp_hash)
  if (!valid) {
    await admin
      .from("registration_otps")
      .update({ attempts: record.attempts + 1 })
      .eq("id", record.id)

    throw new OtpVerificationError(
      "Incorrect verification code. Please try again.",
      "invalid"
    )
  }

  const { error: updateError } = await admin
    .from("registration_otps")
    .update({ verified_at: new Date().toISOString() })
    .eq("id", record.id)

  if (updateError) {
    throw new Error("Could not complete phone verification")
  }
}

export async function assertRegistrationContactAvailable(input: {
  phone: string
  email: string
}): Promise<void> {
  const admin = createAdminClient()
  if (!admin) {
    throw new Error("Server configuration error")
  }

  const email = input.email.trim().toLowerCase()

  const { data: emailMatch } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (emailMatch) {
    throw new OtpVerificationError(
      "An account with this email already exists. Try signing in instead.",
      "email_mismatch"
    )
  }

  const { data: phoneMatch } = await admin
    .from("users")
    .select("id")
    .eq("phone", input.phone)
    .maybeSingle()

  if (phoneMatch) {
    throw new OtpVerificationError(
      "This phone number is already linked to an account.",
      "phone_mismatch"
    )
  }
}
