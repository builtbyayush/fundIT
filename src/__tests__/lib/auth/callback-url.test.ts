import { describe, expect, it } from "vitest";

import { safeAuthCallbackUrl, safeInvestCallbackUrl } from "@/lib/auth/callback-url";

describe("safeInvestCallbackUrl", () => {
  it("allows a relative invest path", () => {
    expect(safeInvestCallbackUrl("/projects/solar-lanterns/invest")).toBe(
      "/projects/solar-lanterns/invest",
    );
  });

  it("rejects open redirects and unrelated paths", () => {
    expect(safeInvestCallbackUrl("https://evil.example/phish")).toBeNull();
    expect(safeInvestCallbackUrl("//evil.example")).toBeNull();
    expect(safeInvestCallbackUrl("/login")).toBeNull();
    expect(safeInvestCallbackUrl("/projects/not-invest")).toBeNull();
    expect(safeInvestCallbackUrl("/projects/Solar-Lanterns/invest")).toBeNull();
  });
});

describe("safeAuthCallbackUrl", () => {
  it("allows investor and admin app paths", () => {
    expect(safeAuthCallbackUrl("/investor")).toBe("/investor");
    expect(safeAuthCallbackUrl("/investor/investments/abc")).toBe(
      "/investor/investments/abc",
    );
    expect(safeAuthCallbackUrl("/admin")).toBe("/admin");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeAuthCallbackUrl("https://evil.example/investor")).toBeNull();
    expect(safeAuthCallbackUrl("javascript:alert(1)")).toBeNull();
  });
});
