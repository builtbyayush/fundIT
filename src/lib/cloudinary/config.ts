import { ApiError } from "@/lib/api/errors";

export interface CloudinaryEnvConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim(),
  );
}

export function getCloudinaryEnvConfig(): CloudinaryEnvConfig {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      "Cloudinary uploads are not configured. Use image URL instead.",
      "CLOUDINARY_NOT_CONFIGURED",
    );
  }

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!.trim(),
    apiKey: process.env.CLOUDINARY_API_KEY!.trim(),
    apiSecret: process.env.CLOUDINARY_API_SECRET!.trim(),
  };
}

export function getCloudinaryImageHostname(): string {
  return "res.cloudinary.com";
}
