import { describe, expect, it } from "vitest";

import { CurrencyCode } from "@/constants/currency";
import { ApiError } from "@/lib/api/errors";
import {
  addMinor,
  assertMoney,
  compareMinor,
  createMoney,
  formatMoney,
  isAtLeast,
  isAtMost,
  parseMajorToMinor,
} from "@/lib/money";

describe("money utilities", () => {
  it("creates money with integer minor units", () => {
    expect(createMoney(150050, CurrencyCode.INR)).toEqual({
      amountMinor: 150050,
      currency: "INR",
    });
  });

  it("rejects floating-point amounts", () => {
    expect(() => assertMoney({ amountMinor: 10.5, currency: CurrencyCode.INR })).toThrow(
      ApiError,
    );
  });

  it("rejects negative amounts", () => {
    expect(() => createMoney(-1)).toThrow(ApiError);
  });

  it("adds and compares integers only", () => {
    expect(addMinor(100, 50)).toBe(150);
    expect(compareMinor(100, 50)).toBe(1);
    expect(isAtLeast(1000, 1000)).toBe(true);
    expect(isAtMost(999, 1000)).toBe(true);
    expect(() => addMinor(1.1, 2)).toThrow(ApiError);
  });

  it("parses major decimal strings without float drift", () => {
    expect(parseMajorToMinor("1500.50")).toBe(150050);
    expect(parseMajorToMinor("10")).toBe(1000);
    expect(parseMajorToMinor("0.01")).toBe(1);
  });

  it("rejects invalid major strings", () => {
    expect(() => parseMajorToMinor("10.999")).toThrow(ApiError);
    expect(() => parseMajorToMinor("-5")).toThrow(ApiError);
    expect(() => parseMajorToMinor("abc")).toThrow(ApiError);
  });

  it("formats for display only", () => {
    expect(formatMoney({ amountMinor: 150050, currency: CurrencyCode.INR })).toContain(
      "1,500.50",
    );
  });
});
