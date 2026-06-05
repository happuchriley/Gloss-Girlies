import { z } from "zod"

import { normalizeGhanaPhone } from "@/lib/sms/phone"

const ghanaPhone = z
  .string()
  .min(9, "Enter a valid Ghana phone number")
  .refine((value) => normalizeGhanaPhone(value) !== null, {
    message: "Use format 0XX XXX XXXX or 233XXXXXXXXX",
  })

export const fulfillmentTypeSchema = z.enum(["delivery", "pickup"])

export const checkoutItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  image: z.string().optional().default(""),
  quantity: z.number().int().positive(),
})

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  phone: ghanaPhone,
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().optional(),
})

export const guestCheckoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
})

const checkoutBaseSchema = z.object({
  items: z.array(checkoutItemSchema).min(1),
  fulfillmentType: fulfillmentTypeSchema.default("delivery"),
  shippingAddress: shippingAddressSchema,
  total: z.number().positive(),
  guest: guestCheckoutSchema.optional(),
})

function validateFulfillmentAddress(
  data: z.infer<typeof checkoutBaseSchema>,
  ctx: z.RefinementCtx
) {
  if (data.fulfillmentType === "delivery") {
    if (!data.shippingAddress.addressLine1?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Address is required for delivery",
        path: ["shippingAddress", "addressLine1"],
      })
    }
    if (!data.shippingAddress.city?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "City is required for delivery",
        path: ["shippingAddress", "city"],
      })
    }
    if (!data.shippingAddress.country?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Country is required for delivery",
        path: ["shippingAddress", "country"],
      })
    }
  }
}

export const paystackInitializeSchema = checkoutBaseSchema.superRefine(
  validateFulfillmentAddress
)

export type PaystackInitializePayload = z.infer<typeof paystackInitializeSchema>

export const createOrderSchema = checkoutBaseSchema
  .extend({
    paymentMethod: z.literal("cod"),
  })
  .superRefine(validateFulfillmentAddress)

export type CreateOrderPayload = z.infer<typeof createOrderSchema>
