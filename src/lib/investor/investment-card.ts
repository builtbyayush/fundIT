import type { CurrencyCode } from "@/constants/currency";
import { DEFAULT_CURRENCY, isCurrencyCode } from "@/constants/currency";
import type { PublicInvestmentCardSummary } from "@/services/opportunity.service";
import type { serializeInvestment } from "@/services/investment.service";
import { investmentNeedsPayment } from "@/lib/investor/status-presentation";

export type SerializedInvestorInvestment = ReturnType<typeof serializeInvestment>;

export type InvestorInvestmentCardProject = {
  id: string;
  title: string;
  slug?: string;
  coverImage?: string | null;
  thumbnail?: string | null;
  primaryCategory?: { name: string; slug: string } | null;
};

export type InvestorInvestmentCardData = {
  id: string;
  investmentNumber: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  needsPayment: boolean;
  project: InvestorInvestmentCardProject;
  funding: {
    committedMinor: number;
    targetMinor: number | null;
    currency: CurrencyCode;
  } | null;
};

function asCurrency(value: string | null | undefined): CurrencyCode {
  return value && isCurrencyCode(value) ? value : DEFAULT_CURRENCY;
}

export function toInvestorInvestmentCard(
  investment: SerializedInvestorInvestment,
  summary?: PublicInvestmentCardSummary,
): InvestorInvestmentCardData {
  const project =
    "title" in investment.project
      ? {
          id: investment.project.id,
          title: investment.project.title ?? "Untitled idea",
          slug: investment.project.slug,
          coverImage: investment.project.coverImage ?? null,
          thumbnail: investment.project.thumbnail ?? null,
          primaryCategory: investment.project.primaryCategory,
        }
      : {
          id: investment.project.id,
          title: "Untitled idea",
        };

  return {
    id: investment.id,
    investmentNumber: investment.investmentNumber,
    amountMinor: investment.amountMinor,
    currency: asCurrency(investment.currency),
    status: investment.status,
    paymentStatus: investment.paymentStatus,
    createdAt: new Date(investment.createdAt),
    needsPayment: investmentNeedsPayment(investment.status),
    project,
    funding: summary
      ? {
          committedMinor: summary.committedAmountMinor,
          targetMinor: summary.fundingTargetMinor,
          currency: asCurrency(summary.currency),
        }
      : null,
  };
}

export function investmentsListHref(input: {
  status?: string;
  search?: string;
  page?: number;
}): string {
  const params = new URLSearchParams();
  if (input.status && input.status !== "all") params.set("status", input.status);
  if (input.search) params.set("search", input.search);
  if (input.page && input.page > 1) params.set("page", String(input.page));
  const query = params.toString();
  return query ? `/investor/investments?${query}` : "/investor/investments";
}
