import Link from "next/link";

import { InvestmentCard } from "@/components/investor/investment-card";
import { InvestorActivityList } from "@/components/investor/investor-activity-list";
import { InvestorDiscoverySection } from "@/components/investor/investor-discovery-section";
import { InvestorEmptyDashboard } from "@/components/investor/investor-empty-dashboard";
import { InvestorHero } from "@/components/investor/investor-hero";
import { InvestorSummary } from "@/components/investor/investor-summary";
import { PendingInvestmentsBanner } from "@/components/investor/pending-investments-banner";
import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants/roles";
import { toPublicProjectCard } from "@/lib/homepage/discovery";
import { requireRole } from "@/lib/auth/guards";
import { connectToDatabase } from "@/lib/db";
import { investorActivityItems } from "@/lib/investor/activity";
import { toInvestorInvestmentCard } from "@/lib/investor/investment-card";
import { getInvestmentSummariesForProjects } from "@/services/opportunity.service";
import {
  getInvestorBackedProjectIds,
  getInvestorInvestmentStats,
  listRecentInvestorInvestments,
  serializeInvestment,
} from "@/services/investment.service";
import {
  listPublishedProjectsExcluding,
  serializePublicProject,
} from "@/services/project.service";

export const dynamic = "force-dynamic";

export default async function InvestorDashboardPage() {
  const investor = await requireRole(UserRole.INVESTOR);
  await connectToDatabase();

  const [stats, recentDocs, backedIds] = await Promise.all([
    getInvestorInvestmentStats(investor.id),
    listRecentInvestorInvestments(investor.id, 6),
    getInvestorBackedProjectIds(investor.id),
  ]);

  const recent = recentDocs.map(serializeInvestment);
  const projectIds = recent.map((item) => item.project.id);
  const [summaries, discoveryDocs] = await Promise.all([
    getInvestmentSummariesForProjects(projectIds),
    listPublishedProjectsExcluding({ excludeProjectIds: backedIds, limit: 4 }),
  ]);
  const discoverySummaries = await getInvestmentSummariesForProjects(
    discoveryDocs.map((item) => item._id.toString()),
  );

  const cards = recent.map((item) =>
    toInvestorInvestmentCard(item, summaries.get(item.project.id)),
  );
  const firstPendingId = cards.find((card) => card.needsPayment)?.id;
  const activity = investorActivityItems(recent);
  const discovery = discoveryDocs.map((item) => {
    const project = serializePublicProject(item);
    return toPublicProjectCard(project, discoverySummaries.get(project.id));
  });

  return (
    <Container className="py-10 sm:py-12">
      <InvestorHero name={investor.name} />

      {stats.total === 0 ? (
        <div className="mt-10 space-y-12">
          <InvestorEmptyDashboard />
          <InvestorDiscoverySection projects={discovery} />
        </div>
      ) : (
        <div className="mt-10 space-y-12">
          <InvestorSummary stats={stats} />
          {stats.pending > 0 ? (
            <PendingInvestmentsBanner
              count={stats.pending}
              firstPendingId={firstPendingId}
            />
          ) : null}

          <section className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-2xl text-foreground">My backings</h2>
              <Button variant="ghost" asChild>
                <Link href="/investor/investments">See all</Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((investment) => (
                <InvestmentCard key={investment.id} investment={investment} />
              ))}
            </div>
          </section>

          <InvestorActivityList items={activity} />
          <InvestorDiscoverySection projects={discovery} />
        </div>
      )}
    </Container>
  );
}
