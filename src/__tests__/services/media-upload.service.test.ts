import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const uploadStreamMock = vi.fn();
const cloudinaryClientMock = {
  uploader: {
    upload_stream: uploadStreamMock,
  },
};

vi.mock("@/lib/cloudinary/config", () => ({
  isCloudinaryConfigured: vi.fn(() => true),
  getCloudinaryEnvConfig: vi.fn(() => ({
    cloudName: "demo-cloud",
    apiKey: "demo-key",
    apiSecret: "demo-secret",
  })),
}));

vi.mock("@/lib/cloudinary/client", () => ({
  getCloudinaryClient: vi.fn(() => cloudinaryClientMock),
}));

import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import {
  mediaUploadInternals,
  uploadProjectMedia,
  uploadProjectMediaBatch,
} from "@/services/media-upload.service";

function createJpegFile(name = "cover.jpg"): File {
  const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  return new File([buffer], name, { type: "image/jpeg" });
}

describe("media upload service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isCloudinaryConfigured).mockReturnValue(true);

    uploadStreamMock.mockImplementation((_options, callback) => {
      const stream = {
        end: () => {
          callback(null, {
            secure_url: "https://res.cloudinary.com/demo-cloud/image/upload/v1/cover.jpg",
            public_id: "fundit/projects/demo/cover/cover",
            resource_type: "image",
            width: 1200,
            height: 800,
          });
        },
      };
      return stream;
    });
  });

  it("uploads a cover image and returns the secure URL", async () => {
    const result = await uploadProjectMedia({
      file: createJpegFile(),
      mediaType: "cover",
      projectId: "507f1f77bcf86cd799439011",
    });

    expect(result.secureUrl).toContain("res.cloudinary.com");
    expect(uploadStreamMock).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: "fundit/projects/507f1f77bcf86cd799439011/cover",
      }),
      expect.any(Function),
    );
  });

  it("rejects uploads when Cloudinary is not configured", async () => {
    vi.mocked(isCloudinaryConfigured).mockReturnValue(false);

    await expect(
      uploadProjectMedia({
        file: createJpegFile(),
        mediaType: "cover",
        projectId: "507f1f77bcf86cd799439011",
      }),
    ).rejects.toMatchObject({
      code: "CLOUDINARY_NOT_CONFIGURED",
    });
  });

  it("maps Cloudinary failures to a safe API error", async () => {
    uploadStreamMock.mockImplementation((_options, callback) => {
      const stream = {
        end: () => callback(new Error("Cloudinary unavailable"), undefined),
      };
      return stream;
    });

    await expect(
      uploadProjectMedia({
        file: createJpegFile(),
        mediaType: "cover",
        projectId: "507f1f77bcf86cd799439011",
      }),
    ).rejects.toMatchObject({
      code: "UPLOAD_FAILED",
    });
  });

  it("enforces gallery upload limits", async () => {
    await expect(
      uploadProjectMediaBatch([createJpegFile("one.jpg"), createJpegFile("two.jpg")], {
        mediaType: "gallery",
        projectId: "507f1f77bcf86cd799439011",
        currentGalleryCount: 11,
      }),
    ).rejects.toMatchObject({
      code: "GALLERY_LIMIT_EXCEEDED",
    });
  });

  it("throws when Cloudinary response is missing a secure URL", () => {
    expect(() =>
      mediaUploadInternals.mapUploadResult({
        public_id: "missing-url",
      } as never),
    ).toThrow(ApiError);
  });
});
