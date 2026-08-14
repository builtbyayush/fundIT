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
const investmentCreateMock = vi.fn();
const investmentFindByIdMock = vi.fn();
const getNextSequenceMock = vi.fn();
const getOpportunityByProjectIdMock = vi.fn();
const isOpportunityCurrentlyInvestableMock = vi.fn();
const writeAuditLogMock = vi.fn();
const tryReserveFundingMock = vi.fn();
const releaseFundingReservationMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    findById: (...args: unknown[]) => projectFindByIdMock(...args),
  },
}));

vi.mock("@/models/Investment", () => ({
  Investment: {
    create: (...args: unknown[]) => investmentCreateMock(...args),
    findById: (...args: unknown[]) => investmentFindByIdMock(...args),
    countDocuments: vi.fn(),
    find: vi.fn(),
    aggregate: vi.fn(),
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
  getInvestorInvestment,
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
});
