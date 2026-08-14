import Link from "next/link";

import { ProjectCard } from "@/components/project/project-card";
import { Container, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { connectToDatabase } from "@/lib/db";
import {
  getInvestmentSummariesForProjects,
  type PublicInvestmentCardSummary,
} from "@/services/opportunity.service";
import {
  listPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";

export async function FeaturedOpportunitiesSection() {
  let projects: ReturnType<typeof serializePublicProject>[] = [];
  let summaries = new Map<string, PublicInvestmentCardSummary>();

  try {
    await connectToDatabase();
    const result = await listPublishedProjects({
      page: 1,
      limit: 3,
      search: "",
      category: "",
      sort: "newest",
    });
    projects = result.items.map(serializePublicProject);
    summaries = await getInvestmentSummariesForProjects(projects.map((p) => p.id));
  } catch {
    projects = [];
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Featured"
          title="Investment Opportunities"
          description="Recently published projects available to explore on FundIt."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const summary = summaries.get(project.id);
            return (
              <ProjectCard
                key={project.id}
                project={{
                  title: project.title,
                  slug: project.slug,
                  shortDescription: project.shortDescription,
                  thumbnail: project.thumbnail,
                  coverImage: project.coverImage,
                  tags: project.tags,
                  location: project.location,
                  categories: project.categories,
                  primaryCategory: project.primaryCategory,
                  investment: summary
                    ? {
                        investable: summary.investable,
                        opportunityStatus: summary.opportunityStatus,
                        currency: summary.currency,
                        committedAmountMinor: summary.committedAmountMinor,
                        fundingTargetMinor: summary.fundingTargetMinor,
                      }
                    : null,
                }}
              />
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button variant="outline" asChild>
            <Link href="/projects">Browse all opportunities</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}
