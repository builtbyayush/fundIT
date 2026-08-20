import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { footerNavigation, siteConfig } from "@/config";

function FooterLinkList({
  heading,
  items,
}: {
  heading: string;
  items: readonly { label: string; href: string; disabled?: boolean }[];
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-foreground">{heading}</h3>
      <ul className="space-y-3">
        {items.map((item) => {
          const disabled = "disabled" in item ? Boolean(item.disabled) : false;
          return (
            <li key={item.href}>
              <Link
                href={disabled ? "#" : item.href}
                className="text-sm text-muted-foreground motion-safe-transition hover:text-foreground"
                aria-disabled={disabled || undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-pastel-lavender/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <FooterLinkList heading="Platform" items={footerNavigation.platform} />
          <FooterLinkList heading="Account" items={footerNavigation.account} />
          <FooterLinkList heading="Company" items={footerNavigation.company} />
        </div>

        <Separator className="my-8 bg-border/80" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
