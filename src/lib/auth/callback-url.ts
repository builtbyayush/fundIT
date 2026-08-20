const INVEST_CALLBACK = /^\/projects\/[a-z0-9-]+\/invest$/;
const SAFE_RELATIVE_PATH = /^\/[a-zA-Z0-9/?#=&._-]*$/;

function normalizeCallbackPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path) return null;

  if (
    /^https?:\/\//i.test(path) ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("..") ||
    path.includes("://")
  ) {
    return null;
  }

  if (!SAFE_RELATIVE_PATH.test(path)) return null;
  return path;
}

/**
 * Same-origin relative paths we allow after sign-in. Blocks open redirects.
 */
export function safeAuthCallbackUrl(value: unknown): string | null {
  const path = normalizeCallbackPath(value);
  if (!path) return null;

  const pathname = path.split("?")[0] ?? path;
  if (INVEST_CALLBACK.test(pathname)) return pathname;
  if (pathname === "/investor" || pathname.startsWith("/investor/")) return path;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return path;
  return null;
}

export function safeInvestCallbackUrl(value: unknown): string | null {
  const path = normalizeCallbackPath(value);
  if (!path) return null;
  return INVEST_CALLBACK.test(path) ? path : null;
}
