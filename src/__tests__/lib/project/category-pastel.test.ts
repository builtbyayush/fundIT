import { describe, expect, it } from "vitest";

import { pastelForCategorySlug } from "@/lib/project/category-pastel";
import { PASTEL_TOKEN_KEYS } from "@/lib/utils/theme";

describe("pastelForCategorySlug", () => {
  it("returns a known pastel token", () => {
    expect(PASTEL_TOKEN_KEYS).toContain(pastelForCategorySlug("apps"));
  });

  it("is deterministic for the same slug", () => {
    expect(pastelForCategorySlug("ai-in-healthcare")).toBe(
      pastelForCategorySlug("ai-in-healthcare"),
    );
  });

  it("spreads distinct slugs across the palette", () => {
    const slugs = [
      "ai-in-healthcare",
      "apps",
      "software",
      "gadgets",
      "equipment",
      "nutrition",
      "formulations",
      "events-festivals",
      "academics",
      "publications",
    ];
    const unique = new Set(slugs.map(pastelForCategorySlug));
    expect(unique.size).toBeGreaterThan(1);
  });
});
