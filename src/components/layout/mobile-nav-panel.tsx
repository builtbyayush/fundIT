"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";

interface MobileNavPanelProps {
  open: boolean;
  children: React.ReactNode;
  label: string;
}

export function MobileNavPanel({ open, children, label }: MobileNavPanelProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <nav
      className={cn(
        "overflow-hidden border-t border-border/60 bg-background md:hidden",
        "motion-safe-transition",
        open ? "max-h-[min(80vh,32rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0",
      )}
      aria-label={label}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <div className="flex max-h-[min(80vh,32rem)] flex-col gap-1 overflow-y-auto px-4 py-4">
        {children}
      </div>
    </nav>
  );
}
