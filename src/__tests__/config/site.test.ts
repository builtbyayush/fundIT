import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";

describe("FundIt branding", () => {
  it("uses FundIt as the canonical product name", () => {
    expect(siteConfig.name).toBe("FundIt");
    expect(siteConfig.logo.text).toBe("FundIt");
    expect(siteConfig.logo.alt).toContain("FundIt");
  });
});
