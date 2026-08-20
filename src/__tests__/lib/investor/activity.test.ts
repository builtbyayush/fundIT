import { describe, expect, it } from "vitest";

import { CurrencyCode } from "@/constants/currency";
import { InvestmentStatus } from "@/constants/investment-status";
import { formatMoney } from "@/lib/money";
import { investorActivityItems } from "@/lib/investor/activity";

const base = {
  id: "inv-1",
  amountMinor: 50_000_00,
  currency: CurrencyCode.INR,
  createdAt: new Date("2026-01-02"),
  project: { id: "p1", title: "CareVision AI", slug: "carevision-ai" },
};

describe("investorActivityItems", () => {
  it("describes confirmed backings with the real amount", () => {
    const items = investorActivityItems([
      { ...base, status: InvestmentStatus.CONFIRMED, confirmedAt: new Date("2026-01-03") },
    ]);
    expect(items[0]?.text).toBe(
      `Backed CareVision AI — ${formatMoney({ amountMinor: 50_000_00, currency: CurrencyCode.INR })}`,
    );
    expect(items[0]?.href).toBe("/investor/investments/inv-1");
  });

  it("describes pending and failed payments from real statuses", () => {
    const items = investorActivityItems([
      { ...base, id: "inv-2", status: InvestmentStatus.PAYMENT_PENDING },
      { ...base, id: "inv-3", status: InvestmentStatus.FAILED },
    ]);
    expect(items.map((item) => item.text)).toEqual([
      "Payment pending for CareVision AI",
      "Payment didn’t go through for CareVision AI",
    ]);
  });
});
