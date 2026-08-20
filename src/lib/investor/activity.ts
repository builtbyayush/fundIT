import { formatMoney } from "@/lib/money";
import {
  getInvestmentStatusPresentation,
  isConfirmedInvestment,
  isFailedInvestment,
  investmentNeedsPayment,
} from "@/lib/investor/status-presentation";
import type { CurrencyCode } from "@/constants/currency";

export type InvestorActivitySource = {
  id: string;
  amountMinor: number;
  currency: CurrencyCode | string;
  status: string;
  createdAt: Date | string;
  confirmedAt?: Date | string | null;
  failedAt?: Date | string | null;
  project: { id: string; title?: string; slug?: string };
};

export type InvestorActivityItem = {
  id: string;
  text: string;
  href: string;
  at: Date;
};

function projectTitle(project: InvestorActivitySource["project"]): string {
  return project.title?.trim() || "this idea";
}

export function investorActivityItems(
  investments: InvestorActivitySource[],
  limit = 5,
): InvestorActivityItem[] {
  return investments.slice(0, limit).map((investment) => {
    const title = projectTitle(investment.project);
    const amount = formatMoney({
      amountMinor: investment.amountMinor,
      currency: investment.currency as CurrencyCode,
    });

    let text: string;
    if (isConfirmedInvestment(investment.status)) {
      text = `Backed ${title} — ${amount}`;
    } else if (investmentNeedsPayment(investment.status)) {
      text = `Payment pending for ${title}`;
    } else if (isFailedInvestment(investment.status)) {
      text = `Payment didn’t go through for ${title}`;
    } else {
      text = `${getInvestmentStatusPresentation(investment.status).label} · ${title}`;
    }

    const at = investment.confirmedAt || investment.failedAt || investment.createdAt;

    return {
      id: investment.id,
      text,
      href: `/investor/investments/${investment.id}`,
      at: new Date(at),
    };
  });
}
