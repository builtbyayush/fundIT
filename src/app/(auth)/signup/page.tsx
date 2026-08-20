import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/forms/auth-card";
import { SignupForm } from "@/components/forms/signup-form";
import { UserRole } from "@/constants/roles";
import { siteConfig } from "@/config";
import { safeInvestCallbackUrl } from "@/lib/auth/callback-url";

interface SignupPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeInvestCallbackUrl(params.callbackUrl);

  if (session?.user) {
    if (session.user.role === UserRole.ADMIN) {
      redirect("/admin");
    }
    if (callbackUrl && session.user.role === UserRole.INVESTOR) {
      redirect(callbackUrl);
    }
    redirect("/investor");
  }

  return (
    <AuthCard
      title="Create investor account"
      description={`Join ${siteConfig.name} to discover investment opportunities`}
    >
      <SignupForm callbackUrl={callbackUrl ?? undefined} />
    </AuthCard>
  );
}
