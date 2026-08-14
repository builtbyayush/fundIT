import Link from "next/link";

import { FundingProgressBar } from "@/components/project/funding-progress";
import { ProjectImage } from "@/components/project/project-image";
import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CurrencyCode } from "@/constants/currency";
import { DEFAULT_CURRENCY } from "@/constants/currency";
import {
  categoryDisplayLabels,
  formatProjectLocation,
  resolveProjectCardImage,
  type DisplayCategory,
} from "@/lib/project/display";

export interface PublicProjectCardCategory extends DisplayCategory {
  slug: string;
}

export interface PublicProjectCardData {
  title: string;
  slug: string;
  shortDescription: string;
  thumbnail?: string | null;
  coverImage?: string | null;
  tags: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  } | null;
  categories?: PublicProjectCardCategory[];
  primaryCategory?: PublicProjectCardCategory | null;
  investment?: {
    investable: boolean;
    opportunityStatus: string | null;
    currency: string | null;
    committedAmountMinor: number;
    fundingTargetMinor: number | null;
  } | null;
}

function orderedCategories(project: PublicProjectCardData): DisplayCategory[] {
  if (project.categories?.length) {
    return project.categories;
  }
  return project.primaryCategory ? [project.primaryCategory] : [];
}

export function ProjectCard({ project }: { project: PublicProjectCardData }) {
  const location = formatProjectLocation(project.location);
  const investment = project.investment;
  const currency = (investment?.currency as CurrencyCode | null) ?? DEFAULT_CURRENCY;
  const categories = orderedCategories(project);
  const { labels, more } = categoryDisplayLabels(categories);
  const imageSrc = resolveProjectCardImage(project.thumbnail, project.coverImage);

  const ctaLabel = investment?.investable ? "Invest now" : "View opportunity";
  const ctaHref = investment?.investable
    ? `/projects/${project.slug}/invest`
    : `/projects/${project.slug}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={`/projects/${project.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-muted"
      >
        {imageSrc ? (
          <ProjectImage
            src={imageSrc}
            alt={`${project.title} preview`}
            title={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            compactPlaceholder
          />
        ) : (
          <ProjectMediaPlaceholder title={project.title} compact />
        )}
      </Link>

      <CardHeader className="space-y-3 pb-3">
        {categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {labels.map((label, index) => (
              <Badge key={`${label}-${index}`} variant={index === 0 ? "secondary" : "outline"}>
                {label}
              </Badge>
            ))}
            {more > 0 ? <Badge variant="outline">+{more} more</Badge> : null}
          </div>
        ) : null}

        <div className="space-y-2">
          <CardTitle className="text-xl leading-snug">
            <Link href={`/projects/${project.slug}`} className="hover:text-primary">
              {project.title}
            </Link>
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {project.shortDescription}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 pb-4">
        {investment && investment.fundingTargetMinor ? (
          <FundingProgressBar
            committedMinor={investment.committedAmountMinor}
            targetMinor={investment.fundingTargetMinor}
            currency={currency}
          />
        ) : investment?.committedAmountMinor ? (
          <FundingProgressBar
            committedMinor={investment.committedAmountMinor}
            targetMinor={null}
            currency={currency}
          />
        ) : null}

        {location ? <p className="text-sm text-muted-foreground">{location}</p> : null}
      </CardContent>

      <CardFooter className="pt-0">
        <Button className="w-full" variant={investment?.investable ? "default" : "secondary"} asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
