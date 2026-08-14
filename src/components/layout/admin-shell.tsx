"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Logo } from "@/components/shared/logo";
import { adminNavigation, siteConfig } from "@/config";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

interface AdminShellProps {
  children: React.ReactNode;
  user: SessionUser;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A";
}

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:block">
        <div className="flex h-16 items-center border-b px-6">
          <Logo showText={false} />
          <span className="ml-2 text-sm font-semibold text-muted-foreground">Admin</span>
        </div>
        <nav className="space-y-1 p-4" aria-label="Admin navigation">
          {adminNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
              aria-disabled={item.disabled}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r bg-background shadow-lg">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Logo showText={false} />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1 p-4" aria-label="Admin navigation">
              {adminNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.disabled ? "#" : item.href}
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-md p-2 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Admin Portal
              </p>
              <h1 className="text-sm font-semibold text-foreground">{siteConfig.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {user.email} · {user.role}
              </p>
            </div>
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground"
              aria-hidden="true"
            >
              {getInitials(user.name)}
            </div>
            <LogoutButton redirectTo="/admin/login" />
          </div>
        </header>

        <div className="border-b bg-background px-4 py-3 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>Admin</li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-foreground">Dashboard</li>
            </ol>
          </nav>
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
