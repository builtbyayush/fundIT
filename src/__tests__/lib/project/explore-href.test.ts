import { describe, expect, it } from "vitest";

import { exploreHref } from "@/lib/project/explore-href";

describe("exploreHref", () => {
  it("returns the bare explore path with no filters", () => {
    expect(exploreHref({})).toBe("/projects");
  });

  it("keeps search, category, and non-default sort", () => {
    expect(
      exploreHref({
        search: "care",
        category: "gadgets",
        sort: "updated",
        page: 2,
      }),
    ).toBe("/projects?search=care&category=gadgets&sort=updated&page=2");
  });

  it("omits default newest sort and page 1", () => {
    expect(exploreHref({ sort: "newest", page: 1 })).toBe("/projects");
  });
});
