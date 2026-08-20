import { describe, expect, it } from "vitest";

import { OpportunityStatus } from "@/constants/opportunity-status";
import { ProjectStatus } from "@/constants/project-status";
import {
  opportunityStatusBadgeVariant,
  projectStatusBadgeVariant,
  projectStatusLabel,
} from "@/lib/admin/status-presentation";

describe("projectStatusLabel", () => {
  it("maps enums to human labels, not raw DRAFT strings", () => {
    expect(projectStatusLabel(ProjectStatus.DRAFT)).toBe("Draft");
    expect(projectStatusLabel(ProjectStatus.PUBLISHED)).toBe("Published");
    expect(projectStatusLabel(ProjectStatus.UNPUBLISHED)).toBe("Unpublished");
    expect(projectStatusLabel(ProjectStatus.ARCHIVED)).toBe("Archived");
  });

  it("uses pastel badge variants", () => {
    expect(projectStatusBadgeVariant(ProjectStatus.DRAFT)).toBe("pastelYellow");
    expect(projectStatusBadgeVariant(ProjectStatus.PUBLISHED)).toBe("pastelMint");
    expect(opportunityStatusBadgeVariant(OpportunityStatus.OPEN)).toBe("pastelMint");
    expect(opportunityStatusBadgeVariant(OpportunityStatus.CANCELLED)).toBe("pastelPink");
  });
});
