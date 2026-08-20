import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/forms/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { UserRole } from "@/constants/roles";
import { safeAuthCallbackUrl } from "@/lib/auth/callback-url";

interface AdminLoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user?.role === UserRole.ADMIN) {
    redirect("/admin");
  }

  return (
    <AuthCard
      decorative={false}
      title="Staff sign in"
      description="Use your FundIt admin account. There is no public signup for this portal."
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Admin accounts are provisioned by the platform.
        </p>
      }
    >
      <LoginForm
        callbackUrl={safeAuthCallbackUrl(params.callbackUrl) ?? "/admin"}
        expectedRole={UserRole.ADMIN}
        signupHref={null}
        submitLabel="Sign in"
      />
    </AuthCard>
  );
}
