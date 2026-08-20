import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import type { AdminAttentionItem } from "@/lib/admin/workspace-stats";

export function AdminAttentionList({ items }: { items: AdminAttentionItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        className="py-8 shadow-none"
        title="Nothing needs attention"
        description="No drafts, unpublished gaps, or pending payments right now."
      />
    );
  }

  return (
    <ul className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40"
          >
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{item.title}</span>
              <span className="text-xs text-muted-foreground">{item.reason}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
