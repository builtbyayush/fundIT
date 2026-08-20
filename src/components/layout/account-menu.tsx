"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { initialsFromName } from "@/lib/investor/greeting";

export const investorAccountLinks = [
  { label: "My FundIt", href: "/investor" },
  { label: "My investments", href: "/investor/investments" },
  { label: "Profile", href: "/investor/profile" },
] as const;

export function AccountMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials = initialsFromName(name);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium motion-safe-transition hover:bg-pastel-lavender/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full bg-pastel-lavender text-xs font-medium text-primary"
          aria-hidden="true"
        >
          {initials}
        </span>
        <span className="hidden max-w-[10rem] truncate lg:inline">{name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-border/60 bg-card p-2 shadow-elevated"
        >
          <p className="truncate px-3 py-2 text-xs text-muted-foreground">{email}</p>
          {investorAccountLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium motion-safe-transition hover:bg-pastel-lavender/80"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-1 border-t border-border/60 pt-1">
            <LogoutButton
              redirectTo="/login"
              variant="ghost"
              size="default"
              label="Log out"
              className="min-h-11 w-full justify-start"
              showIcon
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
