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
import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { formatMoney } from "@/lib/money";
import { opportunityStatusLabel } from "@/lib/status-labels";
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
}

function InvestmentCta({
  slug,
  investable,
  user,
}: {
  slug: string;
  investable: boolean;
  user: SessionUser | null;
}) {
  if (!investable) {
    return (
      <Button className="w-full" variant="outline" asChild>
        <Link href="/projects">Explore other opportunities</Link>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button className="w-full" size="lg" asChild>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/projects/${slug}/invest`)}`}
        >
          Sign in to invest
        </Link>
      </Button>
    );
  }

  if (user.role !== UserRole.INVESTOR) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        Investor account required
      </Button>
    );
  }

  if (user.status !== UserStatus.ACTIVE) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        Account not active
      </Button>
    );
  }

  return (
    <Button className="w-full" size="lg" asChild>
      <Link href={`/projects/${slug}/invest`}>Invest now</Link>
    </Button>
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
    <Card className={className}>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Investment opportunity</CardTitle>
          {opportunity?.investable ? (
            <Badge className="border-success/30 bg-success/10 text-success">
              Open for investment
            </Badge>
          ) : opportunity ? (
            <Badge variant="outline">{opportunityStatusLabel(opportunity.status)}</Badge>
          ) : null}
        </div>
        <CardDescription>
          {opportunity?.investable
            ? "Review funding progress and invest when you are ready."
            : opportunity
              ? `Investment is ${opportunityStatusLabel(opportunity.status).toLowerCase()}.`
              : "This project is currently available for discovery. Investment terms are not open yet."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {opportunity ? (
          <>
            <div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {formatMoney({
                  amountMinor: opportunity.committedAmountMinor,
                  currency,
                })}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">committed</p>
            </div>

            <FundingProgressBar
              committedMinor={opportunity.committedAmountMinor}
              targetMinor={opportunity.fundingTargetMinor}
              currency={currency}
            />

            {(opportunity.minimumInvestment || opportunity.maximumInvestment) && (
              <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/30 p-4 text-sm">
                {opportunity.minimumInvestment ? (
                  <div>
                    <dt className="text-muted-foreground">Minimum</dt>
                    <dd className="mt-1 font-semibold">
                      {formatMoney(opportunity.minimumInvestment)}
                    </dd>
                  </div>
                ) : null}
                {opportunity.maximumInvestment ? (
                  <div>
                    <dt className="text-muted-foreground">Maximum</dt>
                    <dd className="mt-1 font-semibold">
                      {formatMoney(opportunity.maximumInvestment)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}

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
          </>
        ) : null}

        <InvestmentCta
          slug={slug}
          investable={Boolean(opportunity?.investable)}
          user={user}
        />
      </CardContent>
    </Card>
  );
}

export { InvestmentCta };
