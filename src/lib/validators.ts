import { z } from "zod";

const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: z.string().min(1),
  alt: z.string().optional(),
  thumbnail: z.string().optional()
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
  caratWeight: z.number().positive().max(50).nullable().optional(),
  price: z.number().int().min(1000),
  makingCharge: z.number().int().min(0),
  discountPercent: z.number().int().min(0).max(80),
  stock: z.number().int().min(0),
  featured: z.boolean(),
  active: z.boolean(),
  media: z.array(mediaSchema).min(1)
});

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(10)
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
  items: z.array(orderItemSchema).min(1)
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;
export type OrderPayload = z.infer<typeof orderPayloadSchema>;
