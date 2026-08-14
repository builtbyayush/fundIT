import { describe, expect, it } from "vitest";

import {
  adminProjectListQuerySchema,
  projectInputSchema,
  publicProjectListQuerySchema,
} from "@/lib/validations/project";

describe("project validations", () => {
  const validInput = {
    title: "Orbit Task Workspace",
    slug: "orbit-task-workspace",
    shortDescription: "Collaborative workspace for distributed product teams.",
    description:
      "Orbit combines roadmapping and async updates for product organizations.",
    categoryIds: ["507f1f77bcf86cd799439011"],
    primaryCategoryId: "507f1f77bcf86cd799439011",
    tags: ["SaaS", "B2B"],
    highlights: ["Async collaboration"],
    gallery: ["https://example.com/one.jpg"],
    thumbnail: "https://example.com/thumb.jpg",
    coverImage: "",
    video: null,
    website: "https://example.com",
    location: { city: "Pune", state: "Maharashtra", country: "India" },
  };

  it("accepts valid project input", () => {
    const result = projectInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects short titles and descriptions", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      title: "A",
      shortDescription: "Too short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid slugs", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      slug: "Not A Slug",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URLs", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      website: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported URL protocols", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      coverImage: "javascript:alert(1)",
    });
    expect(result.success).toBe(false);
  });

  it("parses admin list query defaults", () => {
    const result = adminProjectListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it("parses public list query defaults", () => {
    const result = publicProjectListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(12);
    expect(result.sort).toBe("newest");
  });

  it("accepts updated sort for public discovery", () => {
    const result = publicProjectListQuerySchema.parse({ sort: "updated" });
    expect(result.sort).toBe("updated");
  });

  it("accepts multiple categories with a valid primary", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      categoryIds: [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439012",
      ],
      primaryCategoryId: "507f1f77bcf86cd799439012",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty categoryIds", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      categoryIds: [],
      primaryCategoryId: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(false);
  });

  it("rejects primary category outside categoryIds", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      categoryIds: ["507f1f77bcf86cd799439011"],
      primaryCategoryId: "507f1f77bcf86cd799439099",
    });
    expect(result.success).toBe(false);
  });

  it("rejects duplicate categoryIds", () => {
    const result = projectInputSchema.safeParse({
      ...validInput,
      categoryIds: [
        "507f1f77bcf86cd799439011",
        "507f1f77bcf86cd799439011",
      ],
      primaryCategoryId: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(false);
  });
});
