import { describe, expect, it } from "vitest";

import {
  adminInvestmentListQuerySchema,
  investorInvestmentListQuerySchema,
} from "@/lib/validations/investment";

describe("investorInvestmentListQuerySchema", () => {
  it("defaults status to all and accepts status groups", () => {
    expect(investorInvestmentListQuerySchema.parse({}).status).toBe("all");
    expect(investorInvestmentListQuerySchema.parse({ status: "pending" }).status).toBe(
      "pending",
    );
  });

  it("falls back to all for unknown status values", () => {
    expect(investorInvestmentListQuerySchema.parse({ status: "roi" }).status).toBe("all");
  });
});

describe("adminInvestmentListQuerySchema", () => {
  it("keeps status, payment status, and number search filters", () => {
    const query = adminInvestmentListQuerySchema.parse({
      search: "INV-9",
      status: "CONFIRMED",
      paymentStatus: "SUCCESS",
    });
    expect(query.search).toBe("INV-9");
    expect(query.status).toBe("CONFIRMED");
    expect(query.paymentStatus).toBe("SUCCESS");
  });
});
