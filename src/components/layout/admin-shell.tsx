"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/shared/logo";
import { adminNavigation, siteConfig } from "@/config";
import { adminBreadcrumbs, isAdminNavActive } from "@/lib/admin/nav";
import { initialsFromName } from "@/lib/investor/greeting";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface AdminShellProps {
  children: React.ReactNode;
  user: SessionUser;
}

function AdminNavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Admin navigation">
      {adminNavigation.map((item) => {
        const active = isAdminNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium motion-safe-transition",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const crumbs = adminBreadcrumbs(pathname);
  const initials = initialsFromName(user.name);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border/80 bg-card lg:block">
        <div className="flex h-16 items-center gap-2 border-b border-border/80 px-5">
          <Logo showText={false} />
          <span className="text-sm font-semibold text-foreground">FundIt Admin</span>
        </div>
        <AdminNavLinks pathname={pathname} className="p-3" />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border/80 bg-card shadow-elevated">
            <div className="flex h-16 items-center justify-between border-b border-border/80 px-4">
              <span className="text-sm font-semibold">FundIt Admin</span>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminNavLinks
              pathname={pathname}
              onNavigate={() => setSidebarOpen(false)}
              className="p-3"
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">FundIt Admin</p>
              <p className="hidden text-xs text-muted-foreground sm:block">
                {siteConfig.name} operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground"
              aria-hidden="true"
            >
              {initials}
            </div>
            <LogoutButton
              redirectTo="/admin/login"
              variant="outline"
              size="sm"
              label="Log out"
              showIcon={false}
            />
          </div>
        </header>

        <div className="border-b border-border/80 bg-card px-4 py-2.5 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1;
                return (
                  <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {crumb.href && !last ? (
                      <Link href={crumb.href} className="hover:text-foreground">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className={last ? "font-medium text-foreground" : undefined}>
                        {crumb.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
