import Link from "next/link";

import type { InvestorActivityItem } from "@/lib/investor/activity";

export function InvestorActivityList({ items }: { items: InvestorActivityItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl text-foreground">Recent activity</h2>
      <ul className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex min-h-11 items-center justify-between gap-4 px-4 py-3 text-sm motion-safe-transition hover:bg-pastel-lavender/50"
            >
              <span className="font-medium text-foreground">{item.text}</span>
              <time
                className="shrink-0 text-meta text-muted-foreground"
                dateTime={item.at.toISOString()}
              >
                {item.at.toLocaleDateString()}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
