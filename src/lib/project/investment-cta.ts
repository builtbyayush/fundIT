import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { OpportunityStatus } from "@/constants/opportunity-status";
import type { SessionUser } from "@/types";

export type InvestmentCtaState =
  | { kind: "link"; href: string; label: "Back this idea" }
  | { kind: "disabled"; label: string };

export function investCallbackPath(slug: string): string {
  return `/projects/${slug}/invest`;
}

export function getInvestmentCtaState(input: {
  investable: boolean;
  status: string | null;
  slug: string;
  user: SessionUser | null;
}): InvestmentCtaState {
  const investPath = investCallbackPath(input.slug);

  if (input.investable) {
    if (!input.user) {
      return {
        kind: "link",
        href: `/login?callbackUrl=${encodeURIComponent(investPath)}`,
        label: "Back this idea",
      };
    }
    if (input.user.role !== UserRole.INVESTOR) {
      return { kind: "disabled", label: "Investor account required" };
    }
    if (input.user.status !== UserStatus.ACTIVE) {
      return { kind: "disabled", label: "Account not active" };
    }
    return { kind: "link", href: investPath, label: "Back this idea" };
  }

  if (input.status === OpportunityStatus.CLOSED) {
    return { kind: "disabled", label: "Opportunity closed" };
  }

  return { kind: "disabled", label: "Not open for participation" };
}
