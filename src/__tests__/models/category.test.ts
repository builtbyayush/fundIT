import { describe, expect, it } from "vitest";

import { Category } from "@/models/Category";

describe("Category model", () => {
  it("accepts a valid category", async () => {
    const category = new Category({
      name: "Software",
      slug: "software",
      description: "Enterprise software",
      icon: "code",
      isActive: true,
      displayOrder: 1,
    });

    await expect(category.validate()).resolves.toBeUndefined();
  });

  it("generates a slug from name when missing", async () => {
    const category = new Category({
      name: "AI in Healthcare",
      description: "AI healthcare",
    });

    await category.validate();
    expect(category.slug).toBe("ai-in-healthcare");
  });

  it("requires a name", async () => {
    const category = new Category({
      slug: "missing-name",
    });

    await expect(category.validate()).rejects.toThrow();
  });

  it("defaults isActive to true", async () => {
    const category = new Category({
      name: "Apps",
      slug: "apps",
    });
    await category.validate();
    expect(category.isActive).toBe(true);
  });

  it("defines unique indexes for name and slug", () => {
    expect(Category.schema.path("slug")?.options?.unique).toBe(true);
    const nameIndex = Category.schema.indexes().find(([fields]) => fields.name === 1);
    expect(nameIndex?.[1]?.unique).toBe(true);
  });
});
