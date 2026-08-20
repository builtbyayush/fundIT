import Link from "next/link";

import { FundingProgressBar } from "@/components/project/funding-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CurrencyCode } from "@/constants/currency";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import { formatMoney, formatMoneyCompact } from "@/lib/money";
import { getInvestmentCtaState } from "@/lib/project/investment-cta";
import { opportunityStatusLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";
import type { SessionUser } from "@/types";

export interface InvestmentOpportunityPanelData {
  investable: boolean;
  status: string;
  currency: CurrencyCode;
  committedAmountMinor: number;
  fundingTargetMinor: number | null;
  minimumInvestment?: { amountMinor: number; currency: CurrencyCode } | null;
  maximumInvestment?: { amountMinor: number; currency: CurrencyCode } | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  termsVersion?: number | null;
}

export function InvestmentCta({
  slug,
  investable,
  status,
  user,
  size = "lg",
  className,
}: {
  slug: string;
  investable: boolean;
  status: string | null;
  user: SessionUser | null;
  size?: "default" | "lg";
  className?: string;
}) {
  const cta = getInvestmentCtaState({ investable, status, slug, user });

  if (cta.kind === "link") {
    return (
      <Button className={cn("w-full", className)} size={size} asChild>
        <Link href={cta.href}>{cta.label}</Link>
      </Button>
    );
  }

  return (
    <Button className={cn("w-full", className)} size={size} variant="secondary" disabled>
      {cta.label}
    </Button>
  );
}

export function StickyInvestBar({
  slug,
  user,
}: {
  slug: string;
  user: SessionUser | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 p-3 pb-safe shadow-elevated backdrop-blur lg:hidden">
      <InvestmentCta slug={slug} investable status="OPEN" user={user} />
    </div>
  );
}

export function InvestmentOpportunityPanel({
  slug,
  opportunity,
  user,
  className,
}: {
  slug: string;
  opportunity: InvestmentOpportunityPanelData | null;
  user: SessionUser | null;
  className?: string;
}) {
  const currency = opportunity?.currency ?? DEFAULT_CURRENCY;

  return (
    <Card variant="elevated" className={className}>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Join this idea</CardTitle>
          {opportunity?.investable ? (
            <Badge className="border-success/30 bg-success/10 text-success">Open</Badge>
          ) : opportunity ? (
            <Badge variant="outline">{opportunityStatusLabel(opportunity.status)}</Badge>
          ) : null}
        </div>
        <CardDescription>
          {opportunity?.investable
            ? "Review the details, then choose an amount if you want to participate."
            : opportunity
              ? `This opportunity is ${opportunityStatusLabel(opportunity.status).toLowerCase()}.`
              : "This idea is available to explore. Participation is not open yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {opportunity ? (
          <>
            <div>
              <p className="font-display text-3xl tracking-tight text-foreground">
                {formatMoneyCompact({
                  amountMinor: opportunity.committedAmountMinor,
                  currency,
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">backed so far</p>
            </div>

            <FundingProgressBar
              committedMinor={opportunity.committedAmountMinor}
              targetMinor={opportunity.fundingTargetMinor}
              currency={currency}
            />

            {opportunity.minimumInvestment ? (
              <p className="text-sm text-muted-foreground">
                Starts at{" "}
                <span className="font-semibold text-foreground">
                  {formatMoney(opportunity.minimumInvestment)}
                </span>
              </p>
            ) : null}

            {opportunity.maximumInvestment ? (
              <p className="text-sm text-muted-foreground">
                Up to {formatMoney(opportunity.maximumInvestment)}
              </p>
            ) : null}

            {(opportunity.startDate || opportunity.endDate) && (
              <dl className="grid gap-2 text-sm">
                {opportunity.startDate ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Starts</dt>
                    <dd className="font-medium">
                      {new Date(opportunity.startDate).toLocaleDateString()}
                    </dd>
                  </div>
                ) : null}
                {opportunity.endDate ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Ends</dt>
                    <dd className="font-medium">
                      {new Date(opportunity.endDate).toLocaleDateString()}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}

            {opportunity.termsVersion ? (
              <p className="text-xs text-muted-foreground">Terms available</p>
            ) : null}
          </>
        ) : null}

        <InvestmentCta
          slug={slug}
          investable={Boolean(opportunity?.investable)}
          status={opportunity?.status ?? null}
          user={user}
        />
      </CardContent>
    </Card>
  );
}
