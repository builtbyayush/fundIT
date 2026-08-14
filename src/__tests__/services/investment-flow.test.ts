import { beforeEach, describe, expect, it, vi } from "vitest";

import { CurrencyCode } from "@/constants/currency";
import { InvestmentStatus } from "@/constants/investment-status";
import { OpportunityStatus } from "@/constants/opportunity-status";
import { PaymentStatus } from "@/constants/payment-status";
import { ProjectStatus } from "@/constants/project-status";
import { MockPaymentProvider } from "@/services/payments/mock-provider";

const PROJECT_ID = "507f1f77bcf86cd799439011";
const INVESTOR_ID = "507f1f77bcf86cd799439012";
const OPP_ID = "507f1f77bcf86cd799439013";
const INV_ID = "507f1f77bcf86cd799439014";
const ORDER_ID = "507f1f77bcf86cd799439015";

const projectFindByIdMock = vi.fn();
const investmentCreateMock = vi.fn();
const investmentFindByIdMock = vi.fn();
const getNextSequenceMock = vi.fn();
const opportunityFindOneMock = vi.fn();
const opportunityUpdateOneMock = vi.fn();
const opportunityFindByIdMock = vi.fn();
const writeAuditLogMock = vi.fn();
const paymentOrderFindOneMock = vi.fn();
const paymentOrderCreateMock = vi.fn();
const paymentTransactionFindOneMock = vi.fn();
const paymentTransactionCreateMock = vi.fn();
const webhookEventCreateMock = vi.fn();

vi.mock("@/models/Project", () => ({
  Project: {
    findById: (...args: unknown[]) => projectFindByIdMock(...args),
  },
}));

vi.mock("@/models/Investment", () => ({
  Investment: {
    create: (...args: unknown[]) => investmentCreateMock(...args),
    findById: (...args: unknown[]) => investmentFindByIdMock(...args),
  },
}));

vi.mock("@/models/Counter", () => ({
  getNextSequence: (...args: unknown[]) => getNextSequenceMock(...args),
}));

vi.mock("@/models/InvestmentOpportunity", () => ({
  InvestmentOpportunity: {
    findOne: (...args: unknown[]) => opportunityFindOneMock(...args),
    findById: (...args: unknown[]) => opportunityFindByIdMock(...args),
    updateOne: (...args: unknown[]) => opportunityUpdateOneMock(...args),
  },
}));

vi.mock("@/services/audit.service", () => ({
  writeAuditLog: (...args: unknown[]) => writeAuditLogMock(...args),
}));

vi.mock("@/models/PaymentOrder", () => ({
  PaymentOrder: {
    findOne: (...args: unknown[]) => paymentOrderFindOneMock(...args),
    create: (...args: unknown[]) => paymentOrderCreateMock(...args),
  },
}));

vi.mock("@/models/PaymentTransaction", () => ({
  PaymentTransaction: {
    findOne: (...args: unknown[]) => paymentTransactionFindOneMock(...args),
    create: (...args: unknown[]) => paymentTransactionCreateMock(...args),
  },
}));

vi.mock("@/models/WebhookEvent", () => ({
  WebhookEvent: {
    create: (...args: unknown[]) => webhookEventCreateMock(...args),
  },
}));

vi.mock("@/services/payments", () => {
  const provider = new MockPaymentProvider("flow-secret");
  return {
    getPaymentProvider: () => provider,
  };
});

import { createInvestment } from "@/services/investment.service";
import {
  createPaymentOrderForInvestment,
  processPaymentWebhook,
} from "@/services/payment.service";
import { getPaymentProvider } from "@/services/payments";

describe("investment payment flow (integration-style)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    writeAuditLogMock.mockResolvedValue(undefined);
    getNextSequenceMock.mockResolvedValue(7);

    projectFindByIdMock.mockResolvedValue({
      _id: { toString: () => PROJECT_ID },
      status: ProjectStatus.PUBLISHED,
    });

    opportunityFindOneMock.mockResolvedValue({
      _id: { toString: () => OPP_ID },
      status: OpportunityStatus.OPEN,
      currency: CurrencyCode.INR,
      minimumInvestment: { amountMinor: 10_000_00, currency: CurrencyCode.INR },
      maximumInvestment: null,
      fundingTarget: { amountMinor: 1_000_000_00, currency: CurrencyCode.INR },
      committedAmountMinor: 0,
      termsVersion: 1,
      startDate: null,
      endDate: null,
    });

    const investmentState = {
      _id: { toString: () => INV_ID },
      investmentNumber: "FD-INV-000007",
      investor: { toString: () => INVESTOR_ID },
      opportunity: { toString: () => OPP_ID },
      project: PROJECT_ID,
      amountMinor: 20_000_00,
      currency: CurrencyCode.INR,
      status: InvestmentStatus.INITIATED,
      paymentStatus: PaymentStatus.NOT_STARTED,
      paymentOrder: null as unknown,
      paymentTransaction: null as unknown,
      termsVersion: 1,
      initiatedAt: new Date(),
      save: vi.fn().mockResolvedValue(undefined),
    };

    investmentCreateMock.mockResolvedValue(investmentState);
    investmentFindByIdMock.mockImplementation(async () => investmentState);

    opportunityFindByIdMock.mockResolvedValue({
      _id: OPP_ID,
      fundingTarget: { amountMinor: 1_000_000_00, currency: CurrencyCode.INR },
      committedAmountMinor: 0,
    });
    opportunityUpdateOneMock.mockResolvedValue({ modifiedCount: 1 });

    paymentOrderFindOneMock.mockResolvedValue(null);
    paymentOrderCreateMock.mockImplementation(async (data) => ({
      _id: { toString: () => ORDER_ID },
      ...data,
      save: vi.fn().mockResolvedValue(undefined),
    }));
    paymentTransactionFindOneMock.mockResolvedValue(null);
    paymentTransactionCreateMock.mockResolvedValue({
      _id: { toString: () => "txn-1" },
    });
    webhookEventCreateMock.mockResolvedValue({});
  });

  it("chains create → order → webhook success → confirmed + funding reserve", async () => {
    const investment = await createInvestment({
      projectId: PROJECT_ID,
      investorId: INVESTOR_ID,
      amountMinor: 20_000_00,
    });
    expect(investment.investmentNumber).toBe("FD-INV-000007");

    const payment = await createPaymentOrderForInvestment(INV_ID);
    expect(payment.checkout.mode).toBe("mock_redirect");
    expect(investment.status).toBe(InvestmentStatus.PAYMENT_PENDING);

    // Active order lookup for webhook application
    paymentOrderFindOneMock.mockResolvedValue({
      _id: { toString: () => ORDER_ID },
      investment: { toString: () => INV_ID },
      provider: "mock",
      providerOrderId: `mock_order_${INV_ID}`,
      amountMinor: 20_000_00,
      currency: CurrencyCode.INR,
      status: PaymentStatus.CREATED,
      save: vi.fn().mockResolvedValue(undefined),
    });

    const provider = getPaymentProvider() as MockPaymentProvider;
    const body = {
      eventId: "evt_flow_1",
      eventType: "payment.succeeded",
      providerOrderId: `mock_order_${INV_ID}`,
      providerPaymentId: `mock_pay_${INV_ID}`,
      amountMinor: 20_000_00,
      currency: CurrencyCode.INR,
      status: PaymentStatus.SUCCESS,
    };
    const signature = provider.signPayload(JSON.stringify(body));

    const result = await processPaymentWebhook(
      "mock",
      { "x-mock-signature": signature },
      body,
    );

    expect(result.processed).toBe(true);
    expect(investment.status).toBe(InvestmentStatus.CONFIRMED);
    expect(opportunityUpdateOneMock).toHaveBeenCalled();

    // Duplicate webhook must not double-confirm / double-inc
    const dupError = Object.assign(new Error("dup"), { code: 11000 });
    webhookEventCreateMock.mockRejectedValueOnce(dupError);
    const dup = await processPaymentWebhook(
      "mock",
      { "x-mock-signature": signature },
      body,
    );
    expect(dup).toEqual({ duplicate: true, processed: false });
  });
});
