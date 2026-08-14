import { getCurrentUser, requireAuth, requireActiveUser, requireRole } from "./guards";

export { getCurrentUser, requireAuth, requireActiveUser, requireRole };
export { AuthError } from "./guards";
export {
  hasRole,
  hasAnyRole,
  isActiveUser,
  canAccessProtectedResource,
} from "./permissions";
export {
  hashPassword,
  verifyPassword,
  normalizeEmail,
} from "./password";
export {
  authorizeCredentials,
  INVALID_CREDENTIALS_MESSAGE,
  ACCOUNT_UNAVAILABLE_MESSAGE,
} from "./credentials";
