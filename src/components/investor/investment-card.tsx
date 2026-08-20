import Link from "next/link";

import { FundingProgressBar } from "@/components/project/funding-progress";
import { ProjectImage } from "@/components/project/project-image";
import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
import { InvestmentStatusBadge } from "@/components/investor/investment-status-badge";
import { ResumePaymentButton } from "@/components/investments/resume-payment-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import {
  PASTEL_BADGE_VARIANT,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import { resolveProjectCardImage } from "@/lib/project/display";
import type { InvestorInvestmentCardData } from "@/lib/investor/investment-card";
import { cn } from "@/lib/utils";

export function InvestmentCard({
  investment,
  className,
}: {
  investment: InvestorInvestmentCardData;
  className?: string;
}) {
  const imageSrc = resolveProjectCardImage(
    investment.project.thumbnail,
    investment.project.coverImage,
  );
  const primary = investment.project.primaryCategory;
  const href = `/investor/investments/${investment.id}`;

  return (
    <Card
      variant="interactive"
      className={cn("group flex h-full flex-col overflow-hidden", className)}
    >
      <Link
        href={href}
        className="relative block aspect-[4/3] overflow-hidden bg-pastel-blue/60"
      >
        {imageSrc ? (
          <ProjectImage
            src={imageSrc}
            alt={`${investment.project.title} cover`}
            title={investment.project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            compactPlaceholder
            className="motion-safe-transition group-hover:scale-105"
          />
        ) : (
          <ProjectMediaPlaceholder title={investment.project.title} compact />
        )}
      </Link>

      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {primary ? (
            <Badge
              variant={
                primary.slug
                  ? PASTEL_BADGE_VARIANT[pastelForCategorySlug(primary.slug)]
                  : "pastelMint"
              }
            >
              {primary.name}
            </Badge>
          ) : null}
          <InvestmentStatusBadge status={investment.status} />
        </div>
        <CardTitle className="text-xl leading-snug">
          <Link href={href} className="hover:text-primary">
            {investment.project.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-4">
        <p className="font-display text-2xl text-foreground">
          {formatMoney({
            amountMinor: investment.amountMinor,
            currency: investment.currency,
          })}{" "}
          <span className="text-base font-medium text-muted-foreground">backed</span>
        </p>
        {investment.funding ? (
          <FundingProgressBar
            committedMinor={investment.funding.committedMinor}
            targetMinor={investment.funding.targetMinor}
            currency={investment.funding.currency}
            compact
          />
        ) : null}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-0">
        <Button className="w-full" variant="secondary" asChild>
          <Link href={href}>
            View investment
            <span aria-hidden="true"> →</span>
          </Link>
        </Button>
        {investment.needsPayment ? (
          <ResumePaymentButton
            investmentId={investment.id}
            label="Continue payment"
            variant="default"
            className="w-full"
          />
        ) : investment.project.slug ? (
          <Button className="w-full" variant="ghost" asChild>
            <Link href={`/projects/${investment.project.slug}`}>View project</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
