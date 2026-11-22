import { z } from "zod";

/*
 * Shared validation schemas. The client uses these for immediate feedback; the
 * server ALWAYS re-validates with the same schemas (strict objects reject
 * unexpected keys, which prevents mass assignment).
 */

const trimmed = (max: number) => z.string().trim().max(max);

/** True only for a real YYYY-MM-DD calendar date (rejects 2026-02-31, 2026-13-01…). */
export function isCalendarDate(v: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/** Today's date (YYYY-MM-DD) in the workshop's time zone. */
export function todayInWorkshop(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .email("Enter a valid email address, like name@example.com.")
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(128, "Use 128 characters or fewer.");

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, "Enter your password.").max(128),
  })
  .strict();

export const registerSchema = z
  .object({
    firstName: trimmed(60).min(1, "Enter your first name."),
    lastName: trimmed(60).min(1, "Enter your last name."),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().max(128),
  })
  .strict()
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: passwordSchema,
    confirmPassword: z.string().max(128),
  })
  .strict()
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password.").max(128),
    newPassword: passwordSchema,
    confirmPassword: z.string().max(128),
  })
  .strict()
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a password different from your current one.",
  });

const phoneRegex = /^[+()\-.\s0-9]{7,20}$/;

export const profileSchema = z
  .object({
    firstName: trimmed(60).min(1, "Enter your first name."),
    lastName: trimmed(60).min(1, "Enter your last name."),
    phone: trimmed(20)
      .refine((v) => v === "" || phoneRegex.test(v), "Enter a valid phone number, or leave this empty.")
      .optional()
      .default(""),
  })
  .strict();

export const slugSchema = z.string().regex(/^[a-z0-9-]{3,80}$/);

/** Product configuration. Only fields confirmed by the business may be added here. */
export const productConfigSchema = z
  .object({
    personalisation: z.literal("pending").optional(),
  })
  .strict();
export type ProductConfig = z.infer<typeof productConfigSchema>;

export const addToCartSchema = z
  .object({
    productId: slugSchema,
    quantity: z.number().int().min(1, "Choose at least 1.").max(10, "You can add up to 10 of an item."),
    config: productConfigSchema.default({}),
  })
  .strict();

export const updateCartItemSchema = z
  .object({ quantity: z.number().int().min(1).max(10) })
  .strict();

export const checkoutSchema = z
  .object({
    email: emailSchema,
    firstName: trimmed(60).min(1, "Enter your first name."),
    lastName: trimmed(60).min(1, "Enter your last name."),
    phone: trimmed(20)
      .refine((v) => v === "" || phoneRegex.test(v), "Enter a valid phone number, or leave this empty.")
      .optional()
      .default(""),
    idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,64}$/),
  })
  .strict();

export const CUSTOM_ORDER_MAX_FILES = 5;
export const CUSTOM_ORDER_MAX_FILE_BYTES = 8 * 1024 * 1024;
export const CUSTOM_ORDER_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const customOrderSchema = z
  .object({
    name: trimmed(120).min(1, "Enter your name."),
    email: emailSchema,
    itemType: trimmed(120).min(1, "Tell us what kind of item you'd like made."),
    measurements: trimmed(2000).min(1, "Add measurements or specifications, even if they are approximate."),
    notes: trimmed(4000).optional().default(""),
    budget: z
      .string()
      .trim()
      .max(12)
      .refine((v) => v === "" || /^\d{1,7}(\.\d{1,2})?$/.test(v), "Enter a budget in CAD, like 150 or 150.00.")
      .optional()
      .default(""),
    deadline: z
      .string()
      .trim()
      .max(10)
      .refine((v) => v === "" || isCalendarDate(v), "Enter a valid date.")
      .optional()
      .default(""),
  })
  .strict();

export type FieldErrors = Record<string, string>;

/** Flattens a ZodError into { field: firstMessage } for form display. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
