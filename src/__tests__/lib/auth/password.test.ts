import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password helpers", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("Password1");
    expect(hash).not.toContain("Password1");
    await expect(verifyPassword("Password1", hash)).resolves.toBe(true);
    await expect(verifyPassword("WrongPass1", hash)).resolves.toBe(false);
  });
});
