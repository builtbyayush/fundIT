"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants/roles";
import { publicNavigation } from "@/config";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface HeaderProps {
  user?: SessionUser | null;
}

export function Header({ user = null }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardHref =
    user?.role === UserRole.ADMIN
      ? "/admin"
      : user?.role === UserRole.INVESTOR
        ? "/investor"
        : null;

  const logoutRedirect =
    user?.role === UserRole.ADMIN ? "/admin/login" : "/login";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
              aria-disabled={item.disabled}
              onClick={item.disabled ? (e) => e.preventDefault() : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user && dashboardHref ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <LogoutButton
                redirectTo={logoutRedirect}
                variant="outline"
                size="sm"
                label="Sign out"
                showIcon={false}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}
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
        <nav className="border-t px-4 py-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                  item.disabled && "cursor-not-allowed opacity-50",
                )}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  else setMobileMenuOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t pt-4">
              {user && dashboardHref ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={dashboardHref} onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </Button>
                  <LogoutButton
                    redirectTo={logoutRedirect}
                    variant="outline"
                    size="sm"
                    label="Sign out"
                    showIcon={false}
                    className="w-full"
                  />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
