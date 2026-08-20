import { describe, expect, it } from "vitest";

import { ProjectStatus } from "@/constants/project-status";
import { opportunityOpenBlockers } from "@/lib/admin/opportunity-blockers";

describe("opportunityOpenBlockers", () => {
  it("requires saved terms and a published project", () => {
    expect(
      opportunityOpenBlockers({
        projectStatus: ProjectStatus.DRAFT,
        configured: false,
      }),
    ).toEqual([
      "Save investment terms before opening this opportunity.",
      "Publish the project before opening an investment opportunity.",
    ]);
  });

  it("surfaces invalid min/max and dates from current open rules", () => {
    expect(
      opportunityOpenBlockers({
        projectStatus: ProjectStatus.PUBLISHED,
        configured: true,
        fundingTargetMinor: 0,
        minimumMinor: 5000,
        maximumMinor: 1000,
        startDate: "2026-06-01",
        endDate: "2026-01-01",
      }),
    ).toEqual([
      "Funding target must be a positive amount.",
      "Minimum investment cannot exceed maximum investment.",
      "Start date must be before end date.",
    ]);
  });

  it("returns no blockers when terms are valid and the project is published", () => {
    expect(
      opportunityOpenBlockers({
        projectStatus: ProjectStatus.PUBLISHED,
        configured: true,
        fundingTargetMinor: 100_000_00,
        minimumMinor: 1000_00,
        maximumMinor: 50_000_00,
        startDate: "2026-01-01",
        endDate: "2026-12-01",
      }),
    ).toEqual([]);
  });
});
