import Link from "next/link";

import { InvestmentStatusBadge } from "@/components/investor/investment-status-badge";
import { ProjectImage } from "@/components/project/project-image";
import { ProjectMediaPlaceholder } from "@/components/project/project-media-placeholder";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import {
  PASTEL_BADGE_VARIANT,
  pastelForCategorySlug,
} from "@/lib/project/category-pastel";
import { resolveProjectImage } from "@/lib/project/display";
import type { CurrencyCode } from "@/constants/currency";

export function InvestmentDetailHero({
  title,
  slug,
  coverImage,
  thumbnail,
  category,
  amountMinor,
  currency,
  status,
}: {
  title: string;
  slug?: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  category?: { name: string; slug: string } | null;
  amountMinor: number;
  currency: CurrencyCode;
  status: string;
}) {
  const imageSrc = resolveProjectImage(thumbnail, coverImage);

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elevated">
      <div className="relative aspect-[16/10] bg-pastel-blue/60 sm:aspect-[21/9]">
        {imageSrc ? (
          <ProjectImage
            src={imageSrc}
            alt={`${title} cover`}
            title={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 960px"
            className="object-cover"
          />
        ) : (
          <ProjectMediaPlaceholder title={title} />
        )}
      </div>
      <div className="space-y-4 p-6 sm:p-8">
        {category ? (
          <Badge
            variant={
              category.slug
                ? PASTEL_BADGE_VARIANT[pastelForCategorySlug(category.slug)]
                : "pastelMint"
            }
          >
            {category.name}
          </Badge>
        ) : null}
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">
            {slug ? (
              <Link href={`/projects/${slug}`} className="hover:text-primary">
                {title}
              </Link>
            ) : (
              title
            )}
          </h1>
          <p className="font-display text-2xl text-foreground">
            {formatMoney({ amountMinor, currency })}{" "}
            <span className="text-base font-medium text-muted-foreground">backed</span>
          </p>
        </div>
        <InvestmentStatusBadge status={status} />
      </div>
    </div>
  );
}
