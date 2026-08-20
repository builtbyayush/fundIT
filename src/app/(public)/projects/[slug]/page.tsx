import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import {
  InvestmentCta,
  InvestmentOpportunityPanel,
  StickyInvestBar,
} from "@/components/project/investment-opportunity-panel";
import { ProjectCard } from "@/components/project/project-card";
import { ProjectMediaGallery } from "@/components/project/project-media-gallery";
import { Container } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/auth";
import { siteConfig } from "@/config";
import { toPublicProjectCard } from "@/lib/homepage/discovery";
import {
  PASTEL_BADGE_VARIANT,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import { formatProjectLocation } from "@/lib/project/display";
import { buildProjectMediaItems } from "@/lib/project/media";
import { connectToDatabase } from "@/lib/db";
import { opportunityStatusLabel } from "@/lib/status-labels";
import type { SessionUser } from "@/types";
import {
  getPublishedProjectBySlug,
  listRelatedPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";
import {
  getInvestmentSummariesForProjects,
  getOpportunityByProjectId,
  serializePublicOpportunityDetail,
} from "@/services/opportunity.service";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectToDatabase();
    const project = await getPublishedProjectBySlug(slug);
    if (!project) {
      return { title: "Opportunity not found" };
    }
    const data = serializePublicProject(project);
    const image = data.coverImage || data.thumbnail || null;
    const description = data.primaryCategory?.name
      ? `${data.shortDescription} · ${data.primaryCategory.name}`
      : data.shortDescription;
    return {
      title: data.title,
      description,
      openGraph: {
        title: data.title,
        description,
        siteName: siteConfig.name,
        type: "website",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return { title: siteConfig.name };
  }
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const session = await auth();
  const user: SessionUser | null =
    session?.user?.id && session.user.email && session.user.role && session.user.status
      ? {
          id: session.user.id,
          name: session.user.name ?? "",
          email: session.user.email,
          role: session.user.role,
          status: session.user.status,
          avatar: session.user.avatar ?? null,
        }
      : null;
  await connectToDatabase();
  const doc = await getPublishedProjectBySlug(slug);
  if (!doc) {
    notFound();
  }

  const project = serializePublicProject(doc);
  const location = formatProjectLocation(project.location);
  const opportunityDoc = await getOpportunityByProjectId(project.id);
  const opportunity = serializePublicOpportunityDetail(opportunityDoc);
  const mediaItems = buildProjectMediaItems({
    title: project.title,
    coverImage: project.coverImage,
    thumbnail: project.thumbnail,
    gallery: project.gallery,
    video: project.video,
  });

  const relatedDocs = await listRelatedPublishedProjects({
    excludeId: project.id,
    categoryIds: project.categories.map((category) => category.id).filter(Boolean),
    limit: 4,
  });
  const relatedProjects = relatedDocs.map(serializePublicProject);
  const relatedSummaries = await getInvestmentSummariesForProjects(
    relatedProjects.map((item) => item.id),
  );

  const opportunityPanelData = opportunity
    ? {
        investable: opportunity.investable,
        status: opportunity.status,
        currency: opportunity.currency,
        committedAmountMinor: opportunity.committedAmountMinor,
        fundingTargetMinor: opportunity.fundingTarget?.amountMinor ?? null,
        minimumInvestment: opportunity.minimumInvestment,
        maximumInvestment: opportunity.maximumInvestment,
        startDate: opportunity.startDate,
        endDate: opportunity.endDate,
        termsVersion: opportunity.termsVersion,
      }
    : null;

  const showStickyCta = Boolean(opportunity?.investable);
  const hasDetails =
    Boolean(location) ||
    project.categories.length > 0 ||
    Boolean(project.website) ||
    Boolean(opportunity);

  return (
    <div className={showStickyCta ? "pb-24 lg:pb-0" : undefined}>
      <section className="border-b bg-muted/20">
        <Container className="py-8 sm:py-10 lg:py-12">
          <Link
            href="/projects"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Explore ideas
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-10">
            <div className="space-y-5">
              {project.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.categories.map((category, index) => (
                    <Badge
                      key={category.id || category.slug}
                      variant={
                        index === 0 && category.slug
                          ? PASTEL_BADGE_VARIANT[pastelForCategorySlug(category.slug)]
                          : "outline"
                      }
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              ) : null}

              <div className="space-y-3">
                <h1 className="font-display text-3xl text-foreground sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  {project.title}
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {project.shortDescription}
                </p>
              </div>

              {location ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {location}
                </p>
              ) : null}

              {opportunity?.investable ? (
                <div className="max-w-xs">
                  <InvestmentCta
                    slug={project.slug}
                    investable
                    status={opportunity.status}
                    user={user}
                  />
                </div>
              ) : null}
            </div>

            <ProjectMediaGallery title={project.title} items={mediaItems} />
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-12">
          <div className="min-w-0 space-y-10">
            {project.description.trim() ? (
              <section>
                <h2 className="font-display text-2xl text-foreground">About</h2>
                <p className="mt-4 max-w-prose whitespace-pre-wrap text-base leading-7 text-muted-foreground">
                  {project.description}
                </p>
              </section>
            ) : null}

            {project.highlights.length > 0 ? (
              <section>
                <h2 className="font-display text-2xl text-foreground">Highlights</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {project.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-border/60 bg-pastel-mint/70 p-4 text-sm text-pastel-mint-foreground"
                    >
                      <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {hasDetails ? (
              <section>
                <h2 className="font-display text-2xl text-foreground">Details</h2>
                <dl className="mt-4 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card text-sm">
                  {location ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Location</dt>
                      <dd className="text-right font-medium">{location}</dd>
                    </div>
                  ) : null}
                  {project.categories.length > 0 ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Categories</dt>
                      <dd className="text-right font-medium">
                        {project.categories.map((category) => category.name).join(", ")}
                      </dd>
                    </div>
                  ) : null}
                  {project.website ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Website</dt>
                      <dd className="text-right">
                        <a
                          href={project.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                        >
                          Visit
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {opportunity ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Opportunity</dt>
                      <dd className="text-right font-medium">
                        {opportunityStatusLabel(opportunity.status)}
                      </dd>
                    </div>
                  ) : null}
                  {opportunity?.startDate ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Starts</dt>
                      <dd className="text-right font-medium">
                        {new Date(opportunity.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                  ) : null}
                  {opportunity?.endDate ? (
                    <div className="flex justify-between gap-4 px-4 py-3">
                      <dt className="text-muted-foreground">Ends</dt>
                      <dd className="text-right font-medium">
                        {new Date(opportunity.endDate).toLocaleDateString()}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            <p className="max-w-prose text-sm text-muted-foreground">
              Take a moment to review the details and any available terms before you
              participate.
            </p>
          </div>

          <InvestmentOpportunityPanel
            slug={project.slug}
            opportunity={opportunityPanelData}
            user={user}
            className="lg:sticky lg:top-24"
          />
        </div>

        {relatedProjects.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-foreground">Related ideas</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {relatedProjects.map((item) => (
                <ProjectCard
                  key={item.id}
                  variant="catalog"
                  project={toPublicProjectCard(item, relatedSummaries.get(item.id))}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      {showStickyCta ? (
        <StickyInvestBar slug={project.slug} user={user} />
      ) : null}
    </div>
  );
}
