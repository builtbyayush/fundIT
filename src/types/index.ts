export type { Category } from "@/constants/categories";
export type { UserRole } from "@/constants/roles";
export type { UserStatus } from "@/constants/user-status";
import type { UserRole } from "@/constants/roles";
import type { UserStatus } from "@/constants/user-status";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  createdAt: Date;
}
