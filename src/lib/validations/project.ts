import { z } from "zod";

import { ProjectStatus, PROJECT_STATUSES } from "@/constants/project-status";
import { MAX_PROJECT_CATEGORIES } from "@/models/Project";
import { isValidSlug } from "@/lib/utils/slug";
import {
  httpHttpsUrlListSchema,
  optionalHttpHttpsUrlSchema,
} from "@/lib/validations/http-url";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .or(z.literal(""))
  .optional()
  .transform((value) => (value ? value : undefined));

export const projectLocationSchema = z
  .object({
    city: z.string().trim().max(100).optional().or(z.literal("")),
    state: z.string().trim().max(100).optional().or(z.literal("")),
    country: z.string().trim().max(100).optional().or(z.literal("")),
  })
  .optional()
  .nullable()
  .transform((value) => {
    if (!value) return null;
    const city = value.city?.trim() || undefined;
    const state = value.state?.trim() || undefined;
    const country = value.country?.trim() || undefined;
    if (!city && !state && !country) return null;
    return { city, state, country };
  });

export const projectInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be 120 characters or fewer"),
    slug: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || isValidSlug(value), {
        message: "Slug must be lowercase letters, numbers, and hyphens",
      }),
    shortDescription: z
      .string()
      .trim()
      .min(10, "Short description must be at least 10 characters")
      .max(280, "Short description must be 280 characters or fewer"),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters")
      .max(20000, "Description must be 20000 characters or fewer"),
    categoryIds: z
      .array(z.string().min(1))
      .min(1, "Select at least one category")
      .max(MAX_PROJECT_CATEGORIES, `Select at most ${MAX_PROJECT_CATEGORIES} categories`),
    primaryCategoryId: z.string().min(1, "Primary category is required"),
    thumbnail: optionalHttpHttpsUrlSchema,
    coverImage: optionalHttpHttpsUrlSchema,
    gallery: httpHttpsUrlListSchema.default([]),
    video: optionalHttpHttpsUrlSchema,
    website: optionalHttpHttpsUrlSchema,
    tags: z
      .array(z.string().trim().min(1).max(40))
      .max(20, "A project can have at most 20 tags")
      .default([]),
    highlights: z
      .array(z.string().trim().min(1).max(120))
      .max(12, "A project can have at most 12 highlights")
      .default([]),
    location: projectLocationSchema,
  })
  .superRefine((data, ctx) => {
    const uniqueIds = Array.from(new Set(data.categoryIds));
    if (uniqueIds.length !== data.categoryIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Duplicate categories are not allowed",
        path: ["categoryIds"],
      });
    }
    if (!data.categoryIds.includes(data.primaryCategoryId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Primary category must be one of the selected categories",
        path: ["primaryCategoryId"],
      });
    }
  });

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const projectStatusSchema = z.enum(
  PROJECT_STATUSES as [ProjectStatus, ...ProjectStatus[]],
);

export const adminProjectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional().default(""),
  category: z.string().trim().optional().default(""),
  status: z
    .union([projectStatusSchema, z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type AdminProjectListQuery = z.infer<typeof adminProjectListQuerySchema>;

export const publicProjectListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().optional().or(z.literal("")),
  sort: z.enum(["newest", "updated"]).default("newest"),
});

export type PublicProjectListQuery = z.infer<typeof publicProjectListQuerySchema>;

export { optionalUrl };
