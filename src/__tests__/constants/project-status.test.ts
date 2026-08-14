import { describe, expect, it } from "vitest";

import {
  canTransitionStatus,
  ProjectStatus,
} from "@/constants/project-status";

describe("project status transitions", () => {
  it("allows draft to published and archived", () => {
    expect(canTransitionStatus(ProjectStatus.DRAFT, ProjectStatus.PUBLISHED)).toBe(true);
    expect(canTransitionStatus(ProjectStatus.DRAFT, ProjectStatus.ARCHIVED)).toBe(true);
    expect(canTransitionStatus(ProjectStatus.DRAFT, ProjectStatus.UNPUBLISHED)).toBe(false);
  });

  it("allows published to unpublished and archived", () => {
    expect(canTransitionStatus(ProjectStatus.PUBLISHED, ProjectStatus.UNPUBLISHED)).toBe(true);
    expect(canTransitionStatus(ProjectStatus.PUBLISHED, ProjectStatus.ARCHIVED)).toBe(true);
    expect(canTransitionStatus(ProjectStatus.PUBLISHED, ProjectStatus.DRAFT)).toBe(false);
  });

  it("allows unpublished to published and archived", () => {
    expect(canTransitionStatus(ProjectStatus.UNPUBLISHED, ProjectStatus.PUBLISHED)).toBe(true);
    expect(canTransitionStatus(ProjectStatus.UNPUBLISHED, ProjectStatus.ARCHIVED)).toBe(true);
  });

  it("does not allow transitions out of archived", () => {
    expect(canTransitionStatus(ProjectStatus.ARCHIVED, ProjectStatus.PUBLISHED)).toBe(false);
    expect(canTransitionStatus(ProjectStatus.ARCHIVED, ProjectStatus.DRAFT)).toBe(false);
  });
});
