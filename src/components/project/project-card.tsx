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
import { formatMoneyCompact } from "@/lib/money";
import {
  PASTEL_BADGE_VARIANT,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import {
  categoryDisplayLabels,
  formatProjectLocation,
  resolveProjectCardImage,
  type DisplayCategory,
} from "@/lib/project/display";
import { cn } from "@/lib/utils";

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
    minimumInvestmentMinor?: number | null;
  } | null;
}

function orderedCategories(project: PublicProjectCardData): DisplayCategory[] {
  if (project.categories?.length) {
    return project.categories;
  }
  return project.primaryCategory ? [project.primaryCategory] : [];
}

export function ProjectCard({
  project,
  variant = "default",
}: {
  project: PublicProjectCardData;
  variant?: "default" | "catalog";
}) {
  const isCatalog = variant === "catalog";
  const location = formatProjectLocation(project.location);
  const investment = project.investment;
  const currency = (investment?.currency as CurrencyCode | null) ?? DEFAULT_CURRENCY;
  const categories = orderedCategories(project);
  const { labels, more } = categoryDisplayLabels(categories);
  const imageSrc = resolveProjectCardImage(project.thumbnail, project.coverImage);
  const primary = project.primaryCategory ?? (project.categories?.[0] ?? null);
  const primarySlug = primary?.slug;
  const primaryBadgeVariant = primarySlug
    ? PASTEL_BADGE_VARIANT[pastelForCategorySlug(primarySlug)]
    : "pastelMint";

  const ctaLabel = isCatalog
    ? "View"
    : investment?.investable
      ? "Invest now"
      : "View opportunity";
  const ctaHref = isCatalog
    ? `/projects/${project.slug}`
    : investment?.investable
      ? `/projects/${project.slug}/invest`
      : `/projects/${project.slug}`;

  return (
    <Card variant="interactive" className="group flex h-full flex-col overflow-hidden">
      <Link
        href={`/projects/${project.slug}`}
        className={cn(
          "relative block overflow-hidden bg-pastel-blue/60",
          isCatalog ? "aspect-[4/3]" : "aspect-[16/10]",
        )}
      >
        {imageSrc ? (
          <ProjectImage
            src={imageSrc}
            alt={`${project.title} preview`}
            title={project.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            compactPlaceholder
            className="motion-safe-transition group-hover:scale-105"
          />
        ) : (
          <ProjectMediaPlaceholder title={project.title} compact />
        )}
      </Link>

      <CardHeader className="space-y-3 pb-3">
        {isCatalog && primary ? (
          <Badge variant={primaryBadgeVariant}>{primary.name}</Badge>
        ) : categories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {labels.map((label, index) => (
              <Badge key={`${label}-${index}`} variant={index === 0 ? "pastelMint" : "outline"}>
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
            compact={isCatalog}
          />
        ) : !isCatalog && investment?.committedAmountMinor ? (
          <FundingProgressBar
            committedMinor={investment.committedAmountMinor}
            targetMinor={null}
            currency={currency}
          />
        ) : null}

        {investment?.minimumInvestmentMinor ? (
          <p className="text-sm">
            <span className="text-muted-foreground">{isCatalog ? "Starts " : "Starts at "}</span>
            <span className="font-semibold text-foreground">
              {formatMoneyCompact({
                amountMinor: investment.minimumInvestmentMinor,
                currency,
              })}
            </span>
          </p>
        ) : null}

        {!isCatalog && location ? (
          <p className="text-sm text-muted-foreground">{location}</p>
        ) : null}
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          variant={isCatalog || !investment?.investable ? "secondary" : "default"}
          asChild
        >
          <Link href={ctaHref}>
            {ctaLabel}
            {isCatalog ? <span aria-hidden="true"> →</span> : null}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
