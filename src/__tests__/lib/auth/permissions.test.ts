import { describe, expect, it } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import {
  canAccessProtectedResource,
  hasAnyRole,
  hasRole,
  isActiveUser,
} from "@/lib/auth/permissions";
import type { SessionUser } from "@/types";

const admin: SessionUser = {
  id: "1",
  name: "Admin",
  email: "admin@funded.local",
  role: UserRole.ADMIN,
  status: UserStatus.ACTIVE,
};

const investor: SessionUser = {
  id: "2",
  name: "Investor",
  email: "investor@funded.local",
  role: UserRole.INVESTOR,
  status: UserStatus.ACTIVE,
};

const suspendedInvestor: SessionUser = {
  ...investor,
  id: "3",
  status: UserStatus.SUSPENDED,
};

describe("permissions", () => {
  it("checks exact roles", () => {
    expect(hasRole(admin, UserRole.ADMIN)).toBe(true);
    expect(hasRole(admin, UserRole.INVESTOR)).toBe(false);
    expect(hasRole(null, UserRole.ADMIN)).toBe(false);
  });

  it("supports multi-role checks for future roles", () => {
    expect(hasAnyRole(investor, [UserRole.INVESTOR, UserRole.ADMIN])).toBe(true);
    expect(hasAnyRole(investor, [UserRole.ADMIN])).toBe(false);
  });

  it("requires ACTIVE status", () => {
    expect(isActiveUser(admin)).toBe(true);
    expect(isActiveUser(suspendedInvestor)).toBe(false);
    expect(isActiveUser(undefined)).toBe(false);
  });

  it("combines role and status for protected access", () => {
    expect(canAccessProtectedResource(admin, UserRole.ADMIN)).toBe(true);
    expect(canAccessProtectedResource(investor, UserRole.ADMIN)).toBe(false);
    expect(canAccessProtectedResource(suspendedInvestor, UserRole.INVESTOR)).toBe(
      false,
    );
  });
});
