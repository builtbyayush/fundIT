import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/forms/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { UserRole } from "@/constants/roles";
import { siteConfig } from "@/config";
import { safeAuthCallbackUrl, safeInvestCallbackUrl } from "@/lib/auth/callback-url";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = safeAuthCallbackUrl(params.callbackUrl);
  const investCallback = safeInvestCallbackUrl(params.callbackUrl);

  if (session?.user) {
    if (session.user.role === UserRole.ADMIN) {
      redirect("/admin");
    }
    if (investCallback && session.user.role === UserRole.INVESTOR) {
      redirect(investCallback);
    }
    redirect("/investor");
  }

  const signupHref = investCallback
    ? `/signup?callbackUrl=${encodeURIComponent(investCallback)}`
    : "/signup";

  return (
    <AuthCard
      title="Sign in"
      description={`Access your ${siteConfig.name} investor account`}
    >
      <LoginForm
        callbackUrl={callbackUrl ?? undefined}
        expectedRole={UserRole.INVESTOR}
        signupHref={signupHref}
      />
    </AuthCard>
  );
}
