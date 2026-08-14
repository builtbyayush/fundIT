import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/20 px-4">
      <div className="mb-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Access denied</CardTitle>
          <CardDescription>
            You do not have permission to view this page, or your account is not
            active.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">Back to {siteConfig.name}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Investor sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
