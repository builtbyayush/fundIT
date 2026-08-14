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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  AuthError,
  requireRole: (...args: unknown[]) => requireRoleMock(...args),
  requireAuth: vi.fn(),
  requireActiveUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

const connectMock = vi.fn();
const createProjectMock = vi.fn();
const publishProjectMock = vi.fn();

vi.mock("@/lib/db", () => ({
  connectToDatabase: () => connectMock(),
}));

vi.mock("@/services/project.service", () => ({
  createProject: (...args: unknown[]) => createProjectMock(...args),
  publishProject: (...args: unknown[]) => publishProjectMock(...args),
  unpublishProject: vi.fn(),
  archiveProject: vi.fn(),
  updateProject: vi.fn(),
  serializeAdminProject: vi.fn(),
  getProjectById: vi.fn(),
}));

import {
  createProjectAction,
  publishProjectAction,
} from "@/lib/actions/project";

describe("project actions authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    connectMock.mockResolvedValue(undefined);
  });

  it("rejects unauthenticated project creation", async () => {
    requireRoleMock.mockRejectedValue(
      new AuthError("Authentication required", 401, "UNAUTHORIZED"),
    );

    const formData = new FormData();
    formData.set("title", "Sample Opportunity");
    formData.set("shortDescription", "Short description for sample project.");
    formData.set(
      "description",
      "A longer description for the sample project under authorization tests.",
    );
    formData.append("categoryIds", "507f1f77bcf86cd799439011");
    formData.set("primaryCategoryId", "507f1f77bcf86cd799439011");

    const result = await createProjectAction({}, formData);
    expect(result.error).toBe("Authentication required");
    expect(createProjectMock).not.toHaveBeenCalled();
  });

  it("rejects investor project publication", async () => {
    requireRoleMock.mockRejectedValue(
      new AuthError("Insufficient permissions", 403, "FORBIDDEN"),
    );

    const result = await publishProjectAction("507f1f77bcf86cd799439011");
    expect(result.error).toBe("Insufficient permissions");
    expect(publishProjectMock).not.toHaveBeenCalled();
  });

  it("allows admin project creation", async () => {
    requireRoleMock.mockResolvedValue({
      id: "admin-1",
      role: UserRole.ADMIN,
    });
    createProjectMock.mockResolvedValue({
      _id: { toString: () => "507f1f77bcf86cd799439012" },
    });

    const formData = new FormData();
    formData.set("title", "Sample Opportunity");
    formData.set("shortDescription", "Short description for sample project.");
    formData.set(
      "description",
      "A longer description for the sample project under authorization tests.",
    );
    formData.append("categoryIds", "507f1f77bcf86cd799439011");
    formData.set("primaryCategoryId", "507f1f77bcf86cd799439011");

    const result = await createProjectAction({}, formData);
    expect(requireRoleMock).toHaveBeenCalledWith(UserRole.ADMIN);
    expect(createProjectMock).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.projectId).toBe("507f1f77bcf86cd799439012");
  });
});
