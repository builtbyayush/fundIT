import { describe, expect, it } from "vitest";

import { fundingPercentage } from "@/lib/project/funding";

describe("fundingPercentage", () => {
  it("returns 0 when the target is missing", () => {
    expect(fundingPercentage(100, 0)).toBe(0);
  });

  it("caps at 100", () => {
    expect(fundingPercentage(200, 100)).toBe(100);
  });

  it("floors the ratio", () => {
    expect(fundingPercentage(62, 100)).toBe(62);
  });
});
