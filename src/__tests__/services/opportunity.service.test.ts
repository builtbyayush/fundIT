import { beforeEach, describe, expect, it, vi } from "vitest";

import { OpportunityStatus } from "@/constants/opportunity-status";
import { ProjectStatus } from "@/constants/project-status";
import { CurrencyCode } from "@/constants/currency";
import { ApiError } from "@/lib/api/errors";

const PROJECT_ID = "507f1f77bcf86cd799439011";
const ADMIN_ID = "507f1f77bcf86cd799439012";
const OPP_ID = "507f1f77bcf86cd799439013";

const projectFindByIdMock = vi.fn();
const opportunityFindOneMock = vi.fn();
const opportunityFindByIdMock = vi.fn();
const opportunityCreateMock = vi.fn();
const writeAuditLogMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    findById: (...args: unknown[]) => projectFindByIdMock(...args),
  },
}));

vi.mock("@/models/InvestmentOpportunity", () => ({
  InvestmentOpportunity: {
    findOne: (...args: unknown[]) => opportunityFindOneMock(...args),
    findById: (...args: unknown[]) => opportunityFindByIdMock(...args),
    create: (...args: unknown[]) => opportunityCreateMock(...args),
  },
}));

vi.mock("@/services/audit.service", () => ({
  writeAuditLog: (...args: unknown[]) => writeAuditLogMock(...args),
}));

import {
  isOpportunityCurrentlyInvestable,
  openOpportunity,
  serializePublicOpportunity,
  serializePublicOpportunityDetail,
} from "@/services/opportunity.service";

function mockOpportunity(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => OPP_ID },
    project: PROJECT_ID,
    status: OpportunityStatus.DRAFT,
    currency: CurrencyCode.INR,
    fundingTarget: { amountMinor: 1_000_000_00, currency: CurrencyCode.INR },
    minimumInvestment: { amountMinor: 10_000_00, currency: CurrencyCode.INR },
    maximumInvestment: { amountMinor: 100_000_00, currency: CurrencyCode.INR },
    startDate: null,
    endDate: null,
    termsVersion: 1,
    committedAmountMinor: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("opportunity.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeAuditLogMock.mockResolvedValue(undefined);
  });

  it("rejects opening when project is not published", async () => {
    opportunityFindOneMock.mockResolvedValue(mockOpportunity());
    projectFindByIdMock.mockResolvedValue({
      _id: PROJECT_ID,
      status: ProjectStatus.DRAFT,
    });

    await expect(openOpportunity(PROJECT_ID, ADMIN_ID)).rejects.toThrow(ApiError);
  });

  it("opens a draft opportunity for a published project", async () => {
    const opportunity = mockOpportunity();
    opportunityFindOneMock.mockResolvedValue(opportunity);
    projectFindByIdMock.mockResolvedValue({
      _id: PROJECT_ID,
      status: ProjectStatus.PUBLISHED,
    });

    const result = await openOpportunity(PROJECT_ID, ADMIN_ID);
    expect(result.status).toBe(OpportunityStatus.OPEN);
    expect(opportunity.save).toHaveBeenCalled();
  });

  it("rejects opening when minimum exceeds maximum", async () => {
    const opportunity = mockOpportunity({
      minimumInvestment: { amountMinor: 5000, currency: CurrencyCode.INR },
      maximumInvestment: { amountMinor: 1000, currency: CurrencyCode.INR },
    });
    opportunityFindOneMock.mockResolvedValue(opportunity);
    projectFindByIdMock.mockResolvedValue({
      _id: PROJECT_ID,
      status: ProjectStatus.PUBLISHED,
    });

    await expect(openOpportunity(PROJECT_ID, ADMIN_ID)).rejects.toMatchObject({
      code: "INVALID_CONFIG",
    });
  });

  it("hides non-open opportunities from public serialization", () => {
    expect(
      serializePublicOpportunity(
        mockOpportunity({ status: OpportunityStatus.PAUSED }) as never,
      ),
    ).toBeNull();
    expect(
      isOpportunityCurrentlyInvestable(
        mockOpportunity({ status: OpportunityStatus.OPEN }) as never,
      ),
    ).toBe(true);
  });

  it("exposes paused opportunities in detail summary without investability", () => {
    const detail = serializePublicOpportunityDetail(
      mockOpportunity({ status: OpportunityStatus.PAUSED }) as never,
    );
    expect(detail?.investable).toBe(false);
    expect(detail?.status).toBe(OpportunityStatus.PAUSED);
    expect(detail?.committedAmountMinor).toBe(0);
  });
});
