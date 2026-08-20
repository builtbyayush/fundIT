import { describe, expect, it } from "vitest";

import { InvestmentStatus } from "@/constants/investment-status";
import {
  getInvestmentStatusPresentation,
  investmentNeedsPayment,
} from "@/lib/investor/status-presentation";

describe("getInvestmentStatusPresentation", () => {
  it("maps confirmed, pending, failed, and cancelled to friendly labels and pastel tones", () => {
    expect(getInvestmentStatusPresentation(InvestmentStatus.CONFIRMED)).toMatchObject({
      label: "Confirmed",
      tone: "success",
      badgeVariant: "pastelMint",
    });
    expect(getInvestmentStatusPresentation(InvestmentStatus.PAYMENT_PENDING)).toMatchObject({
      label: "Payment pending",
      tone: "warning",
      badgeVariant: "pastelYellow",
    });
    expect(getInvestmentStatusPresentation(InvestmentStatus.INITIATED)).toMatchObject({
      label: "Payment pending",
      tone: "warning",
    });
    expect(getInvestmentStatusPresentation(InvestmentStatus.FAILED)).toMatchObject({
      label: "Payment failed",
      tone: "danger",
      badgeVariant: "pastelPink",
    });
    expect(getInvestmentStatusPresentation(InvestmentStatus.CANCELLED)).toMatchObject({
      label: "Cancelled",
      tone: "neutral",
    });
  });

  it("treats initiated and payment-pending as needing payment", () => {
    expect(investmentNeedsPayment(InvestmentStatus.INITIATED)).toBe(true);
    expect(investmentNeedsPayment(InvestmentStatus.PAYMENT_PENDING)).toBe(true);
    expect(investmentNeedsPayment(InvestmentStatus.CONFIRMED)).toBe(false);
  });
});
