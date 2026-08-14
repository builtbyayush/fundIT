import Link from "next/link";

import { siteConfig } from "@/config";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  const { logo } = siteConfig;

  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-bold tracking-tight text-foreground", className)}
      aria-label={`${siteConfig.name} home`}
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
        aria-hidden="true"
      >
        F
      </span>
      {showText && <span className="text-xl">{logo.text}</span>}
    </Link>
  );
}
