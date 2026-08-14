import { describe, expect, it } from "vitest";

import { ProjectStatus } from "@/constants/project-status";
import { serializePublicProject } from "@/services/project.service";

describe("public project serialization", () => {
  it("excludes createdBy and returns categories plus primaryCategory", () => {
    const serialized = serializePublicProject({
      _id: "project-1",
      title: "Public Opportunity",
      slug: "public-opportunity",
      shortDescription: "A short public description.",
      description: "Full description",
      thumbnail: null,
      coverImage: null,
      gallery: [],
      video: null,
      website: null,
      tags: ["AI"],
      highlights: ["Secure"],
      location: null,
      publishedAt: new Date(),
      status: ProjectStatus.PUBLISHED,
      createdBy: { _id: "admin-1", name: "Admin", email: "admin@funded.local" },
      categories: [
        {
          _id: { toString: () => "cat-1" },
          name: "Software",
          slug: "software",
          icon: "code",
        },
        {
          _id: { toString: () => "cat-2" },
          name: "Nutrition",
          slug: "nutrition",
          icon: "apple",
        },
      ],
      primaryCategory: {
        _id: { toString: () => "cat-1" },
        name: "Software",
        slug: "software",
        icon: "code",
      },
    } as never);

    expect(serialized).not.toHaveProperty("createdBy");
    expect(serialized).not.toHaveProperty("status");
    expect(serialized).not.toHaveProperty("category");
    expect(serialized.primaryCategory?.name).toBe("Software");
    expect(serialized.categories.map((category) => category.name)).toEqual([
      "Software",
      "Nutrition",
    ]);
    expect(serialized.title).toBe("Public Opportunity");
  });
});
