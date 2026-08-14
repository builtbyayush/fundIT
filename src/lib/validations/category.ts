import { z } from "zod";

import { isValidSlug } from "@/lib/utils/slug";

export const categoryInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or fewer"),
  slug: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || isValidSlug(value), {
      message: "Slug must be lowercase letters, numbers, and hyphens",
    }),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  icon: z.string().trim().max(50).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  displayOrder: z.coerce.number().int().min(0).optional(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
