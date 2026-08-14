export const OpportunityStatus = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  PAUSED: "PAUSED",
  CLOSED: "CLOSED",
  CANCELLED: "CANCELLED",
} as const;

export type OpportunityStatus =
  (typeof OpportunityStatus)[keyof typeof OpportunityStatus];

export const OPPORTUNITY_STATUSES = Object.values(OpportunityStatus);

export function isOpportunityStatus(value: unknown): value is OpportunityStatus {
  return (
    typeof value === "string" &&
    OPPORTUNITY_STATUSES.includes(value as OpportunityStatus)
  );
}

export const ALLOWED_OPPORTUNITY_TRANSITIONS: Record<
  OpportunityStatus,
  readonly OpportunityStatus[]
> = {
  [OpportunityStatus.DRAFT]: [OpportunityStatus.OPEN, OpportunityStatus.CANCELLED],
  [OpportunityStatus.OPEN]: [
    OpportunityStatus.PAUSED,
    OpportunityStatus.CLOSED,
    OpportunityStatus.CANCELLED,
  ],
  [OpportunityStatus.PAUSED]: [
    OpportunityStatus.OPEN,
    OpportunityStatus.CLOSED,
    OpportunityStatus.CANCELLED,
  ],
  [OpportunityStatus.CLOSED]: [],
  [OpportunityStatus.CANCELLED]: [],
};

export function canTransitionOpportunityStatus(
  from: OpportunityStatus,
  to: OpportunityStatus,
): boolean {
  return ALLOWED_OPPORTUNITY_TRANSITIONS[from].includes(to);
}

/** Only OPEN opportunities accept new investments. */
export function canAcceptInvestments(status: OpportunityStatus): boolean {
  return status === OpportunityStatus.OPEN;
}
