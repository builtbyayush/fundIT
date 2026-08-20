import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvestmentStatus } from "@/constants/investment-status";
import { OpportunityStatus } from "@/constants/opportunity-status";
import { PaymentStatus } from "@/constants/payment-status";
import { ProjectStatus } from "@/constants/project-status";
import { CurrencyCode } from "@/constants/currency";
import { ApiError } from "@/lib/api/errors";

const PROJECT_ID = "507f1f77bcf86cd799439011";
const INVESTOR_ID = "507f1f77bcf86cd799439012";
const OTHER_INVESTOR = "507f1f77bcf86cd799439099";
const OPP_ID = "507f1f77bcf86cd799439013";
const INV_ID = "507f1f77bcf86cd799439014";

const projectFindByIdMock = vi.fn();
const projectFindMock = vi.fn();
const investmentCreateMock = vi.fn();
const investmentFindByIdMock = vi.fn();
const investmentFindMock = vi.fn();
const investmentCountDocumentsMock = vi.fn();
const investmentAggregateMock = vi.fn();
const investmentDistinctMock = vi.fn();
const getNextSequenceMock = vi.fn();
const getOpportunityByProjectIdMock = vi.fn();
const isOpportunityCurrentlyInvestableMock = vi.fn();
const writeAuditLogMock = vi.fn();
const tryReserveFundingMock = vi.fn();
const releaseFundingReservationMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    findById: (...args: unknown[]) => projectFindByIdMock(...args),
    find: (...args: unknown[]) => projectFindMock(...args),
  },
}));

vi.mock("@/models/Investment", () => ({
  Investment: {
    create: (...args: unknown[]) => investmentCreateMock(...args),
    findById: (...args: unknown[]) => investmentFindByIdMock(...args),
    countDocuments: (...args: unknown[]) => investmentCountDocumentsMock(...args),
    find: (...args: unknown[]) => investmentFindMock(...args),
    aggregate: (...args: unknown[]) => investmentAggregateMock(...args),
    distinct: (...args: unknown[]) => investmentDistinctMock(...args),
  },
}));

vi.mock("@/models/Counter", () => ({
  getNextSequence: (...args: unknown[]) => getNextSequenceMock(...args),
}));

vi.mock("@/services/opportunity.service", () => ({
  getOpportunityByProjectId: (...args: unknown[]) =>
    getOpportunityByProjectIdMock(...args),
  isOpportunityCurrentlyInvestable: (...args: unknown[]) =>
    isOpportunityCurrentlyInvestableMock(...args),
}));

vi.mock("@/services/audit.service", () => ({
  writeAuditLog: (...args: unknown[]) => writeAuditLogMock(...args),
}));

vi.mock("@/services/funding.service", () => ({
  tryReserveFunding: (...args: unknown[]) => tryReserveFundingMock(...args),
  releaseFundingReservation: (...args: unknown[]) =>
    releaseFundingReservationMock(...args),
}));

import {
  confirmInvestment,
  createInvestment,
  getInvestorBackedProjectIds,
  getInvestorInvestment,
  getInvestorInvestmentStats,
  listAdminInvestments,
  listInvestorInvestments,
  serializeInvestment,
} from "@/services/investment.service";

function mockOpportunity(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => OPP_ID },
    status: OpportunityStatus.OPEN,
    currency: CurrencyCode.INR,
    minimumInvestment: { amountMinor: 10_000_00, currency: CurrencyCode.INR },
    maximumInvestment: { amountMinor: 100_000_00, currency: CurrencyCode.INR },
    fundingTarget: { amountMinor: 1_000_000_00, currency: CurrencyCode.INR },
    committedAmountMinor: 0,
    termsVersion: 3,
    ...overrides,
  };
}

function mockInvestment(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => INV_ID },
    investmentNumber: "FD-INV-000001",
    investor: { toString: () => INVESTOR_ID },
    opportunity: { toString: () => OPP_ID },
    project: PROJECT_ID,
    amountMinor: 25_000_00,
    currency: CurrencyCode.INR,
    status: InvestmentStatus.INITIATED,
    paymentStatus: PaymentStatus.NOT_STARTED,
    termsVersion: 3,
    initiatedAt: new Date(),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("investment.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeAuditLogMock.mockResolvedValue(undefined);
    getNextSequenceMock.mockResolvedValue(1);
    projectFindByIdMock.mockResolvedValue({
      _id: PROJECT_ID,
      status: ProjectStatus.PUBLISHED,
    });
    getOpportunityByProjectIdMock.mockResolvedValue(mockOpportunity());
    isOpportunityCurrentlyInvestableMock.mockReturnValue(true);
    investmentCreateMock.mockResolvedValue(mockInvestment());
  });

  it("creates investments with frozen amount, currency, and termsVersion", async () => {
    const investment = await createInvestment({
      projectId: PROJECT_ID,
      investorId: INVESTOR_ID,
      amountMinor: 25_000_00,
    });

    expect(getNextSequenceMock).toHaveBeenCalledWith("investment");
    expect(investmentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        investmentNumber: "FD-INV-000001",
        amountMinor: 25_000_00,
        currency: CurrencyCode.INR,
        termsVersion: 3,
        status: InvestmentStatus.INITIATED,
      }),
    );
    expect(investment.investmentNumber).toBe("FD-INV-000001");
  });

  it("rejects amounts below minimum", async () => {
    await expect(
      createInvestment({
        projectId: PROJECT_ID,
        investorId: INVESTOR_ID,
        amountMinor: 100,
      }),
    ).rejects.toMatchObject({ code: "BELOW_MINIMUM" });
  });

  it("rejects amounts above maximum", async () => {
    await expect(
      createInvestment({
        projectId: PROJECT_ID,
        investorId: INVESTOR_ID,
        amountMinor: 200_000_00,
      }),
    ).rejects.toMatchObject({ code: "ABOVE_MAXIMUM" });
  });

  it("rejects when opportunity is not investable", async () => {
    isOpportunityCurrentlyInvestableMock.mockReturnValue(false);
    await expect(
      createInvestment({
        projectId: PROJECT_ID,
        investorId: INVESTOR_ID,
        amountMinor: 25_000_00,
      }),
    ).rejects.toMatchObject({ code: "OPPORTUNITY_CLOSED" });
  });

  it("rejects unpublished projects", async () => {
    projectFindByIdMock.mockResolvedValue({
      _id: PROJECT_ID,
      status: ProjectStatus.DRAFT,
    });
    await expect(
      createInvestment({
        projectId: PROJECT_ID,
        investorId: INVESTOR_ID,
        amountMinor: 25_000_00,
      }),
    ).rejects.toMatchObject({ code: "PROJECT_NOT_INVESTABLE" });
  });

  it("generates unique padded investment numbers from sequence", async () => {
    getNextSequenceMock.mockResolvedValue(42);
    await createInvestment({
      projectId: PROJECT_ID,
      investorId: INVESTOR_ID,
      amountMinor: 25_000_00,
    });
    expect(investmentCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ investmentNumber: "FD-INV-000042" }),
    );
  });

  it("blocks investors from reading another investor's investment", async () => {
    investmentFindByIdMock.mockResolvedValue(mockInvestment());
    await expect(getInvestorInvestment(INV_ID, OTHER_INVESTOR)).rejects.toThrow(
      ApiError,
    );
  });

  it("confirms payment-success investments and reserves funding", async () => {
    const investment = mockInvestment({
      status: InvestmentStatus.PAYMENT_SUCCESS,
      paymentStatus: PaymentStatus.SUCCESS,
    });
    investmentFindByIdMock.mockResolvedValue(investment);
    tryReserveFundingMock.mockResolvedValue(true);

    const confirmed = await confirmInvestment(INV_ID);
    expect(tryReserveFundingMock).toHaveBeenCalledWith(OPP_ID, 25_000_00);
    expect(confirmed.status).toBe(InvestmentStatus.CONFIRMED);
  });

  it("fails when funding target is reached", async () => {
    const investment = mockInvestment({
      status: InvestmentStatus.PAYMENT_SUCCESS,
      paymentStatus: PaymentStatus.SUCCESS,
    });
    investmentFindByIdMock.mockResolvedValue(investment);
    tryReserveFundingMock.mockResolvedValue(false);

    await expect(confirmInvestment(INV_ID)).rejects.toMatchObject({
      code: "FUNDING_TARGET_REACHED",
    });
    expect(investment.status).toBe(InvestmentStatus.FAILED);
  });

  it("lists only the requesting investor's investments and scopes status groups", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue([mockInvestment()]),
    };
    investmentFindMock.mockReturnValue(chain);
    investmentCountDocumentsMock.mockResolvedValue(1);

    const result = await listInvestorInvestments(INVESTOR_ID, {
      page: 1,
      limit: 12,
      status: "pending",
      search: "",
    });

    expect(result.total).toBe(1);
    expect(investmentFindMock).toHaveBeenCalledWith({
      investor: INVESTOR_ID,
      status: {
        $in: [InvestmentStatus.INITIATED, InvestmentStatus.PAYMENT_PENDING],
      },
    });
    expect(chain.limit).toHaveBeenCalledWith(12);
  });

  it("returns an empty investor list when project search matches nothing", async () => {
    projectFindMock.mockReturnValue({
      select: vi.fn().mockResolvedValue([]),
    });

    const result = await listInvestorInvestments(INVESTOR_ID, {
      page: 1,
      limit: 12,
      status: "all",
      search: "no-such-idea",
    });

    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(investmentFindMock).not.toHaveBeenCalled();
  });

  it("scopes project title search to matching project ids for that investor", async () => {
    projectFindMock.mockReturnValue({
      select: vi.fn().mockResolvedValue([{ _id: PROJECT_ID }]),
    });
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue([]),
    };
    investmentFindMock.mockReturnValue(chain);
    investmentCountDocumentsMock.mockResolvedValue(0);

    await listInvestorInvestments(INVESTOR_ID, {
      page: 1,
      limit: 12,
      status: "confirmed",
      search: "CareVision",
    });

    expect(investmentFindMock).toHaveBeenCalledWith({
      investor: INVESTOR_ID,
      status: { $in: [InvestmentStatus.CONFIRMED] },
      project: { $in: [PROJECT_ID] },
    });
  });

  it("returns distinct backed project ids for the investor", async () => {
    investmentDistinctMock.mockResolvedValue([PROJECT_ID]);
    await expect(getInvestorBackedProjectIds(INVESTOR_ID)).resolves.toEqual([PROJECT_ID]);
    expect(investmentDistinctMock).toHaveBeenCalledWith("project", {
      investor: INVESTOR_ID,
    });
  });

  it("includes failed counts in investor stats", async () => {
    investmentCountDocumentsMock
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1);
    investmentAggregateMock.mockResolvedValue([{ total: 50_000_00 }]);

    const stats = await getInvestorInvestmentStats(INVESTOR_ID);

    expect(stats).toEqual({
      total: 4,
      confirmed: 2,
      pending: 1,
      failed: 1,
      confirmedAmountMinor: 50_000_00,
    });
    expect(investmentCountDocumentsMock).toHaveBeenNthCalledWith(4, {
      investor: INVESTOR_ID,
      status: InvestmentStatus.FAILED,
    });
  });

  it("serializes populated project media without exposing investor internals beyond id", () => {
    const serialized = serializeInvestment(
      mockInvestment({
        project: {
          _id: { toString: () => PROJECT_ID },
          title: "CareVision AI",
          slug: "carevision-ai",
          coverImage: "https://cdn.example/cover.jpg",
          thumbnail: null,
          primaryCategory: {
            _id: { toString: () => "cat-1" },
            name: "Healthcare",
            slug: "healthcare",
          },
          categories: [],
        },
      }) as never,
    );

    expect(serialized.project).toMatchObject({
      title: "CareVision AI",
      coverImage: "https://cdn.example/cover.jpg",
    });
    expect(serialized).not.toHaveProperty("paymentOrder");
  });

  it("lists admin investments without scoping to an investor id", async () => {
    const chain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
    };
    chain.populate.mockReturnValueOnce(chain).mockResolvedValueOnce([]);
    investmentFindMock.mockReturnValue(chain);
    investmentCountDocumentsMock.mockResolvedValue(0);

    await listAdminInvestments({
      page: 1,
      limit: 10,
      search: "INV-1",
      status: InvestmentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
    });

    expect(investmentFindMock).toHaveBeenCalledWith({
      status: InvestmentStatus.CONFIRMED,
      paymentStatus: PaymentStatus.SUCCESS,
      investmentNumber: { $regex: "INV-1", $options: "i" },
    });
    expect(investmentFindMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ investor: expect.anything() }),
    );
  });
});
