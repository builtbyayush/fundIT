"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/shared/logo";
import { investorNavigation } from "@/config";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface InvestorShellProps {
  children: React.ReactNode;
  user: SessionUser;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "I";
}

export function InvestorShell({ children, user }: InvestorShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Investor navigation">
            {investorNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground"
              aria-hidden="true"
            >
              {getInitials(user.name)}
            </div>
            <LogoutButton redirectTo="/login" />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t px-4 py-4 md:hidden" aria-label="Mobile investor navigation">
            <div className="flex flex-col gap-1">
              {investorNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 border-t pt-4">
                <p className="px-3 text-sm font-medium">{user.name}</p>
                <p className="px-3 text-xs text-muted-foreground">{user.email}</p>
                <LogoutButton
                  redirectTo="/login"
                  variant="ghost"
                  size="default"
                  label="Sign out"
                  className="mt-2 w-full justify-start"
                  showIcon
                />
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
