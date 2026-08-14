import { describe, expect, it } from "vitest";

import { getProjectMediaFolder } from "@/lib/media/folders";

describe("project media folders", () => {
  it("uses project-specific folders when a project id is available", () => {
    expect(
      getProjectMediaFolder({
        projectId: "507f1f77bcf86cd799439011",
        mediaType: "cover",
      }),
    ).toBe("fundit/projects/507f1f77bcf86cd799439011/cover");
  });

  it("uses draft folders for unsaved projects", () => {
    expect(
      getProjectMediaFolder({
        draftKey: "draft-123",
        mediaType: "gallery",
      }),
    ).toBe("fundit/projects/drafts/draft-123/gallery");
  });
});
