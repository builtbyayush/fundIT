import { describe, expect, it } from "vitest";

import { slugify, isValidSlug } from "@/lib/utils/slug";

describe("slugify", () => {
  it("generates URL-safe slugs from titles", () => {
    expect(slugify("AI Powered Clinical Assistant!")).toBe(
      "ai-powered-clinical-assistant",
    );
  });

  it("collapses whitespace and punctuation", () => {
    expect(slugify("  Hello   World -- Demo  ")).toBe("hello-world-demo");
  });

  it("validates slug format", () => {
    expect(isValidSlug("ai-powered-clinical-assistant")).toBe(true);
    expect(isValidSlug("Invalid Slug")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
  });
});
