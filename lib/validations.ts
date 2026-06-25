import { z } from "zod";
import { NOTIFICATION_RADII } from "@/types";

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const registerSchema = z.object({
  phone_number: z
    .string()
    .regex(phoneRegex, "Phone must be in international format: +1234567890"),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional().default(""),
  country: z.string().min(1, "Country is required").max(100),
  notification_radius: z
    .number()
    .refine((v) => (NOTIFICATION_RADII as readonly number[]).includes(v), {
      message: "Invalid notification radius",
    }),
});

export const verifyOtpSchema = z.object({
  phone_number: z
    .string()
    .regex(phoneRegex, "Invalid phone number"),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/),
});

export const updateUserSchema = z.object({
  city: z.string().min(1).max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().min(1).max(100).optional(),
  notification_radius: z
    .number()
    .refine((v) => (NOTIFICATION_RADII as readonly number[]).includes(v))
    .optional(),
  is_paused: z.boolean().optional(),
});

export const loginSchema = z.object({
  phone_number: z
    .string()
    .regex(phoneRegex, "Phone must be in international format: +1234567890"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
