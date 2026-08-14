import type { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import type { SessionUser } from "@/types";

export function hasRole(
  user: Pick<SessionUser, "role"> | null | undefined,
  role: UserRole,
): boolean {
  return Boolean(user && user.role === role);
}

export function hasAnyRole(
  user: Pick<SessionUser, "role"> | null | undefined,
  roles: readonly UserRole[],
): boolean {
  return Boolean(user && roles.includes(user.role));
}

export function isActiveUser(
  user: Pick<SessionUser, "status"> | null | undefined,
): boolean {
  return Boolean(user && user.status === UserStatus.ACTIVE);
}

export function canAccessProtectedResource(
  user: Pick<SessionUser, "role" | "status"> | null | undefined,
  role: UserRole,
): boolean {
  return isActiveUser(user) && hasRole(user, role);
}
