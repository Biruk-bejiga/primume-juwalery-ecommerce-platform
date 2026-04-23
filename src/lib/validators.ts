import { z } from "zod";

const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().min(1),
  alt: z.string().optional(),
  thumbnail: z.string().optional()
});

const variantOptionsSchema = z.object({
  sizes: z.array(z.string().min(1)).default([]),
  metalColors: z.array(z.string().min(1)).default([]),
  customization: z.array(z.string().min(1)).default([])
});

const customizationOptionsSchema = z.object({
  allowEngraving: z.boolean(),
  allowSizeAdjustment: z.boolean(),
  notes: z.string().nullable().optional()
});

export const productPayloadSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers and dashes."),
  sku: z.string().min(3),
  description: z.string().min(20),
  collection: z.string().min(2),
  metal: z.string().min(2),
  gemstone: z.string().nullable().optional(),
  gender: z.string().nullable().optional(),
  occasion: z.string().nullable().optional(),
  caratWeight: z.number().positive().max(50).nullable().optional(),
  price: z.number().int().min(1000),
  makingCharge: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(80),
  stock: z.number().int().min(0),
  featured: z.boolean(),
  active: z.boolean(),
  media: z.array(mediaSchema).min(1),
  variantOptions: variantOptionsSchema.optional(),
  customizationOptions: customizationOptionsSchema.optional()
});

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10),
  selectedSize: z.string().optional(),
  engravingText: z.string().max(40).optional()
});

export const orderPayloadSchema = z.object({
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  shippingAddress: z.object({
    line1: z.string().min(4),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4),
    country: z.string().min(2)
  }),
  items: z.array(orderItemSchema).min(1),
  couponCode: z.string().optional(),
  paymentProvider: z.enum(["RAZORPAY", "STRIPE", "PAYPAL"]).optional(),
  paymentPlan: z.enum(["FULL", "EMI", "PARTIAL"]).optional(),
  partialAmount: z.number().int().positive().optional()
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;

export const registerPayloadSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional()
});

export const loginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const addressPayloadSchema = z.object({
  label: z.string().min(2),
  line1: z.string().min(4),
  line2: z.string().nullable().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4),
  country: z.string().min(2),
  isDefault: z.boolean().optional()
});

export const trackOrderQuerySchema = z.object({
  orderNumber: z.string().min(3),
  email: z.string().email()
});

export const customOrderPayloadSchema = z.object({
  productId: z.number().int().positive().nullable().optional(),
  customerName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  designType: z.string().min(2),
  metalType: z.string().min(2),
  stoneType: z.string().min(2),
  ringSize: z.string().optional(),
  engravingText: z.string().max(40).optional(),
  budget: z.number().int().min(1000),
  notes: z.string().max(500).optional()
});

export const couponValidationSchema = z.object({
  code: z.string().min(2),
  subtotal: z.number().int().min(0)
});

export const paymentInitSchema = z.object({
  orderId: z.number().int().positive(),
  provider: z.enum(["RAZORPAY", "STRIPE", "PAYPAL"]),
  plan: z.enum(["FULL", "EMI", "PARTIAL"]),
  partialAmount: z.number().int().positive().optional()
});

export const paymentConfirmSchema = z.object({
  paymentTransactionId: z.number().int().positive(),
  gatewayPaymentId: z.string().optional(),
  status: z.enum(["PAID", "PARTIALLY_PAID", "FAILED"]),
  signature: z.string().optional(),
  payload: z.unknown().optional()
});

export const couponPayloadSchema = z.object({
  code: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PERCENT", "FLAT"]),
  value: z.number().int().positive(),
  minOrder: z.number().int().min(0).optional(),
  maxDiscount: z.number().int().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional()
});

export const campaignPayloadSchema = z.object({
  name: z.string().min(2),
  channel: z.string().min(2),
  budget: z.number().int().min(0),
  spent: z.number().int().min(0).optional(),
  impressions: z.number().int().min(0).optional(),
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  meta: z.unknown().optional()
});
