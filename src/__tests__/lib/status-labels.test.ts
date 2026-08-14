import { describe, expect, it } from "vitest";

import { InvestmentStatus } from "@/constants/investment-status";
import { PaymentStatus } from "@/constants/payment-status";
import { OpportunityStatus } from "@/constants/opportunity-status";
import {
  investmentStatusLabel,
  opportunityStatusLabel,
  paymentStatusLabel,
} from "@/lib/status-labels";

describe("status labels", () => {
  it("maps investment statuses to readable labels", () => {
    expect(investmentStatusLabel(InvestmentStatus.PAYMENT_PENDING)).toBe(
      "Payment pending",
    );
    expect(investmentStatusLabel(InvestmentStatus.CONFIRMED)).toBe("Confirmed");
  });

  it("maps payment and opportunity statuses", () => {
    expect(paymentStatusLabel(PaymentStatus.FAILED)).toBe("Failed");
    expect(opportunityStatusLabel(OpportunityStatus.PAUSED)).toBe("Paused");
  });
});
