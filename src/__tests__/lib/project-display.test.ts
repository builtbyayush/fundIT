import { describe, expect, it } from "vitest";

import {
  categoryDisplayLabels,
  formatProjectLocation,
  resolveProjectCardImage,
  resolveProjectImage,
} from "@/lib/project/display";
import {
  demoProjectMedia,
  shouldRefreshSeededProject,
} from "@/lib/seed/project-media";

describe("project display helpers", () => {
  it("prefers cover image for detail hero resolution", () => {
    expect(resolveProjectImage("/thumb.svg", "/cover.svg")).toBe("/cover.svg");
    expect(resolveProjectImage("/thumb.svg", null)).toBe("/thumb.svg");
    expect(resolveProjectImage(null, null)).toBeNull();
  });

  it("prefers cover image for card image resolution", () => {
    expect(resolveProjectCardImage("/thumb.svg", "/cover.svg")).toBe("/cover.svg");
    expect(resolveProjectCardImage("/thumb.svg", null)).toBe("/thumb.svg");
  });

  it("shows primary category first and counts overflow labels", () => {
    expect(
      categoryDisplayLabels([
        { name: "AI in Healthcare" },
        { name: "Software" },
        { name: "Nutrition" },
      ]),
    ).toEqual({
      labels: ["AI in Healthcare", "Software"],
      more: 1,
    });
  });

  it("formats location without empty segments", () => {
    expect(
      formatProjectLocation({ city: "Bengaluru", state: "Karnataka", country: "India" }),
    ).toBe("Bengaluru, Karnataka, India");
    expect(formatProjectLocation({ city: "", state: "", country: "" })).toBeNull();
  });
});

describe("demo project media seed helpers", () => {
  it("returns stable local asset paths", () => {
    const media = demoProjectMedia("ai-health");
    expect(media.coverImage).toBe("/demo/projects/ai-health/cover.svg");
    expect(media.gallery).toHaveLength(3);
  });

  it("refreshes legacy seeded projects missing media or using dev copy", () => {
    expect(shouldRefreshSeededProject({ coverImage: null, description: "Normal copy." })).toBe(
      true,
    );
    expect(
      shouldRefreshSeededProject({
        coverImage: "/demo/projects/ai-health/cover.svg",
        description: "Fictional seed opportunity for discovery UI testing.",
      }),
    ).toBe(true);
    expect(
      shouldRefreshSeededProject({
        coverImage: "/demo/projects/ai-health/cover.svg",
        description: "CareVision AI helps clinical teams move faster.",
      }),
    ).toBe(false);
  });
});
