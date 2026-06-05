import { z } from "zod"

import { normalizeGhanaPhone } from "@/lib/sms/phone"

const ghanaPhone = z
  .string()
  .min(9, "Enter a valid Ghana phone number")
  .refine((value) => normalizeGhanaPhone(value) !== null, {
    message: "Use format 0XX XXX XXXX or 233XXXXXXXXX",
  })

const passwordField = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number")

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSendOtpSchema = z.object({
  phone: ghanaPhone,
  email: z.string().email("Enter a valid email address"),
})

const otpCodeField = z
  .string()
  .length(6, "Enter the 6-digit code")
  .regex(/^\d{6}$/, "Enter the 6-digit code")

export const registerDetailsSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Enter a valid email address"),
    phone: ghanaPhone,
    password: passwordField,
    confirmPassword: z.string(),
    marketingOptIn: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const registerSchema = registerDetailsSchema
  .extend({
    verificationId: z.string().uuid("Verification expired — request a new code"),
    otp: otpCodeField,
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100),
  phone: ghanaPhone,
  marketingOptIn: z.boolean(),
})

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterSendOtpInput = z.infer<typeof registerSendOtpSchema>
export type RegisterDetailsInput = z.infer<typeof registerDetailsSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
