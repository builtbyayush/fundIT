import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { footerNavigation, siteConfig } from "@/config";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Platform</h3>
            <ul className="space-y-3">
              {footerNavigation.platform.map((item) => {
                const disabled = "disabled" in item ? Boolean(item.disabled) : false;
                return (
                  <li key={item.href}>
                    <Link
                      href={disabled ? "#" : item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      aria-disabled={disabled || undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => {
                const disabled = "disabled" in item ? Boolean(item.disabled) : false;
                return (
                  <li key={item.href}>
                    <Link
                      href={disabled ? "#" : item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      aria-disabled={disabled || undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Investment opportunities and platform updates — coming in a future phase.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Phase 1 — Foundation Preview</p>
        </div>
      </div>
    </footer>
  );
}
