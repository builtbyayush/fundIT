import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { InvestForm } from "@/components/forms/invest-form";
import { FundingProgressBar } from "@/components/project/funding-progress";
import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { connectToDatabase } from "@/lib/db";
import {
  PASTEL_BADGE_VARIANT,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import {
  getPublishedProjectBySlug,
  serializePublicProject,
} from "@/services/project.service";
import {
  getOpportunityByProjectId,
  serializePublicOpportunityDetail,
} from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Back this idea",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function InvestPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/projects/${slug}/invest`)}`);
  }
  if (session.user.role !== UserRole.INVESTOR) {
    redirect("/unauthorized");
  }
  if (session.user.status !== UserStatus.ACTIVE) {
    redirect("/unauthorized");
  }

  await connectToDatabase();
  const doc = await getPublishedProjectBySlug(slug);
  if (!doc) notFound();

  const project = serializePublicProject(doc);
  const opportunity = serializePublicOpportunityDetail(
    await getOpportunityByProjectId(project.id),
  );

  if (!opportunity?.investable) {
    return (
      <Container className="py-12">
        <Card className="mx-auto max-w-lg">
          <CardHeader>
            <CardTitle>Not currently open</CardTitle>
            <CardDescription>
              This idea is published, but participation is not open right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/projects/${slug}`}>Back to idea</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const primary = project.categories[0];

  return (
    <Container className="py-10 sm:py-12">
      <Link
        href={`/projects/${slug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to idea
      </Link>

      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card variant="elevated">
          <CardHeader>
            {primary ? (
              <Badge
                variant={
                  primary.slug
                    ? PASTEL_BADGE_VARIANT[pastelForCategorySlug(primary.slug)]
                    : "outline"
                }
                className="w-fit"
              >
                {primary.name}
              </Badge>
            ) : null}
            <CardTitle className="font-display text-2xl">{project.title}</CardTitle>
            <CardDescription>{project.shortDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <FundingProgressBar
              committedMinor={opportunity.committedAmountMinor}
              targetMinor={opportunity.fundingTarget?.amountMinor ?? null}
              currency={opportunity.currency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choose an amount</CardTitle>
            <CardDescription>
              Review the details next, then continue to a development payment simulation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestForm
              projectId={project.id}
              projectTitle={project.title}
              currency={opportunity.currency}
              opportunityStatus={opportunity.status}
              termsVersion={opportunity.termsVersion}
              minimumInvestment={opportunity.minimumInvestment}
              maximumInvestment={opportunity.maximumInvestment}
              fundingTargetMinor={opportunity.fundingTarget?.amountMinor ?? null}
              committedAmountMinor={opportunity.committedAmountMinor}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
