import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/constants/roles";
import type { UserStatus } from "@/constants/user-status";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string | null;
  }
}
