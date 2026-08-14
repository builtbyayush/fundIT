import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/forms/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { UserRole } from "@/constants/roles";
import { siteConfig } from "@/config";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user) {
    if (session.user.role === UserRole.ADMIN) {
      redirect("/admin");
    }
    redirect("/investor");
  }

  return (
    <AuthCard
      title="Sign in"
      description={`Access your ${siteConfig.name} investor account`}
    >
      <LoginForm
        callbackUrl={params.callbackUrl}
        expectedRole={UserRole.INVESTOR}
        signupHref="/signup"
      />
    </AuthCard>
  );
}
