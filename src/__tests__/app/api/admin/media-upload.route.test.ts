import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/constants/roles";

const { requireRoleMock, AuthError } = vi.hoisted(() => {
  class AuthError extends Error {
    statusCode: number;
    code: string;
    constructor(message: string, statusCode = 401, code = "UNAUTHORIZED") {
      super(message);
      this.name = "AuthError";
      this.statusCode = statusCode;
      this.code = code;
    }
  }

  return {
    requireRoleMock: vi.fn(),
    AuthError,
  };
});

vi.mock("@/lib/auth/guards", () => ({
  AuthError,
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
}));

vi.mock("@/lib/cloudinary/config", () => ({
  isCloudinaryConfigured: vi.fn(() => true),
}));

const uploadProjectMediaBatchMock = vi.fn();

vi.mock("@/services/media-upload.service", () => ({
  uploadProjectMediaBatch: (...args: unknown[]) => uploadProjectMediaBatchMock(...args),
}));

import { isCloudinaryConfigured } from "@/lib/cloudinary/config";
import { GET, POST } from "@/app/api/admin/projects/media/upload/route";

function createJpegFile(name = "cover.jpg"): File {
  const buffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  return new File([buffer], name, { type: "image/jpeg" });
}

describe("admin project media upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isCloudinaryConfigured).mockReturnValue(true);
  });

  it("allows admin upload requests", async () => {
    requireRoleMock.mockResolvedValue({ id: "admin-1", role: UserRole.ADMIN });
    uploadProjectMediaBatchMock.mockResolvedValue([
      {
        secureUrl: "https://res.cloudinary.com/demo/image/upload/cover.jpg",
        publicId: "fundit/projects/demo/cover/cover",
        resourceType: "image",
        width: 1000,
        height: 700,
      },
    ]);

    const formData = new FormData();
    formData.append("files", createJpegFile());
    formData.append("mediaType", "cover");
    formData.append("projectId", "507f1f77bcf86cd799439011");

    const response = await POST(
      new Request("http://localhost/api/admin/projects/media/upload", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.uploads[0].secureUrl).toContain("res.cloudinary.com");
    expect(requireRoleMock).toHaveBeenCalledWith(UserRole.ADMIN);
  });

  it("rejects anonymous upload requests", async () => {
    requireRoleMock.mockRejectedValue(
      new AuthError("Authentication required", 401, "UNAUTHORIZED"),
    );

    const formData = new FormData();
    formData.append("files", createJpegFile());
    formData.append("mediaType", "cover");
    formData.append("projectId", "507f1f77bcf86cd799439011");

    const response = await POST(
      new Request("http://localhost/api/admin/projects/media/upload", {
        method: "POST",
        body: formData,
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(uploadProjectMediaBatchMock).not.toHaveBeenCalled();
  });

  it("rejects investor upload requests", async () => {
    requireRoleMock.mockRejectedValue(
      new AuthError("Insufficient permissions", 403, "FORBIDDEN"),
    );

    const response = await GET();
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.success).toBe(false);
  });

  it("returns graceful response when Cloudinary is not configured", async () => {
    requireRoleMock.mockResolvedValue({ id: "admin-1", role: UserRole.ADMIN });
    vi.mocked(isCloudinaryConfigured).mockReturnValue(false);

    const response = await POST(
      new Request("http://localhost/api/admin/projects/media/upload", {
        method: "POST",
        body: new FormData(),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error.code).toBe("CLOUDINARY_NOT_CONFIGURED");
  });
});
