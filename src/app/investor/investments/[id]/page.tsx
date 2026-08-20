import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { FailedPaymentCallout } from "@/components/investor/failed-payment-callout";
import { InvestmentDetailHero } from "@/components/investor/investment-detail-hero";
import { InvestmentStatusBadge } from "@/components/investor/investment-status-badge";
import { PendingPaymentCallout } from "@/components/investor/pending-payment-callout";
import { FundingProgressBar } from "@/components/project/funding-progress";
import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { DEFAULT_CURRENCY, isCurrencyCode } from "@/constants/currency";
import { InvestmentStatus } from "@/constants/investment-status";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import {
  isConfirmedInvestment,
  isFailedInvestment,
  investmentNeedsPayment,
} from "@/lib/investor/status-presentation";
import { paymentStatusLabel } from "@/lib/status-labels";
import {
  getInvestorInvestment,
  serializeInvestment,
} from "@/services/investment.service";
import { getInvestmentSummariesForProjects } from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; failed?: string }>;
}

export default async function InvestorInvestmentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const investor = await requireRole(UserRole.INVESTOR);
  const { id } = await params;
  const flags = await searchParams;

  await connectToDatabase();

  let investment;
  try {
    const doc = await getInvestorInvestment(id, investor.id);
    await doc.populate({
      path: "project",
      select: "title slug coverImage thumbnail primaryCategory categories",
      populate: [
        { path: "primaryCategory", select: "name slug icon" },
        { path: "categories", select: "name slug icon" },
      ],
    });
    investment = serializeInvestment(doc);
  } catch {
    notFound();
  }

  const projectTitle =
    "title" in investment.project ? (investment.project.title ?? "This idea") : "This idea";
  const projectSlug = "slug" in investment.project ? investment.project.slug : undefined;
  const coverImage = "coverImage" in investment.project ? investment.project.coverImage : null;
  const thumbnail = "thumbnail" in investment.project ? investment.project.thumbnail : null;
  const category =
    "primaryCategory" in investment.project ? investment.project.primaryCategory : null;

  const summaries = await getInvestmentSummariesForProjects([investment.project.id]);
  const funding = summaries.get(investment.project.id);
  const currency = isCurrencyCode(investment.currency)
    ? investment.currency
    : DEFAULT_CURRENCY;
  const needsPayment = investmentNeedsPayment(investment.status);
  const confirmed = isConfirmedInvestment(investment.status);
  const failed = isFailedInvestment(investment.status);

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/investor/investments">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to My investments
          </Link>
        </Button>
        {projectSlug ? (
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${projectSlug}`}>
              View project
              <span aria-hidden="true"> →</span>
            </Link>
          </Button>
        ) : null}
      </div>

      {flags.paid === "1" && confirmed ? (
        <p className="mb-6 rounded-2xl border border-success/30 bg-pastel-mint px-4 py-3 text-sm text-pastel-mint-foreground">
          You’re in. Payment recorded and your participation is confirmed.
        </p>
      ) : null}
      {flags.paid === "1" && !confirmed ? (
        <p className="mb-6 rounded-2xl border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Payment is still processing. This is not confirmed yet.
        </p>
      ) : null}
      {flags.failed === "1" ? (
        <p className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Payment didn’t go through. You can retry below without creating a duplicate.
        </p>
      ) : null}

      <div className="mx-auto max-w-3xl space-y-6">
        <InvestmentDetailHero
          title={projectTitle}
          slug={projectSlug}
          coverImage={coverImage}
          thumbnail={thumbnail}
          category={category}
          amountMinor={investment.amountMinor}
          currency={currency}
          status={investment.status}
        />

        {confirmed && flags.paid !== "1" ? (
          <div className="rounded-2xl border border-success/30 bg-pastel-mint p-5 text-pastel-mint-foreground">
            <p className="font-display text-lg">You’re in.</p>
            <p className="mt-1 text-sm">Your investment has been confirmed.</p>
          </div>
        ) : null}

        {needsPayment ? <PendingPaymentCallout investmentId={investment.id} /> : null}
        {failed ? <FailedPaymentCallout projectSlug={projectSlug} /> : null}

        {funding ? (
          <FundingProgressBar
            committedMinor={funding.committedAmountMinor}
            targetMinor={funding.fundingTargetMinor}
            currency={isCurrencyCode(funding.currency) ? funding.currency : currency}
          />
        ) : null}

        <dl className="grid gap-4 rounded-2xl border border-border/60 bg-card p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="mt-1 font-semibold">
              {formatMoney({
                amountMinor: investment.amountMinor,
                currency,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-1">
              <InvestmentStatusBadge status={investment.status} />
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Reference</dt>
            <dd className="mt-1 font-medium">{investment.investmentNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Initiated</dt>
            <dd className="mt-1 font-medium">
              {new Date(investment.initiatedAt).toLocaleString()}
            </dd>
          </div>
          {investment.confirmedAt ? (
            <div>
              <dt className="text-muted-foreground">Confirmed</dt>
              <dd className="mt-1 font-medium">
                {new Date(investment.confirmedAt).toLocaleString()}
              </dd>
            </div>
          ) : null}
          {investment.status === InvestmentStatus.PAYMENT_SUCCESS ? (
            <div>
              <dt className="text-muted-foreground">Payment</dt>
              <dd className="mt-1 font-medium">
                {paymentStatusLabel(investment.paymentStatus)}
              </dd>
            </div>
          ) : null}
          {investment.termsVersion ? (
            <div>
              <dt className="text-muted-foreground">Terms</dt>
              <dd className="mt-1 font-medium">Version {investment.termsVersion}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </Container>
  );
}
