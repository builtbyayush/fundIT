import { beforeEach, describe, expect, it, vi } from "vitest";

import { InvestmentStatus } from "@/constants/investment-status";
import { PaymentStatus } from "@/constants/payment-status";
import { CurrencyCode } from "@/constants/currency";
import { MockPaymentProvider } from "@/services/payments/mock-provider";

const INV_ID = "507f1f77bcf86cd799439014";
const ORDER_ID = "507f1f77bcf86cd799439015";

const getInvestmentByIdMock = vi.fn();
const transitionInvestmentStatusMock = vi.fn();
const confirmInvestmentMock = vi.fn();
const failInvestmentMock = vi.fn();
const writeAuditLogMock = vi.fn();
const paymentOrderFindOneMock = vi.fn();
const paymentOrderCreateMock = vi.fn();
const paymentTransactionFindOneMock = vi.fn();
const paymentTransactionCreateMock = vi.fn();
const webhookEventCreateMock = vi.fn();
const getPaymentProviderMock = vi.fn();

vi.mock("@/services/investment.service", () => ({
  getInvestmentById: (...args: unknown[]) => getInvestmentByIdMock(...args),
  transitionInvestmentStatus: (...args: unknown[]) =>
    transitionInvestmentStatusMock(...args),
  confirmInvestment: (...args: unknown[]) => confirmInvestmentMock(...args),
  failInvestment: (...args: unknown[]) => failInvestmentMock(...args),
}));

vi.mock("@/services/audit.service", () => ({
  writeAuditLog: (...args: unknown[]) => writeAuditLogMock(...args),
}));

vi.mock("@/services/payments", () => ({
  getPaymentProvider: () => getPaymentProviderMock(),
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

import {
  createPaymentOrderForInvestment,
  processPaymentWebhook,
} from "@/services/payment.service";

function mockInvestment(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => INV_ID },
    investmentNumber: "FD-INV-000001",
    amountMinor: 25_000_00,
    currency: CurrencyCode.INR,
    status: InvestmentStatus.INITIATED,
    paymentStatus: PaymentStatus.NOT_STARTED,
    paymentOrder: null,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function mockOrder(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => ORDER_ID },
    investment: { toString: () => INV_ID },
    provider: "mock",
    providerOrderId: `mock_order_${INV_ID}`,
    amountMinor: 25_000_00,
    currency: CurrencyCode.INR,
    status: PaymentStatus.CREATED,
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("payment.service", () => {
  const provider = new MockPaymentProvider("test-secret");

  beforeEach(() => {
    vi.clearAllMocks();
    getPaymentProviderMock.mockReturnValue(provider);
    writeAuditLogMock.mockResolvedValue(undefined);
    transitionInvestmentStatusMock.mockImplementation(async (inv, next) => {
      inv.status = next;
      return inv;
    });
    confirmInvestmentMock.mockResolvedValue(
      mockInvestment({ status: InvestmentStatus.CONFIRMED }),
    );
    failInvestmentMock.mockResolvedValue(
      mockInvestment({ status: InvestmentStatus.FAILED }),
    );
  });

  it("creates a payment order and reuses an active one (idempotent)", async () => {
    const existing = mockOrder({ status: PaymentStatus.PENDING });
    paymentOrderFindOneMock.mockResolvedValueOnce(existing);
    getInvestmentByIdMock.mockResolvedValue(
      mockInvestment({ status: InvestmentStatus.PAYMENT_PENDING }),
    );

    const first = await createPaymentOrderForInvestment(INV_ID);
    expect(first.reused).toBe(true);
    expect(paymentOrderCreateMock).not.toHaveBeenCalled();

    paymentOrderFindOneMock.mockResolvedValueOnce(null);
    getInvestmentByIdMock.mockResolvedValue(mockInvestment());
    paymentOrderCreateMock.mockResolvedValue(mockOrder());

    const second = await createPaymentOrderForInvestment(INV_ID);
    expect(second.reused).toBe(false);
    expect(paymentOrderCreateMock).toHaveBeenCalled();
    expect(transitionInvestmentStatusMock).toHaveBeenCalledWith(
      expect.anything(),
      InvestmentStatus.PAYMENT_PENDING,
    );
  });

  it("processes success webhook to confirm investment", async () => {
    const investment = mockInvestment({ status: InvestmentStatus.PAYMENT_PENDING });
    getInvestmentByIdMock.mockResolvedValue(investment);
    paymentOrderFindOneMock.mockResolvedValue(mockOrder());
    paymentTransactionFindOneMock.mockResolvedValue(null);
    paymentTransactionCreateMock.mockResolvedValue({
      _id: { toString: () => "txn1" },
    });
    webhookEventCreateMock.mockResolvedValue({});

    const body = {
      eventId: "evt_1",
      eventType: "payment.succeeded",
      providerOrderId: `mock_order_${INV_ID}`,
      providerPaymentId: `mock_pay_${INV_ID}`,
      amountMinor: 25_000_00,
      currency: CurrencyCode.INR,
      status: PaymentStatus.SUCCESS,
    };
    const signature = provider.signPayload(JSON.stringify(body));

    const result = await processPaymentWebhook(
      "mock",
      { "x-mock-signature": signature },
      body,
    );

    expect(result).toEqual({ duplicate: false, processed: true });
    expect(confirmInvestmentMock).toHaveBeenCalledWith(INV_ID);
  });

  it("treats duplicate webhooks as no-op success", async () => {
    const dupError = Object.assign(new Error("dup"), { code: 11000 });
    webhookEventCreateMock.mockRejectedValue(dupError);

    const body = {
      eventId: "evt_1",
      eventType: "payment.succeeded",
      providerOrderId: `mock_order_${INV_ID}`,
      providerPaymentId: `mock_pay_${INV_ID}`,
      amountMinor: 25_000_00,
      currency: CurrencyCode.INR,
      status: PaymentStatus.SUCCESS,
    };
    const signature = provider.signPayload(JSON.stringify(body));

    const result = await processPaymentWebhook(
      "mock",
      { "x-mock-signature": signature },
      body,
    );

    expect(result).toEqual({ duplicate: true, processed: false });
    expect(confirmInvestmentMock).not.toHaveBeenCalled();
  });

  it("fails investment on payment failure webhook", async () => {
    const investment = mockInvestment({ status: InvestmentStatus.PAYMENT_PENDING });
    getInvestmentByIdMock.mockResolvedValue(investment);
    paymentOrderFindOneMock.mockResolvedValue(mockOrder());
    paymentTransactionFindOneMock.mockResolvedValue(null);
    paymentTransactionCreateMock.mockResolvedValue({
      _id: { toString: () => "txn1" },
    });
    webhookEventCreateMock.mockResolvedValue({});

    const body = {
      eventId: "evt_fail",
      eventType: "payment.failed",
      providerOrderId: `mock_order_${INV_ID}`,
      providerPaymentId: `mock_pay_fail_${INV_ID}`,
      amountMinor: 25_000_00,
      currency: CurrencyCode.INR,
      status: PaymentStatus.FAILED,
      failureMessage: "Mock payment failed",
    };
    const signature = provider.signPayload(JSON.stringify(body));

    await processPaymentWebhook("mock", { "x-mock-signature": signature }, body);

    expect(failInvestmentMock).toHaveBeenCalled();
    expect(confirmInvestmentMock).not.toHaveBeenCalled();
  });
});
