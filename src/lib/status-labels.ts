import {
  InvestmentStatus,
  type InvestmentStatus as InvestmentStatusType,
} from "@/constants/investment-status";
import {
  PaymentStatus,
  type PaymentStatus as PaymentStatusType,
} from "@/constants/payment-status";
import {
  OpportunityStatus,
  type OpportunityStatus as OpportunityStatusType,
} from "@/constants/opportunity-status";

const INVESTMENT_STATUS_LABELS: Record<InvestmentStatusType, string> = {
  [InvestmentStatus.INITIATED]: "Initiated",
  [InvestmentStatus.PAYMENT_PENDING]: "Payment pending",
  [InvestmentStatus.PAYMENT_SUCCESS]: "Payment received",
  [InvestmentStatus.CONFIRMED]: "Confirmed",
  [InvestmentStatus.FAILED]: "Failed",
  [InvestmentStatus.CANCELLED]: "Cancelled",
  [InvestmentStatus.REFUNDED]: "Refunded",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatusType, string> = {
  [PaymentStatus.NOT_STARTED]: "Not started",
  [PaymentStatus.CREATED]: "Created",
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.SUCCESS]: "Successful",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.CANCELLED]: "Cancelled",
  [PaymentStatus.REFUNDED]: "Refunded",
};

const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatusType, string> = {
  [OpportunityStatus.DRAFT]: "Draft",
  [OpportunityStatus.OPEN]: "Open",
  [OpportunityStatus.PAUSED]: "Paused",
  [OpportunityStatus.CLOSED]: "Closed",
  [OpportunityStatus.CANCELLED]: "Cancelled",
};

export function investmentStatusLabel(status: string): string {
  return INVESTMENT_STATUS_LABELS[status as InvestmentStatusType] ?? status;
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status as PaymentStatusType] ?? status;
}

export function opportunityStatusLabel(status: string): string {
  return OPPORTUNITY_STATUS_LABELS[status as OpportunityStatusType] ?? status;
}
