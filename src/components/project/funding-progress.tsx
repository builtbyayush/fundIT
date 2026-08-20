import { formatMoneyCompact } from "@/lib/money";
import type { CurrencyCode } from "@/constants/currency";
import { fundingPercentage } from "@/lib/project/funding";
import { cn } from "@/lib/utils";

export function FundingProgressBar({
  committedMinor,
  targetMinor,
  currency,
  compact = false,
  className,
}: {
  committedMinor: number;
  targetMinor: number | null;
  currency: CurrencyCode;
  compact?: boolean;
  className?: string;
}) {
  if (!targetMinor || targetMinor < 1) {
    if (compact) return null;
    return (
      <p className={className}>
        <span className="font-medium text-foreground">
          {formatMoneyCompact({ amountMinor: committedMinor, currency })}
        </span>{" "}
        <span className="text-muted-foreground">committed</span>
      </p>
    );
  }

  const percentage = fundingPercentage(committedMinor, targetMinor);

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm font-semibold text-foreground">{percentage}% backed</p>
        <div
          className="h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percentage}% backed`}
        >
          <div
            className="h-full rounded-full bg-secondary"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <p>
          <span className="font-semibold text-foreground">
            {formatMoneyCompact({ amountMinor: committedMinor, currency })}
          </span>{" "}
          <span className="text-muted-foreground">committed</span>
        </p>
        <p className="text-muted-foreground">
          of {formatMoneyCompact({ amountMinor: targetMinor, currency })}
        </p>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentage}% of funding target committed`}
      >
        <div
          className="h-full rounded-full bg-secondary transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{percentage}% of target</p>
    </div>
  );
}
