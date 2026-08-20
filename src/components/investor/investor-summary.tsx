import { formatMoneyCompact } from "@/lib/money";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { cn } from "@/lib/utils";

export type InvestorSummaryStats = {
  total: number;
  confirmed: number;
  pending: number;
  failed: number;
  confirmedAmountMinor: number;
};

export function InvestorSummary({
  stats,
  className,
}: {
  stats: InvestorSummaryStats;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 bg-pastel-lavender/70 p-6 text-pastel-lavender-foreground shadow-card sm:p-8",
        className,
      )}
      aria-label="Investment summary"
    >
      <p className="font-display text-4xl tracking-tight sm:text-5xl">
        {formatMoneyCompact({
          amountMinor: stats.confirmedAmountMinor,
          currency: DEFAULT_CURRENCY,
        })}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">Total confirmed</p>
      <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Ideas backed</dt>
          <dd className="font-semibold text-foreground">
            {stats.confirmed} confirmed
            {stats.total !== stats.confirmed ? ` · ${stats.total} total` : null}
          </dd>
        </div>
        {stats.pending > 0 ? (
          <div>
            <dt className="text-muted-foreground">Payment pending</dt>
            <dd className="font-semibold text-foreground">{stats.pending}</dd>
          </div>
        ) : null}
        {stats.failed > 0 ? (
          <div>
            <dt className="text-muted-foreground">Payment failed</dt>
            <dd className="font-semibold text-foreground">{stats.failed}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
