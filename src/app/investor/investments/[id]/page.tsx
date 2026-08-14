import Link from "next/link";
import { notFound } from "next/navigation";

import { ResumePaymentButton } from "@/components/investments/resume-payment-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/section-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InvestmentStatus } from "@/constants/investment-status";
import { UserRole } from "@/constants/roles";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import {
  investmentStatusLabel,
  paymentStatusLabel,
} from "@/lib/status-labels";
import {
  getInvestorInvestment,
  serializeInvestment,
} from "@/services/investment.service";

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
    await doc.populate("project", "title slug");
    investment = serializeInvestment(doc);
  } catch {
    notFound();
  }

  const needsPayment =
    investment.status === InvestmentStatus.PAYMENT_PENDING ||
    investment.status === InvestmentStatus.INITIATED;

  return (
    <Container className="py-10 sm:py-12">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/investor/investments">← Back to My investments</Link>
        </Button>
      </div>

      {flags.paid === "1" && investment.status === InvestmentStatus.CONFIRMED ? (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          Payment recorded and investment confirmed.
        </p>
      ) : null}
      {flags.paid === "1" && investment.status !== InvestmentStatus.CONFIRMED ? (
        <p className="mb-4 rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
          Payment is still processing. This investment is not confirmed yet.
        </p>
      ) : null}
      {flags.failed === "1" ? (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Payment failed. This investment was not confirmed.
        </p>
      ) : null}

      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>{investment.investmentNumber}</CardTitle>
          <CardDescription>
            {"title" in investment.project
              ? investment.project.title
              : "Investment detail"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{investmentStatusLabel(investment.status)}</Badge>
            <Badge variant="outline">
              {paymentStatusLabel(investment.paymentStatus)}
            </Badge>
          </div>

          {needsPayment ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">Payment pending</p>
              <p className="mt-1">
                This investment is not confirmed until payment succeeds. You can resume
                the development checkout without creating a duplicate investment.
              </p>
              <div className="mt-3">
                <ResumePaymentButton investmentId={investment.id} />
              </div>
            </div>
          ) : null}

          {investment.status === InvestmentStatus.FAILED ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              Payment failed or could not be completed. This commitment was not confirmed.
            </div>
          ) : null}

          <p className="text-2xl font-semibold">
            {formatMoney({
              amountMinor: investment.amountMinor,
              currency: investment.currency,
            })}
          </p>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Terms version</dt>
              <dd className="font-medium">{investment.termsVersion}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Initiated</dt>
              <dd className="font-medium">
                {new Date(investment.initiatedAt).toLocaleString()}
              </dd>
            </div>
            {investment.confirmedAt ? (
              <div>
                <dt className="text-muted-foreground">Confirmed</dt>
                <dd className="font-medium">
                  {new Date(investment.confirmedAt).toLocaleString()}
                </dd>
              </div>
            ) : null}
          </dl>
          {"slug" in investment.project && investment.project.slug ? (
            <Button variant="outline" asChild>
              <Link href={`/projects/${investment.project.slug}`}>View project</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </Container>
  );
}
