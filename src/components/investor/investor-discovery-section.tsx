import { ProjectCard, type PublicProjectCardData } from "@/components/project/project-card";

export function InvestorDiscoverySection({
  projects,
}: {
  projects: PublicProjectCardData[];
}) {
  if (projects.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="font-display text-2xl text-foreground">
          Find something else worth backing.
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          More published ideas on FundIt. These are newest first — not personalized picks.
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} variant="catalog" />
        ))}
      </div>
    </section>
  );
}
