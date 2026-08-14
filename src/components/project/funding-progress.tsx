import { formatMoney } from "@/lib/money";
import type { CurrencyCode } from "@/constants/currency";

export function FundingProgressBar({
  committedMinor,
  targetMinor,
  currency,
  className,
}: {
  committedMinor: number;
  targetMinor: number | null;
  currency: CurrencyCode;
  className?: string;
}) {
  if (!targetMinor || targetMinor < 1) {
    return (
      <p className={className}>
        <span className="font-medium text-foreground">
          {formatMoney({ amountMinor: committedMinor, currency })}
        </span>{" "}
        <span className="text-muted-foreground">committed</span>
      </p>
    );
  }

  const percentage = Math.min(
    Math.floor((committedMinor * 100) / targetMinor),
    100,
  );

  return (
    <div className={className}>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <p>
          <span className="font-semibold text-foreground">
            {formatMoney({ amountMinor: committedMinor, currency })}
          </span>{" "}
          <span className="text-muted-foreground">committed</span>
        </p>
        <p className="text-muted-foreground">
          of {formatMoney({ amountMinor: targetMinor, currency })}
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
