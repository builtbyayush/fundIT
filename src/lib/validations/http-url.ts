import { z } from "zod";

const HTTP_HTTPS_URL_MESSAGE = "Enter a valid HTTP or HTTPS URL";

export function isHttpOrHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const httpHttpsUrlSchema = z
  .string()
  .trim()
  .refine(isHttpOrHttpsUrl, { message: HTTP_HTTPS_URL_MESSAGE });

export const optionalHttpHttpsUrlSchema = z
  .union([httpHttpsUrlSchema, z.literal(""), z.undefined(), z.null()])
  .transform((value) => {
    if (!value) return null;
    return value;
  });

export const httpHttpsUrlListSchema = z
  .array(
    z
      .string()
      .trim()
      .refine(isHttpOrHttpsUrl, { message: HTTP_HTTPS_URL_MESSAGE }),
  )
  .max(12, "Gallery can contain at most 12 images");

export { HTTP_HTTPS_URL_MESSAGE };
