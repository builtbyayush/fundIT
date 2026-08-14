import { describe, expect, it } from "vitest";

import {
  canAcceptInvestments,
  canTransitionOpportunityStatus,
  OpportunityStatus,
} from "@/constants/opportunity-status";
import {
  canTransitionInvestmentStatus,
  InvestmentStatus,
} from "@/constants/investment-status";

describe("opportunity status transitions", () => {
  it("allows draft to open/cancelled", () => {
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.DRAFT, OpportunityStatus.OPEN),
    ).toBe(true);
    expect(
      canTransitionOpportunityStatus(
        OpportunityStatus.DRAFT,
        OpportunityStatus.CANCELLED,
      ),
    ).toBe(true);
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.DRAFT, OpportunityStatus.PAUSED),
    ).toBe(false);
  });

  it("allows open to paused/closed/cancelled", () => {
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.OPEN, OpportunityStatus.PAUSED),
    ).toBe(true);
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.OPEN, OpportunityStatus.CLOSED),
    ).toBe(true);
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.OPEN, OpportunityStatus.DRAFT),
    ).toBe(false);
  });

  it("treats closed and cancelled as terminal", () => {
    expect(
      canTransitionOpportunityStatus(OpportunityStatus.CLOSED, OpportunityStatus.OPEN),
    ).toBe(false);
    expect(
      canTransitionOpportunityStatus(
        OpportunityStatus.CANCELLED,
        OpportunityStatus.OPEN,
      ),
    ).toBe(false);
  });

  it("only OPEN accepts investments", () => {
    expect(canAcceptInvestments(OpportunityStatus.OPEN)).toBe(true);
    expect(canAcceptInvestments(OpportunityStatus.PAUSED)).toBe(false);
    expect(canAcceptInvestments(OpportunityStatus.DRAFT)).toBe(false);
  });
});

describe("investment status transitions", () => {
  it("follows payment confirmation path", () => {
    expect(
      canTransitionInvestmentStatus(
        InvestmentStatus.INITIATED,
        InvestmentStatus.PAYMENT_PENDING,
      ),
    ).toBe(true);
    expect(
      canTransitionInvestmentStatus(
        InvestmentStatus.PAYMENT_PENDING,
        InvestmentStatus.PAYMENT_SUCCESS,
      ),
    ).toBe(true);
    expect(
      canTransitionInvestmentStatus(
        InvestmentStatus.PAYMENT_SUCCESS,
        InvestmentStatus.CONFIRMED,
      ),
    ).toBe(true);
  });

  it("blocks illegal jumps", () => {
    expect(
      canTransitionInvestmentStatus(
        InvestmentStatus.INITIATED,
        InvestmentStatus.CONFIRMED,
      ),
    ).toBe(false);
    expect(
      canTransitionInvestmentStatus(
        InvestmentStatus.CONFIRMED,
        InvestmentStatus.FAILED,
      ),
    ).toBe(false);
  });
});
