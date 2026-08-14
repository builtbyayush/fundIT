import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { InvestorShell } from "@/components/layout/investor-shell";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireRole(UserRole.INVESTOR);
  } catch {
    redirect("/login");
  }

  return <InvestorShell user={user}>{children}</InvestorShell>;
}
