import { describe, expect, it } from "vitest";

import { firstNameFromFullName, investorGreeting } from "@/lib/investor/greeting";
import { investmentsListHref } from "@/lib/investor/investment-card";

describe("investor greeting", () => {
  it("uses the first name when present", () => {
    expect(firstNameFromFullName("Ayush Dixit")).toBe("Ayush");
    expect(investorGreeting("Ayush Dixit").title).toBe("Welcome back, Ayush.");
  });

  it("falls back when the name is missing", () => {
    expect(investorGreeting("").title).toBe("Good to see you again.");
  });
});

describe("investmentsListHref", () => {
  it("omits default all/page query params", () => {
    expect(investmentsListHref({})).toBe("/investor/investments");
    expect(investmentsListHref({ status: "pending", search: "care", page: 2 })).toBe(
      "/investor/investments?status=pending&search=care&page=2",
    );
  });
});
