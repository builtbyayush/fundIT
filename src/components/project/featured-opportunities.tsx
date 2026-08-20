import Link from "next/link";
import { Compass } from "lucide-react";

import { ProjectCard } from "@/components/project/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Container, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  toPublicProjectCard,
  type HomepageProject,
} from "@/lib/homepage/discovery";
import type { PublicInvestmentCardSummary } from "@/services/opportunity.service";

interface ProjectDiscoverySectionProps {
  eyebrow: string;
  title: string;
  description: string;
  projects: HomepageProject[];
  summaries: Map<string, PublicInvestmentCardSummary>;
  layout?: "scroll" | "grid";
  showEmpty?: boolean;
  browseHref?: string;
}

export function ProjectDiscoverySection({
  eyebrow,
  title,
  description,
  projects,
  summaries,
  layout = "grid",
  showEmpty = false,
  browseHref = "/projects",
}: ProjectDiscoverySectionProps) {
  if (projects.length === 0) {
    if (!showEmpty) return null;
    return (
      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />
          <div className="mt-10">
            <EmptyState
              icon={Compass}
              title="No opportunities are currently available."
              description="Check back soon, or browse categories to see where ideas on FundIt live."
              action={
                <Button variant="outline" asChild>
                  <Link href="/#categories">Explore categories</Link>
                </Button>
              }
            />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading align="left" eyebrow={eyebrow} title={title} description={description} />

        <div
          className={cn(
            "mt-10",
            layout === "scroll"
              ? "-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4"
              : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className={cn(
                layout === "scroll" &&
                  "w-[min(80vw,20rem)] shrink-0 snap-start sm:w-auto sm:shrink",
              )}
            >
              <ProjectCard project={toPublicProjectCard(project, summaries.get(project.id))} />
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link href={browseHref}>Browse all opportunities</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

export function FeaturedOpportunitiesSection({
  projects,
  summaries,
}: {
  projects: HomepageProject[];
  summaries: Map<string, PublicInvestmentCardSummary>;
}) {
  return (
    <ProjectDiscoverySection
      eyebrow="Recently published"
      title="Ideas worth a closer look"
      description="A few projects people can explore on FundIt right now."
      projects={projects}
      summaries={summaries}
      layout="scroll"
      showEmpty
    />
  );
}

export function WorthALookSection({
  projects,
  summaries,
}: {
  projects: HomepageProject[];
  summaries: Map<string, PublicInvestmentCardSummary>;
}) {
  return (
    <ProjectDiscoverySection
      eyebrow="Recently published"
      title="Worth a look"
      description="More ideas published on FundIt."
      projects={projects}
      summaries={summaries}
      layout="grid"
    />
  );
}
