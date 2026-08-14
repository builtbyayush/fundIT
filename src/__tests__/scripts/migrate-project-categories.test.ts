import { describe, expect, it } from "vitest";

/**
 * Migration rules encoded for unit coverage without requiring Mongo.
 * Mirrors scripts/migrate-project-categories.ts behavior.
 */
function planMigration(doc: {
  category?: string | null;
  categories?: string[] | null;
  primaryCategory?: string | null;
}) {
  const hasCategories =
    Array.isArray(doc.categories) &&
    doc.categories.length > 0 &&
    Boolean(doc.primaryCategory);

  if (hasCategories) {
    return { action: "skip" as const, unsetLegacy: doc.category != null };
  }

  if (!doc.category) {
    return { action: "fail" as const };
  }

  return {
    action: "migrate" as const,
    categories: [doc.category],
    primaryCategory: doc.category,
    unsetLegacy: true,
  };
}

describe("project category migration plan", () => {
  it("migrates legacy single category", () => {
    expect(planMigration({ category: "cat-1" })).toEqual({
      action: "migrate",
      categories: ["cat-1"],
      primaryCategory: "cat-1",
      unsetLegacy: true,
    });
  });

  it("skips already migrated projects", () => {
    expect(
      planMigration({
        categories: ["cat-1", "cat-2"],
        primaryCategory: "cat-1",
      }),
    ).toEqual({ action: "skip", unsetLegacy: false });
  });

  it("cleans leftover legacy field on already migrated docs", () => {
    expect(
      planMigration({
        category: "cat-old",
        categories: ["cat-1"],
        primaryCategory: "cat-1",
      }),
    ).toEqual({ action: "skip", unsetLegacy: true });
  });

  it("fails when neither legacy nor new fields exist", () => {
    expect(planMigration({})).toEqual({ action: "fail" });
  });
});
