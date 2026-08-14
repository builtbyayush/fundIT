import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/media/constants";
import {
  detectImageMimeType,
  validateImageUpload,
} from "@/lib/media/upload-validation";

function createFile(name: string, type: string, buffer: Buffer): File {
  const bytes = Uint8Array.from(buffer);
  const blob = new Blob([bytes], { type });
  return new File([blob], name, { type });
}

describe("image upload validation", () => {
  it("accepts valid JPEG uploads", () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const file = createFile("cover.jpg", "image/jpeg", buffer);
    const validated = validateImageUpload(file, buffer);
    expect(validated.mimeType).toBe("image/jpeg");
  });

  it("rejects unsupported mime types", () => {
    const buffer = Buffer.from("<svg></svg>");
    const file = createFile("image.svg", "image/svg+xml", buffer);
    expect(() => validateImageUpload(file, buffer)).toThrow(ApiError);
  });

  it("rejects files larger than 10 MB", () => {
    const buffer = Buffer.alloc(MAX_IMAGE_UPLOAD_BYTES + 1, 0xff);
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
    buffer[2] = 0xff;
    const file = createFile("large.jpg", "image/jpeg", buffer);
    Object.defineProperty(file, "size", { value: MAX_IMAGE_UPLOAD_BYTES + 1 });
    expect(() => validateImageUpload(file, buffer)).toThrow(/10 MB/i);
  });

  it("detects png signatures", () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(detectImageMimeType(buffer)).toBe("image/png");
  });
});
