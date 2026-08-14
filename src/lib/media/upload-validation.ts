import { ApiError } from "@/lib/api/errors";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_UPLOAD_BYTES,
  type AllowedImageMimeType,
} from "@/lib/media/constants";

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const WEBP_MARKER = [0x57, 0x45, 0x42, 0x50];

function matchesSignature(buffer: Buffer, signature: number[], offset = 0): boolean {
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

function isAvifBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const brand = buffer.subarray(8, 12).toString("ascii");
  return brand === "avif" || brand === "avis" || brand.startsWith("mif");
}

export function detectImageMimeType(buffer: Buffer): AllowedImageMimeType | null {
  if (buffer.length < 4) return null;

  if (matchesSignature(buffer, JPEG_SIGNATURE)) {
    return "image/jpeg";
  }

  if (matchesSignature(buffer, PNG_SIGNATURE)) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    matchesSignature(buffer, WEBP_RIFF) &&
    matchesSignature(buffer, WEBP_MARKER, 8)
  ) {
    return "image/webp";
  }

  if (buffer.length >= 12 && isAvifBuffer(buffer)) {
    return "image/avif";
  }

  return null;
}

export interface ValidatedImageUpload {
  buffer: Buffer;
  mimeType: AllowedImageMimeType;
  size: number;
  originalName: string;
}

export function validateImageUpload(file: File, buffer: Buffer): ValidatedImageUpload {
  if (!file || !(file instanceof File)) {
    throw new ApiError(400, "A valid image file is required.", "INVALID_FILE");
  }

  if (file.size < 1 || buffer.length < 1) {
    throw new ApiError(400, "Uploaded file is empty.", "INVALID_FILE");
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES || buffer.length > MAX_IMAGE_UPLOAD_BYTES) {
    throw new ApiError(
      400,
      "Image exceeds the 10 MB upload limit.",
      "FILE_TOO_LARGE",
    );
  }

  const declaredType = file.type.trim().toLowerCase();
  if (
    declaredType &&
    !ALLOWED_IMAGE_MIME_TYPES.includes(declaredType as AllowedImageMimeType)
  ) {
    throw new ApiError(400, "Unsupported image type.", "UNSUPPORTED_MEDIA");
  }

  const detectedType = detectImageMimeType(buffer);
  if (!detectedType) {
    throw new ApiError(
      400,
      "Unsupported image type. Allowed formats: JPEG, PNG, WebP, AVIF.",
      "UNSUPPORTED_MEDIA",
    );
  }

  if (
    declaredType &&
    declaredType !== detectedType &&
    !(declaredType === "image/jpg" && detectedType === "image/jpeg")
  ) {
    throw new ApiError(400, "File content does not match the declared type.", "INVALID_FILE");
  }

  return {
    buffer,
    mimeType: detectedType,
    size: buffer.length,
    originalName: file.name || "upload",
  };
}
