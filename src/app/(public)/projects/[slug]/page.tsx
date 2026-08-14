import type { Metadata } from "next";
import Link from "next/link";
import { Check, ExternalLink, MapPin } from "lucide-react";
import { notFound } from "next/navigation";

import {
  InvestmentCta,
  InvestmentOpportunityPanel,
} from "@/components/project/investment-opportunity-panel";
import { ProjectImage } from "@/components/project/project-image";
import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
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
import { siteConfig } from "@/config";
import { formatProjectLocation, resolveProjectImage } from "@/lib/project/display";
import { connectToDatabase } from "@/lib/db";
import type { SessionUser } from "@/types";
import {
  getPublishedProjectBySlug,
  serializePublicProject,
} from "@/services/project.service";
import {
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
    const image = resolveProjectImage(data.thumbnail, data.coverImage);
    return {
      title: data.title,
      description: data.shortDescription,
      openGraph: {
        title: data.title,
        description: data.shortDescription,
        siteName: siteConfig.name,
        type: "website",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.shortDescription,
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
  const heroImage = resolveProjectImage(project.thumbnail, project.coverImage);
  const opportunityDoc = await getOpportunityByProjectId(project.id);
  const opportunity = serializePublicOpportunityDetail(opportunityDoc);

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
      }
    : null;

  const galleryImages = project.gallery.filter(
    (url) => url && url !== heroImage,
  );

  return (
    <div>
      <section className="border-b bg-muted/20">
        <Container className="py-8 sm:py-10 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-10">
            <div className="space-y-6">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border bg-muted shadow-sm">
                {heroImage ? (
                  <ProjectImage
                    src={heroImage}
                    alt={`${project.title} hero`}
                    title={project.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                ) : (
                  <ProjectMediaPlaceholder title={project.title} />
                )}
              </div>

              <div className="space-y-4 lg:pr-4">
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

                <div className="space-y-3">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                    {project.title}
                  </h1>
                  <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {location}
                    </span>
                  ) : null}
                  {project.website ? (
                    <a
                      href={project.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                    >
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>

                {project.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <InvestmentOpportunityPanel
              slug={project.slug}
              opportunity={opportunityPanelData}
              user={user}
              className="lg:sticky lg:top-6 shadow-sm"
            />
          </div>
        </Container>
      </section>

      <Container className="py-10 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="border-b pb-3 text-2xl font-semibold tracking-tight">
                About this opportunity
              </h2>
              <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-7 text-muted-foreground">
                {project.description}
              </p>
            </section>

            {project.highlights.length > 0 ? (
              <section>
                <h2 className="border-b pb-3 text-2xl font-semibold tracking-tight">
                  Highlights
                </h2>
                <ul className="mt-6 space-y-3">
                  {project.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <Check
                        className="mt-0.5 h-5 w-5 shrink-0 text-secondary"
                        aria-hidden="true"
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {galleryImages.length > 0 ? (
              <section>
                <h2 className="border-b pb-3 text-2xl font-semibold tracking-tight">
                  Project gallery
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {galleryImages.map((url, index) => (
                    <div
                      key={url}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted"
                    >
                      <ProjectImage
                        src={url}
                        alt={`${project.title} gallery image ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {project.video ? (
              <section>
                <h2 className="border-b pb-3 text-2xl font-semibold tracking-tight">
                  Video
                </h2>
                <p className="mt-6 text-sm">
                  <a
                    href={project.video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                  >
                    Watch project video
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </p>
              </section>
            ) : null}

            {opportunity?.investable ? (
              <section className="rounded-xl border bg-card p-6 lg:hidden">
                <h2 className="text-lg font-semibold">Ready to invest?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review terms and choose an amount on the next step.
                </p>
                <div className="mt-4">
                  <InvestmentCta slug={project.slug} investable user={user} />
                </div>
              </section>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-base">Browse more</CardTitle>
                <CardDescription>
                  Explore other published opportunities on {siteConfig.name}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/projects">Back to explore</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </Container>
    </div>
  );
}
