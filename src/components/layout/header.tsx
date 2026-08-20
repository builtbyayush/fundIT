"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AccountMenu, investorAccountLinks } from "@/components/layout/account-menu";
import { MobileNavPanel } from "@/components/layout/mobile-nav-panel";
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
  const [scrolled, setScrolled] = useState(false);

  const dashboardHref =
    user?.role === UserRole.ADMIN
      ? "/admin"
      : user?.role === UserRole.INVESTOR
        ? "/investor"
        : null;

  const logoutRedirect =
    user?.role === UserRole.ADMIN ? "/admin/login" : "/login";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b motion-safe-transition",
        scrolled
          ? "border-border/80 bg-background/90 shadow-soft backdrop-blur"
          : "border-transparent bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 motion-safe-transition hover:bg-pastel-lavender/80 hover:text-foreground",
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
          {user?.role === UserRole.INVESTOR ? (
            <AccountMenu name={user.name} email={user.email} />
          ) : user && dashboardHref ? (
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
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Join FundIt</Link>
              </Button>
            </>
          )}
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

      <MobileNavPanel open={mobileMenuOpen} label="Mobile navigation">
        {publicNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.disabled ? "#" : item.href}
            className={cn(
              "flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-medium motion-safe-transition hover:bg-pastel-lavender/80",
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
        <div className="mt-4 flex flex-col gap-2 border-t border-border/60 pt-4">
          {user?.role === UserRole.INVESTOR ? (
            <>
              {investorAccountLinks.map((item) => (
                <Button key={item.href} variant="ghost" size="sm" asChild>
                  <Link href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </Link>
                </Button>
              ))}
              <LogoutButton
                redirectTo="/login"
                variant="outline"
                size="sm"
                label="Log out"
                showIcon={false}
                className="w-full"
              />
            </>
          ) : user && dashboardHref ? (
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
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  Join FundIt
                </Link>
              </Button>
            </>
          )}
        </div>
      </MobileNavPanel>
    </header>
  );
}
