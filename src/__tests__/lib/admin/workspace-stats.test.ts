import { beforeEach, describe, expect, it, vi } from "vitest";

import { OpportunityStatus } from "@/constants/opportunity-status";
import { ProjectStatus } from "@/constants/project-status";

const projectCountDocumentsMock = vi.fn();
const projectFindMock = vi.fn();
const opportunityCountDocumentsMock = vi.fn();
const opportunityDistinctMock = vi.fn();
const getAdminInvestmentStatsMock = vi.fn();
const listAdminInvestmentsMock = vi.fn();
const listAdminProjectsMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    countDocuments: (...args: unknown[]) => projectCountDocumentsMock(...args),
    find: (...args: unknown[]) => projectFindMock(...args),
  },
}));

vi.mock("@/models/InvestmentOpportunity", () => ({
  InvestmentOpportunity: {
    countDocuments: (...args: unknown[]) => opportunityCountDocumentsMock(...args),
    distinct: (...args: unknown[]) => opportunityDistinctMock(...args),
  },
}));

vi.mock("@/services/investment.service", () => ({
  getAdminInvestmentStats: (...args: unknown[]) => getAdminInvestmentStatsMock(...args),
  listAdminInvestments: (...args: unknown[]) => listAdminInvestmentsMock(...args),
}));

vi.mock("@/services/project.service", () => ({
  listAdminProjects: (...args: unknown[]) => listAdminProjectsMock(...args),
}));

import {
  buildAdminAttention,
  getAdminWorkspaceStats,
  publishedWithoutOpenOpportunity,
} from "@/lib/admin/workspace-stats";

describe("publishedWithoutOpenOpportunity", () => {
  it("keeps published projects whose ids are not in the open-opportunity set", () => {
    expect(
      publishedWithoutOpenOpportunity(
        [
          { id: "a", title: "Open one" },
          { id: "b", title: "Missing terms" },
        ],
        ["a"],
      ),
    ).toEqual([{ id: "b", title: "Missing terms" }]);
  });
});

describe("buildAdminAttention", () => {
  it("derives drafts, missing open opportunities, and pending payments only", () => {
    const items = buildAdminAttention({
      drafts: [{ id: "d1", title: "Draft kitchen" }],
      publishedWithoutOpen: [{ id: "p1", title: "Live but closed" }],
      pendingPayments: 2,
    });

    expect(items).toEqual([
      {
        id: "d1",
        title: "Draft kitchen",
        reason: "Draft — not public yet",
        href: "/admin/projects/d1/edit",
      },
      {
        id: "p1",
        title: "Live but closed",
        reason: "Published without an open opportunity",
        href: "/admin/projects/p1/investment",
      },
      {
        id: "pending-payments",
        title: "2 pending payments",
        reason: "Review investments awaiting payment",
        href: "/admin/investments",
      },
    ]);
  });

  it("does not invent pending-payment attention when the count is zero", () => {
    expect(
      buildAdminAttention({
        drafts: [],
        publishedWithoutOpen: [],
        pendingPayments: 0,
      }),
    ).toEqual([]);
  });
});

describe("getAdminWorkspaceStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectCountDocumentsMock
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2);
    opportunityCountDocumentsMock.mockResolvedValue(4);
    getAdminInvestmentStatsMock.mockResolvedValue({
      total: 10,
      confirmed: 6,
      pendingPayments: 1,
      confirmedAmountMinor: 250_000_00,
    });
    listAdminProjectsMock.mockResolvedValue({ items: [], page: 1, limit: 5, total: 0, totalPages: 0 });
    listAdminInvestmentsMock.mockResolvedValue({
      items: [],
      page: 1,
      limit: 5,
      total: 0,
      totalPages: 0,
    });
    projectFindMock.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });
    opportunityDistinctMock.mockResolvedValue([]);
  });

  it("returns real collection counts and does not add fabricated metrics", async () => {
    const stats = await getAdminWorkspaceStats();

    expect(projectCountDocumentsMock).toHaveBeenCalledWith({ status: ProjectStatus.DRAFT });
    expect(projectCountDocumentsMock).toHaveBeenCalledWith({ status: ProjectStatus.PUBLISHED });
    expect(opportunityCountDocumentsMock).toHaveBeenCalledWith({
      status: OpportunityStatus.OPEN,
    });
    expect(stats.projects).toEqual({
      draft: 3,
      published: 4,
      unpublished: 1,
      archived: 2,
      total: 10,
    });
    expect(stats.openOpportunities).toBe(4);
    expect(stats.investments.confirmedAmountMinor).toBe(250_000_00);
    expect(stats).not.toHaveProperty("roi");
    expect(stats).not.toHaveProperty("equity");
  });
});
