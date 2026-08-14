import { isUserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/User";

export const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";
export const ACCOUNT_UNAVAILABLE_MESSAGE =
  "Your account is not available. Contact support if you need help.";

export interface AuthorizedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string | null;
}

/**
 * Validates email/password credentials against the User model.
 * Returns null for invalid credentials (generic failure — no enumeration).
 * Throws for inactive/suspended accounts so Auth.js can surface a safe message.
 */
export async function authorizeCredentials(
  email: string | undefined,
  password: string | undefined,
  expectedRole?: string,
): Promise<AuthorizedUser | null> {
  if (!email || !password) {
    return null;
  }

  await connectToDatabase();

  const user = await User.verifyCredentials(email, password);
  if (!user) {
    return null;
  }

  if (user.status !== UserStatus.ACTIVE) {
    throw new Error(ACCOUNT_UNAVAILABLE_MESSAGE);
  }

  if (expectedRole && isUserRole(expectedRole) && user.role !== expectedRole) {
    // Generic failure — do not reveal that the account exists with a different role
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar ?? null,
  };
}
