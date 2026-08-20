import Link from "next/link";

import { investmentsListHref } from "@/lib/investor/investment-card";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "pending", label: "Payment pending" },
  { id: "failed", label: "Failed" },
] as const;

export function InvestmentFilterPills({
  status,
  search,
}: {
  status: string;
  search?: string;
}) {
  return (
    <nav aria-label="Filter investments" className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => {
        const active = status === filter.id;
        return (
          <Link
            key={filter.id}
            href={investmentsListHref({ status: filter.id, search })}
            className={cn(
              "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium motion-safe-transition",
              active
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-border/60 bg-card text-foreground hover:bg-pastel-lavender/80",
            )}
            aria-current={active ? "page" : undefined}
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );
}
