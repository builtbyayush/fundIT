import Link from "next/link";

import { DecorativeBlob } from "@/components/shared/decorative-blob";
import { Logo } from "@/components/shared/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { siteConfig } from "@/config";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  decorative?: boolean;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
  decorative = true,
}: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12">
      {decorative ? <DecorativeBlob /> : null}
      <div className="relative mb-8">
        <Logo />
      </div>
      <Card variant="elevated" className="relative w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
          {footer ? <div className="mt-6">{footer}</div> : null}
        </CardContent>
      </Card>
      <p className="relative mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="motion-safe-transition hover:text-foreground hover:underline">
          Back to {siteConfig.name}
        </Link>
      </p>
    </div>
  );
}
