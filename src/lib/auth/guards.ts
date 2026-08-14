import { auth } from "@/auth";
import type { UserRole } from "@/constants/roles";
import {
  canAccessProtectedResource,
  isActiveUser,
} from "@/lib/auth/permissions";
import type { SessionUser } from "@/types";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 401,
    public readonly code: string = "UNAUTHORIZED",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function toSessionUser(user: {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: UserRole;
  status?: SessionUser["status"];
  avatar?: string | null;
}): SessionUser | null {
  if (!user.id || !user.email || !user.role || !user.status) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? "",
    email: user.email,
    role: user.role,
    status: user.status,
    avatar: user.avatar ?? null,
  };
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) {
    return null;
  }
  return toSessionUser(session.user);
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Authentication required", 401, "UNAUTHORIZED");
  }
  return user;
}

export async function requireActiveUser(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!isActiveUser(user)) {
    throw new AuthError("Account is not active", 403, "FORBIDDEN");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireActiveUser();
  if (!canAccessProtectedResource(user, role)) {
    throw new AuthError("Insufficient permissions", 403, "FORBIDDEN");
  }
  return user;
}
