import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { InvestForm } from "@/components/forms/invest-form";
import { FundingProgressBar } from "@/components/project/funding-progress";
import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { connectToDatabase } from "@/lib/db";
import {
  getPublishedProjectBySlug,
  serializePublicProject,
} from "@/services/project.service";
import {
  getOpportunityByProjectId,
  serializePublicOpportunityDetail,
} from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

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
            <CardTitle>Not currently investable</CardTitle>
            <CardDescription>
              This project is published, but its investment opportunity is not open.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/projects/${slug}`}>Back to project</Link>
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-10 sm:py-12">
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <CardDescription>{project.shortDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {project.categories.map((category, index) => (
                  <Badge
                    key={category.id || category.slug}
                    variant={index === 0 ? "secondary" : "outline"}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            ) : null}
            <FundingProgressBar
              committedMinor={opportunity.committedAmountMinor}
              targetMinor={opportunity.fundingTarget?.amountMinor ?? null}
              currency={opportunity.currency}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invest</CardTitle>
            <CardDescription>
              Choose an amount, review the details, then continue to development checkout.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvestForm
              projectId={project.id}
              projectTitle={project.title}
              currency={opportunity.currency}
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
