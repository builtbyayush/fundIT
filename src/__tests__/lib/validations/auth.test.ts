import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/lib/validations/auth";

describe("auth validations", () => {
  it("accepts valid login input", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "Secret123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid login email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "Secret123",
    });
    expect(result.success).toBe(false);
  });

  it("enforces password complexity on signup", () => {
    const weak = signupSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "password",
      confirmPassword: "password",
    });
    expect(weak.success).toBe(false);

    const strong = signupSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });
    expect(strong.success).toBe(true);
  });

  it("requires matching confirm password", () => {
    const result = signupSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "Password1",
      confirmPassword: "Password2",
    });
    expect(result.success).toBe(false);
  });
});
