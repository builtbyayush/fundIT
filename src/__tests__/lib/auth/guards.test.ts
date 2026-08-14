import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import type { SessionUser } from "@/types";

const authMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

import {
  AuthError,
  requireAuth,
  requireActiveUser,
  requireRole,
} from "@/lib/auth/guards";

const admin: SessionUser = {
  id: "admin-1",
  name: "Admin",
  email: "admin@funded.local",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
};

const investor: SessionUser = {
  id: "investor-1",
  name: "Investor",
  email: "investor@funded.local",
  role: UserRole.INVESTOR,
  status: UserStatus.ACTIVE,
};

const suspended: SessionUser = {
  ...investor,
  status: UserStatus.SUSPENDED,
};

describe("auth guards", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("rejects unauthenticated users", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toBeInstanceOf(AuthError);
  });

  it("allows authenticated users via requireAuth", async () => {
    authMock.mockResolvedValue({ user: investor });
    await expect(requireAuth()).resolves.toMatchObject({ id: investor.id });
  });

  it("rejects suspended users via requireActiveUser", async () => {
    authMock.mockResolvedValue({ user: suspended });
    await expect(requireActiveUser()).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("blocks investors from admin resources", async () => {
    authMock.mockResolvedValue({ user: investor });
    await expect(requireRole(UserRole.ADMIN)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows admins to access admin resources", async () => {
    authMock.mockResolvedValue({ user: admin });
    await expect(requireRole(UserRole.ADMIN)).resolves.toMatchObject({
      role: UserRole.ADMIN,
    });
  });

  it("allows investors to access investor resources", async () => {
    authMock.mockResolvedValue({ user: investor });
    await expect(requireRole(UserRole.INVESTOR)).resolves.toMatchObject({
      role: UserRole.INVESTOR,
    });
  });
});
