import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";

const connectMock = vi.fn();
const verifyCredentialsMock = vi.fn();

vi.mock("@/lib/db", () => ({
  connectToDatabase: () => connectMock(),
}));

vi.mock("@/models/User", () => ({
  User: {
    verifyCredentials: (...args: unknown[]) => verifyCredentialsMock(...args),
  },
}));

import {
  ACCOUNT_UNAVAILABLE_MESSAGE,
  authorizeCredentials,
} from "@/lib/auth/credentials";

describe("authorizeCredentials", () => {
  beforeEach(() => {
    connectMock.mockReset();
    verifyCredentialsMock.mockReset();
    connectMock.mockResolvedValue(undefined);
  });

  it("returns null when email or password is missing", async () => {
    await expect(authorizeCredentials(undefined, "pass")).resolves.toBeNull();
    await expect(authorizeCredentials("a@b.com", undefined)).resolves.toBeNull();
  });

  it("returns null for invalid credentials", async () => {
    verifyCredentialsMock.mockResolvedValue(null);
    await expect(
      authorizeCredentials("user@example.com", "wrong"),
    ).resolves.toBeNull();
  });

  it("returns an authorized user for valid active credentials", async () => {
    verifyCredentialsMock.mockResolvedValue({
      _id: { toString: () => "user-1" },
      name: "Ada",
      email: "ada@example.com",
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
      avatar: null,
    });

    await expect(
      authorizeCredentials("ada@example.com", "Password1"),
    ).resolves.toMatchObject({
      id: "user-1",
      email: "ada@example.com",
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
    });
  });

  it("rejects suspended users with a safe message", async () => {
    verifyCredentialsMock.mockResolvedValue({
      _id: { toString: () => "user-2" },
      name: "Suspended",
      email: "suspended@example.com",
      role: UserRole.INVESTOR,
      status: UserStatus.SUSPENDED,
      avatar: null,
    });

    await expect(
      authorizeCredentials("suspended@example.com", "Password1"),
    ).rejects.toThrow(ACCOUNT_UNAVAILABLE_MESSAGE);
  });

  it("rejects inactive users", async () => {
    verifyCredentialsMock.mockResolvedValue({
      _id: { toString: () => "user-3" },
      name: "Inactive",
      email: "inactive@example.com",
      role: UserRole.ADMIN,
      status: UserStatus.INACTIVE,
      avatar: null,
    });

    await expect(
      authorizeCredentials("inactive@example.com", "Password1"),
    ).rejects.toThrow(ACCOUNT_UNAVAILABLE_MESSAGE);
  });

  it("rejects role mismatches without revealing account details", async () => {
    verifyCredentialsMock.mockResolvedValue({
      _id: { toString: () => "user-4" },
      name: "Investor",
      email: "investor@example.com",
      role: UserRole.INVESTOR,
      status: UserStatus.ACTIVE,
      avatar: null,
    });

    await expect(
      authorizeCredentials("investor@example.com", "Password1", UserRole.ADMIN),
    ).resolves.toBeNull();
  });
});
