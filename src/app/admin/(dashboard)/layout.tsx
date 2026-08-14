import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AdminShell } from "@/components/layout/admin-shell";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireRole(UserRole.ADMIN);
  } catch {
    redirect("/admin/login");
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
