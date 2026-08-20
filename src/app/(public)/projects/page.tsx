import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Search } from "lucide-react";

import { ProjectCard } from "@/components/project/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Container } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { siteConfig } from "@/config";
import { connectToDatabase } from "@/lib/db";
import { toPublicProjectCard } from "@/lib/homepage/discovery";
import { exploreHref, type ExploreSort } from "@/lib/project/explore-href";
import { cn } from "@/lib/utils";
import { publicProjectListQuerySchema } from "@/lib/validations/project";
import { listActiveCategories, serializeCategory } from "@/services/category.service";
import { getInvestmentSummariesForProjects } from "@/services/opportunity.service";
import {
  listPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";

export const dynamic = "force-dynamic";

const EXPLORE_DESCRIPTION =
  "Discover things worth backing. From technology and healthcare to products, nutrition and more.";

export const metadata: Metadata = {
  title: "Explore ideas",
  description: EXPLORE_DESCRIPTION,
  openGraph: {
    title: `Explore ideas | ${siteConfig.name}`,
    description: EXPLORE_DESCRIPTION,
    siteName: siteConfig.name,
  },
};

interface ProjectsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const query = publicProjectListQuerySchema.parse({
    page: params.page ?? 1,
    limit: params.limit ?? 12,
    search: typeof params.search === "string" ? params.search : "",
    category: typeof params.category === "string" ? params.category : "",
    sort: typeof params.sort === "string" ? params.sort : "newest",
  });

  await connectToDatabase();
  const [result, categories] = await Promise.all([
    listPublishedProjects(query),
    listActiveCategories(),
  ]);

  const projects = result.items.map((item) => serializePublicProject(item));
  const summaries = await getInvestmentSummariesForProjects(projects.map((p) => p.id));
  const categoryOptions = categories.map(serializeCategory);
  const hasFilters = Boolean(query.search || query.category);
  const sort = query.sort as ExploreSort;

  const filters = {
    search: query.search || undefined,
    category: query.category || undefined,
    sort,
  };

  return (
    <Container className="py-10 sm:py-14">
      <header className="max-w-2xl space-y-4">
        <h1 className="font-display text-4xl text-foreground sm:text-5xl">Explore ideas</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">{EXPLORE_DESCRIPTION}</p>
      </header>

      <form action="/projects" method="get" className="relative mt-8 max-w-xl">
        {query.category ? <input type="hidden" name="category" value={query.category} /> : null}
        {sort !== "newest" ? <input type="hidden" name="sort" value={sort} /> : null}
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          name="search"
          placeholder="Search projects..."
          defaultValue={query.search}
          aria-label="Search projects"
          className="h-12 min-h-12 rounded-xl pl-10"
        />
      </form>

      <nav
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        aria-label="Filter by category"
      >
        <CategoryChip href={exploreHref({ search: filters.search, sort })} active={!query.category}>
          All
        </CategoryChip>
        {categoryOptions.map((category) => (
          <CategoryChip
            key={category.id}
            href={exploreHref({
              search: filters.search,
              category: category.slug,
              sort,
            })}
            active={query.category === category.slug}
          >
            {category.name}
          </CategoryChip>
        ))}
      </nav>

      <div className="mt-10 flex flex-col gap-4 border-t border-border/60 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-xl text-foreground">
          {result.total} {result.total === 1 ? "idea" : "ideas"} to explore
        </p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sort ideas">
          <SortPill
            href={exploreHref({ search: filters.search, category: filters.category, sort: "newest" })}
            active={sort === "newest"}
          >
            Newest
          </SortPill>
          <SortPill
            href={exploreHref({
              search: filters.search,
              category: filters.category,
              sort: "updated",
            })}
            active={sort === "updated"}
          >
            Recently updated
          </SortPill>
        </div>
      </div>

      <div className="mt-8">
        {projects.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={
              hasFilters ? "No ideas match your search." : "New ideas are coming soon."
            }
            description={
              hasFilters
                ? "Try another category or search term to find something to back."
                : "Published projects will appear here once they are available to explore."
            }
            action={
              hasFilters ? (
                <Button variant="outline" asChild>
                  <Link href="/projects">Clear filters</Link>
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                variant="catalog"
                project={toPublicProjectCard(project, summaries.get(project.id))}
              />
            ))}
          </div>
        )}
      </div>

      {result.totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={exploreHref({ ...filters, page: result.page - 1 })}>Previous</Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={exploreHref({ ...filters, page: result.page + 1 })}>Next</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Container>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-medium motion-safe-transition",
        active
          ? "bg-primary text-primary-foreground shadow-soft"
          : "bg-pastel-lavender/70 text-pastel-lavender-foreground hover:bg-pastel-lavender",
      )}
    >
      {children}
    </Link>
  );
}

function SortPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium motion-safe-transition",
        active
          ? "bg-foreground text-background"
          : "border border-border bg-surface-elevated text-foreground hover:bg-pastel-lavender/60",
      )}
    >
      {children}
    </Link>
  );
}
