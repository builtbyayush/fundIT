import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/auth.config";
import {
  ACCOUNT_UNAVAILABLE_MESSAGE,
  authorizeCredentials,
} from "@/lib/auth/credentials";
import { isUserRole } from "@/constants/roles";
import { isUserStatus } from "@/constants/user-status";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const expectedRole =
          typeof credentials?.expectedRole === "string"
            ? credentials.expectedRole
            : undefined;

        try {
          const user = await authorizeCredentials(
            parsed.data.email,
            parsed.data.password,
            expectedRole,
          );

          if (!user) {
            return null;
          }

          if (!isUserRole(user.role) || !isUserStatus(user.status)) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            avatar: user.avatar ?? null,
          };
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === ACCOUNT_UNAVAILABLE_MESSAGE
          ) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
});
