import type { Metadata } from "next";
import Link from "next/link";

import { ProjectCard } from "@/components/project/project-card";
import { Container, SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { siteConfig } from "@/config";
import { connectToDatabase } from "@/lib/db";
import { publicProjectListQuerySchema } from "@/lib/validations/project";
import { listActiveCategories, serializeCategory } from "@/services/category.service";
import { getInvestmentSummariesForProjects } from "@/services/opportunity.service";
import {
  listPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore Opportunities",
  description: `Discover published investment opportunities on ${siteConfig.name}.`,
  openGraph: {
    title: `Explore Opportunities | ${siteConfig.name}`,
    description: `Discover published investment opportunities on ${siteConfig.name}.`,
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

  const buildHref = (page: number) => {
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    if (query.search) sp.set("search", query.search);
    if (query.category) sp.set("category", query.category);
    if (query.sort) sp.set("sort", query.sort);
    return `/projects?${sp.toString()}`;
  };

  return (
    <Container className="py-12 sm:py-16">
      <SectionHeading
        align="left"
        eyebrow="Explore"
        title="Discover investment opportunities"
        description={`Browse curated projects published on ${siteConfig.name}.`}
      />

      <form className="mt-8 grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          name="search"
          placeholder="Search title, description, or tags"
          defaultValue={query.search}
          aria-label="Search opportunities"
        />
        <Select name="category" defaultValue={query.category || ""} aria-label="Filter by category">
          <option value="">All categories</option>
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select name="sort" defaultValue={query.sort} aria-label="Sort opportunities">
          <option value="newest">Newest</option>
          <option value="updated">Recently updated</option>
        </Select>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      <div className="mt-10">
        {projects.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <h3 className="text-lg font-semibold">
              {hasFilters
                ? "No opportunities match your search."
                : "New opportunities are coming soon."}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {hasFilters
                ? "Try another category or search term."
                : "Published opportunities will appear here once administrators make them available."}
            </p>
            {hasFilters ? (
              <Button className="mt-6" variant="outline" asChild>
                <Link href="/projects">Clear filters</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        )}
      </div>

      {result.totalPages > 1 ? (
        <div className="mt-10 flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Page {result.page} of {result.totalPages} · {result.total} total
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page - 1)}>Previous</Link>
              </Button>
            ) : null}
            {result.page < result.totalPages ? (
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(result.page + 1)}>Next</Link>
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
