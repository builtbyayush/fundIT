import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Edge-compatible middleware using the split auth config.
 * MongoDB-backed Credentials authorize lives in src/auth.ts (Node runtime).
 */
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin", "/admin/:path*", "/investor", "/investor/:path*"],
};
