"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNavPanel } from "@/components/layout/mobile-nav-panel";
import { Logo } from "@/components/shared/logo";
import { investorNavigation } from "@/config";
import { initialsFromName } from "@/lib/investor/greeting";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface InvestorShellProps {
  children: React.ReactNode;
  user: SessionUser;
}

function isInvestorNavActive(pathname: string, href: string): boolean {
  if (href === "/investor") {
    return pathname === "/investor";
  }
  if (href === "/projects") {
    return pathname === "/projects" || pathname.startsWith("/projects/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function InvestorShell({ children, user }: InvestorShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initials = initialsFromName(user.name);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 shadow-soft backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex" aria-label="Investor navigation">
            {investorNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 motion-safe-transition hover:bg-pastel-lavender/80 hover:text-foreground",
                  isInvestorNavActive(pathname, item.href) && "bg-pastel-lavender text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <AccountMenu name={user.name} email={user.email} />
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-foreground md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <MobileNavPanel open={mobileMenuOpen} label="Mobile investor navigation">
          {investorNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium motion-safe-transition hover:bg-pastel-lavender/80",
                isInvestorNavActive(pathname, item.href) && "bg-pastel-lavender text-foreground",
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="px-3 text-sm font-medium">{user.name}</p>
            <p className="px-3 text-xs text-muted-foreground">{user.email}</p>
            <div
              className="mt-3 flex h-9 w-9 items-center justify-center rounded-full bg-pastel-lavender text-xs font-medium text-primary"
              aria-hidden="true"
            >
              {initials}
            </div>
            <LogoutButton
              redirectTo="/login"
              variant="ghost"
              size="default"
              label="Log out"
              className="mt-2 min-h-11 w-full justify-start"
              showIcon
            />
          </div>
        </MobileNavPanel>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
