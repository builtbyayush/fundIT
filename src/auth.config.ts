import type { NextAuthConfig } from "next-auth";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { isUserRole } from "@/constants/roles";
import { isUserStatus } from "@/constants/user-status";

/**
 * Edge-safe Auth.js configuration shared with middleware.
 * Provider authorize callbacks that need MongoDB live in src/auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;
      const status = auth?.user?.status;

      const isAdminLogin = pathname === "/admin/login";
      const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
      const isInvestorRoute = pathname.startsWith("/investor");

      if (isAdminRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/admin/login", request.nextUrl);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(loginUrl);
        }
        if (status !== UserStatus.ACTIVE || role !== UserRole.ADMIN) {
          return Response.redirect(new URL("/unauthorized", request.nextUrl));
        }
        return true;
      }

      if (isInvestorRoute) {
        if (!isLoggedIn) {
          const loginUrl = new URL("/login", request.nextUrl);
          loginUrl.searchParams.set("callbackUrl", pathname);
          return Response.redirect(loginUrl);
        }
        if (status !== UserStatus.ACTIVE || role !== UserRole.INVESTOR) {
          return Response.redirect(new URL("/unauthorized", request.nextUrl));
        }
        return true;
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = (user.id ?? token.sub ?? "") as string;
        if (isUserRole(user.role)) {
          token.role = user.role;
        }
        if (isUserStatus(user.status)) {
          token.status = user.status;
        }
        token.avatar = (user.avatar as string | null | undefined) ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id ?? token.sub ?? "");
        if (isUserRole(token.role)) {
          session.user.role = token.role;
        }
        if (isUserStatus(token.status)) {
          session.user.status = token.status;
        }
        session.user.avatar =
          typeof token.avatar === "string" || token.avatar === null
            ? token.avatar
            : null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
