import { InvestmentStatus } from "@/constants/investment-status";
import { investmentStatusLabel } from "@/lib/status-labels";

export type InvestorStatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export type InvestorStatusIcon = "check" | "clock" | "alert" | "cancel" | "info";

export type InvestorBadgeVariant =
  | "pastelMint"
  | "pastelYellow"
  | "pastelPink"
  | "pastelBlue"
  | "pastelLavender"
  | "outline";

export type InvestorStatusPresentation = {
  label: string;
  tone: InvestorStatusTone;
  badgeVariant: InvestorBadgeVariant;
  icon: InvestorStatusIcon;
};

const PRESENTATION: Record<InvestmentStatus, InvestorStatusPresentation> = {
  [InvestmentStatus.CONFIRMED]: {
    label: "Confirmed",
    tone: "success",
    badgeVariant: "pastelMint",
    icon: "check",
  },
  [InvestmentStatus.INITIATED]: {
    label: "Payment pending",
    tone: "warning",
    badgeVariant: "pastelYellow",
    icon: "clock",
  },
  [InvestmentStatus.PAYMENT_PENDING]: {
    label: "Payment pending",
    tone: "warning",
    badgeVariant: "pastelYellow",
    icon: "clock",
  },
  [InvestmentStatus.PAYMENT_SUCCESS]: {
    label: "Payment received",
    tone: "info",
    badgeVariant: "pastelBlue",
    icon: "info",
  },
  [InvestmentStatus.FAILED]: {
    label: "Payment failed",
    tone: "danger",
    badgeVariant: "pastelPink",
    icon: "alert",
  },
  [InvestmentStatus.CANCELLED]: {
    label: "Cancelled",
    tone: "neutral",
    badgeVariant: "pastelLavender",
    icon: "cancel",
  },
  [InvestmentStatus.REFUNDED]: {
    label: "Refunded",
    tone: "info",
    badgeVariant: "pastelBlue",
    icon: "info",
  },
};

export function getInvestmentStatusPresentation(
  status: string,
): InvestorStatusPresentation {
  if (status in PRESENTATION) {
    return PRESENTATION[status as InvestmentStatus];
  }
  return {
    label: investmentStatusLabel(status),
    tone: "neutral",
    badgeVariant: "outline",
    icon: "info",
  };
}

export function investmentNeedsPayment(status: string): boolean {
  return (
    status === InvestmentStatus.INITIATED ||
    status === InvestmentStatus.PAYMENT_PENDING
  );
}

export function isConfirmedInvestment(status: string): boolean {
  return status === InvestmentStatus.CONFIRMED;
}

export function isFailedInvestment(status: string): boolean {
  return status === InvestmentStatus.FAILED;
}
