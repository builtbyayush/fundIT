import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AuthCard } from "@/components/forms/auth-card";
import { LoginForm } from "@/components/forms/login-form";
import { UserRole } from "@/constants/roles";
import { siteConfig } from "@/config";

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
      title="Admin sign in"
      description={`Sign in to the ${siteConfig.name} admin portal`}
      footer={
        <p className="text-center text-xs text-muted-foreground">
          Admin accounts are provisioned by the platform. There is no public admin signup.
        </p>
      }
    >
      <LoginForm
        callbackUrl={params.callbackUrl ?? "/admin"}
        expectedRole={UserRole.ADMIN}
        signupHref={null}
        submitLabel="Sign in to admin"
      />
    </AuthCard>
  );
}
