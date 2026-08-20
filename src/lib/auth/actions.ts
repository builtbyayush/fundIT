"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { UserRole } from "@/constants/roles";
import { connectToDatabase } from "@/lib/db";
import {
  ACCOUNT_UNAVAILABLE_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
} from "@/lib/auth/credentials";
import { safeAuthCallbackUrl } from "@/lib/auth/callback-url";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
import { User } from "@/models/User";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

function isDuplicateEmailError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." };
  }

  const callbackUrl = safeAuthCallbackUrl(formData.get("callbackUrl"));
  const expectedRole = String(formData.get("expectedRole") || "");
  const redirectTo =
    callbackUrl ||
    (expectedRole === UserRole.ADMIN ? "/admin" : "/investor");

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      expectedRole: expectedRole || undefined,
      redirectTo,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: INVALID_CREDENTIALS_MESSAGE };
      }
      const causeMessage =
        error.cause &&
        typeof error.cause === "object" &&
        "err" in error.cause &&
        error.cause.err instanceof Error
          ? error.cause.err.message
          : undefined;

      if (causeMessage === ACCOUNT_UNAVAILABLE_MESSAGE) {
        return { error: ACCOUNT_UNAVAILABLE_MESSAGE };
      }

      return { error: INVALID_CREDENTIALS_MESSAGE };
    }

    // Next.js redirect() throws a special error — rethrow it
    throw error;
  }
}

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return { error: firstIssue?.message ?? "Invalid form data." };
  }

  try {
    await connectToDatabase();
    await User.createInvestor({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
    });
  } catch (error) {
    if (isDuplicateEmailError(error)) {
      return { error: "Unable to create account. Please try a different email." };
    }
    console.error("[signupAction] Failed to create investor");
    return { error: "Unable to create account. Please try again." };
  }

  const redirectTo = safeAuthCallbackUrl(formData.get("callbackUrl")) ?? "/investor";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      expectedRole: UserRole.INVESTOR,
      redirectTo,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created, but sign-in failed. Please log in.",
      };
    }
    throw error;
  }
}
