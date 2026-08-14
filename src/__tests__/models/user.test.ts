import { describe, expect, it } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { normalizeEmail } from "@/lib/auth/password";
import { User } from "@/models/User";

describe("User model", () => {
  it("normalizes email casing and whitespace", () => {
    expect(normalizeEmail("  Admin@Funded.Local ")).toBe("admin@funded.local");
  });

  it("accepts a valid user document", async () => {
    const user = new User({
      name: "Ada Investor",
      email: "Ada@Example.com",
      passwordHash: "hashed-password",
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
    });

    await expect(user.validate()).resolves.toBeUndefined();
    expect(user.email).toBe("ada@example.com");
  });

  it("rejects invalid role values", async () => {
    const user = new User({
      name: "Bad Role",
      email: "bad-role@example.com",
      passwordHash: "hashed-password",
      role: "SUPER_ADMIN",
      status: UserStatus.ACTIVE,
    });

    await expect(user.validate()).rejects.toThrow(/Invalid role|role/i);
  });

  it("rejects invalid status values", async () => {
    const user = new User({
      name: "Bad Status",
      email: "bad-status@example.com",
      passwordHash: "hashed-password",
      role: UserRole.INVESTOR,
      status: "BANNED",
    });

    await expect(user.validate()).rejects.toThrow(/Invalid status|status/i);
  });

  it("requires name, email, and passwordHash", async () => {
    const user = new User({});
    await expect(user.validate()).rejects.toThrow();
  });

  it("defines a unique email index constraint", () => {
    const emailPath = User.schema.path("email");
    expect(emailPath?.options?.unique).toBe(true);
  });
});
