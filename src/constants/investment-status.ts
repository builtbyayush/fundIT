export const InvestmentStatus = {
  INITIATED: "INITIATED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type InvestmentStatus =
  (typeof InvestmentStatus)[keyof typeof InvestmentStatus];

export const INVESTMENT_STATUSES = Object.values(InvestmentStatus);

export function isInvestmentStatus(value: unknown): value is InvestmentStatus {
  return (
    typeof value === "string" &&
    INVESTMENT_STATUSES.includes(value as InvestmentStatus)
  );
}

export const ALLOWED_INVESTMENT_TRANSITIONS: Record<
  InvestmentStatus,
  readonly InvestmentStatus[]
> = {
  [InvestmentStatus.INITIATED]: [
    InvestmentStatus.PAYMENT_PENDING,
    InvestmentStatus.CANCELLED,
    InvestmentStatus.FAILED,
  ],
  [InvestmentStatus.PAYMENT_PENDING]: [
    InvestmentStatus.PAYMENT_SUCCESS,
    InvestmentStatus.FAILED,
    InvestmentStatus.CANCELLED,
  ],
  [InvestmentStatus.PAYMENT_SUCCESS]: [
    InvestmentStatus.CONFIRMED,
    InvestmentStatus.FAILED,
  ],
  [InvestmentStatus.CONFIRMED]: [InvestmentStatus.REFUNDED],
  [InvestmentStatus.FAILED]: [],
  [InvestmentStatus.CANCELLED]: [],
  [InvestmentStatus.REFUNDED]: [],
};

export function canTransitionInvestmentStatus(
  from: InvestmentStatus,
  to: InvestmentStatus,
): boolean {
  return ALLOWED_INVESTMENT_TRANSITIONS[from].includes(to);
}
