"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/auth/logout";

interface LogoutButtonProps {
  redirectTo?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "default" | "sm" | "icon";
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function LogoutButton({
  redirectTo = "/login",
  variant = "ghost",
  size = "icon",
  label,
  className,
  showIcon = true,
}: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button type="submit" variant={variant} size={size} className={className} aria-label="Sign out">
        {showIcon ? <LogOut className="h-4 w-4" /> : null}
        {label ? <span className={showIcon ? "ml-2" : undefined}>{label}</span> : null}
      </Button>
    </form>
  );
}
