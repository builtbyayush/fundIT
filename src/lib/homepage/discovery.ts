import type { PublicProjectCardData } from "@/components/project/project-card";
import { categories as seedCategories } from "@/constants/categories";
import { CurrencyCode, isCurrencyCode } from "@/constants/currency";
import { OpportunityStatus } from "@/constants/opportunity-status";
import { connectToDatabase } from "@/lib/db";
import { InvestmentOpportunity } from "@/models/InvestmentOpportunity";
import {
  listActiveCategories,
  serializeCategory,
} from "@/services/category.service";
import {
  getInvestmentSummariesForProjects,
  isOpportunityCurrentlyInvestable,
  type PublicInvestmentCardSummary,
} from "@/services/opportunity.service";
import {
  listPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";

export type HomepageCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
};

export type HomepageProject = ReturnType<typeof serializePublicProject>;

export type HomepageMinimum = {
  amountMinor: number;
  currency: CurrencyCode;
};

export type HomepageDiscoveryData = {
  projects: HomepageProject[];
  showcase: HomepageProject[];
  worthALook: HomepageProject[];
  summaries: Map<string, PublicInvestmentCardSummary>;
  categories: HomepageCategory[];
  lowestMinimum: HomepageMinimum | null;
};

const SHOWCASE_COUNT = 4;

function seedCategoryFallback(): HomepageCategory[] {
  return seedCategories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon,
  }));
}

async function getLowestInvestableMinimum(): Promise<HomepageMinimum | null> {
  const opportunities = await InvestmentOpportunity.find({
    status: OpportunityStatus.OPEN,
  });

  let lowest: HomepageMinimum | null = null;

  for (const opportunity of opportunities) {
    if (!isOpportunityCurrentlyInvestable(opportunity)) continue;
    const minimum = opportunity.minimumInvestment;
    if (!minimum || minimum.amountMinor < 1) continue;
    const currency = isCurrencyCode(minimum.currency)
      ? minimum.currency
      : CurrencyCode.INR;
    if (!lowest || minimum.amountMinor < lowest.amountMinor) {
      lowest = { amountMinor: minimum.amountMinor, currency };
    }
  }

  return lowest;
}

/**
 * Read-only homepage payload. Never invents projects, categories, or minimums.
 */
export async function getHomepageDiscoveryData(): Promise<HomepageDiscoveryData> {
  const empty: HomepageDiscoveryData = {
    projects: [],
    showcase: [],
    worthALook: [],
    summaries: new Map(),
    categories: seedCategoryFallback(),
    lowestMinimum: null,
  };

  try {
    await connectToDatabase();

    const [result, dbCategories, lowestMinimum] = await Promise.all([
      listPublishedProjects({
        page: 1,
        limit: 8,
        search: "",
        category: "",
        sort: "newest",
      }),
      listActiveCategories(),
      getLowestInvestableMinimum(),
    ]);

    const projects = result.items.map(serializePublicProject);
    const summaries = await getInvestmentSummariesForProjects(projects.map((p) => p.id));
    const categories =
      dbCategories.length > 0
        ? dbCategories.map(serializeCategory).map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
          }))
        : seedCategoryFallback();

    return {
      projects,
      showcase: projects.slice(0, SHOWCASE_COUNT),
      worthALook: projects.length > SHOWCASE_COUNT ? projects.slice(SHOWCASE_COUNT) : [],
      summaries,
      categories,
      lowestMinimum,
    };
  } catch {
    return empty;
  }
}

export function toPublicProjectCard(
  project: HomepageProject,
  summary?: PublicInvestmentCardSummary,
): PublicProjectCardData {
  return {
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
          minimumInvestmentMinor: summary.minimumInvestmentMinor,
        }
      : null,
  };
}
