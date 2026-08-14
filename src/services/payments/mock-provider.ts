import { createHmac, timingSafeEqual } from "crypto";

import { CurrencyCode, isCurrencyCode } from "@/constants/currency";
import { PaymentStatus } from "@/constants/payment-status";
import { ApiError } from "@/lib/api/errors";
import type {
  CreatePaymentOrderInput,
  CreatePaymentOrderResult,
  ParsedWebhookEvent,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "@/services/payments/types";

/**
 * Development-only payment provider.
 * Simulates order creation, success/failure, and signed webhooks.
 * Must never be used in production.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  constructor(private readonly webhookSecret: string) {
    if (!webhookSecret) {
      throw new ApiError(
        500,
        "MOCK_PAYMENT_WEBHOOK_SECRET is required for the mock payment provider",
        "PAYMENT_CONFIG",
      );
    }
  }

  async createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult> {
    const providerOrderId = `mock_order_${input.investmentId}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    return {
      provider: this.name,
      providerOrderId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      checkout: {
        mode: "mock_redirect",
        redirectUrl: `${appUrl}/payments/mock/checkout?orderId=${encodeURIComponent(providerOrderId)}&investmentId=${encodeURIComponent(input.investmentId)}`,
        clientToken: providerOrderId,
      },
      metadata: {
        investmentNumber: input.investmentNumber,
      },
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const outcome =
      typeof input.payload?.outcome === "string" ? input.payload.outcome : "success";

    if (outcome === "failure") {
      return {
        provider: this.name,
        providerOrderId: input.providerOrderId,
        providerPaymentId: input.providerPaymentId ?? `mock_pay_fail_${input.providerOrderId}`,
        amountMinor: Number(input.payload?.amountMinor ?? 0),
        currency: isCurrencyCode(input.payload?.currency)
          ? input.payload.currency
          : CurrencyCode.INR,
        status: PaymentStatus.FAILED,
        failureCode: "MOCK_FAILURE",
        failureMessage: "Mock payment failed",
      };
    }

    return {
      provider: this.name,
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId ?? `mock_pay_${input.providerOrderId}`,
      providerTransactionId: `mock_txn_${input.providerOrderId}`,
      amountMinor: Number(input.payload?.amountMinor ?? 0),
      currency: isCurrencyCode(input.payload?.currency)
        ? input.payload.currency
        : CurrencyCode.INR,
      status: PaymentStatus.SUCCESS,
    };
  }

  async parseWebhook(
    headers: Headers | Record<string, string>,
    body: unknown,
  ): Promise<ParsedWebhookEvent> {
    const payload = body as Record<string, unknown>;
    const signature = getHeader(headers, "x-mock-signature");
    const raw = JSON.stringify(payload ?? {});

    if (!signature || !this.verifySignature(raw, signature)) {
      throw new ApiError(401, "Invalid webhook signature", "INVALID_WEBHOOK");
    }

    const eventId = String(payload.eventId ?? "");
    const eventType = String(payload.eventType ?? "payment.updated");
    const providerOrderId = String(payload.providerOrderId ?? "");
    const providerPaymentId = String(payload.providerPaymentId ?? "");
    const amountMinor = Number(payload.amountMinor);
    const currency = payload.currency;

    if (!eventId || !providerOrderId || !providerPaymentId) {
      throw new ApiError(400, "Invalid webhook payload", "INVALID_WEBHOOK");
    }
    if (!Number.isInteger(amountMinor) || amountMinor < 1) {
      throw new ApiError(400, "Invalid webhook amount", "INVALID_WEBHOOK");
    }
    if (!isCurrencyCode(currency)) {
      throw new ApiError(400, "Invalid webhook currency", "INVALID_WEBHOOK");
    }

    const statusRaw = String(payload.status ?? "SUCCESS");
    const status =
      statusRaw === "FAILED"
        ? PaymentStatus.FAILED
        : statusRaw === "CANCELLED"
          ? PaymentStatus.CANCELLED
          : statusRaw === "REFUNDED"
            ? PaymentStatus.REFUNDED
            : statusRaw === "PENDING"
              ? PaymentStatus.PENDING
              : PaymentStatus.SUCCESS;

    return {
      provider: this.name,
      eventId,
      eventType,
      providerOrderId,
      providerPaymentId,
      providerTransactionId:
        typeof payload.providerTransactionId === "string"
          ? payload.providerTransactionId
          : undefined,
      amountMinor,
      currency,
      status,
      failureCode:
        typeof payload.failureCode === "string" ? payload.failureCode : undefined,
      failureMessage:
        typeof payload.failureMessage === "string" ? payload.failureMessage : undefined,
      raw: payload,
    };
  }

  async getPaymentStatus(providerPaymentId: string): Promise<VerifyPaymentResult> {
    return {
      provider: this.name,
      providerOrderId: providerPaymentId.replace("mock_pay_", "mock_order_"),
      providerPaymentId,
      amountMinor: 0,
      currency: CurrencyCode.INR,
      status: PaymentStatus.SUCCESS,
    };
  }

  async refundPayment(): Promise<never> {
    throw new ApiError(501, "Refunds are not implemented yet", "NOT_IMPLEMENTED");
  }

  signPayload(payload: string): string {
    return createHmac("sha256", this.webhookSecret).update(payload).digest("hex");
  }

  private verifySignature(payload: string, signature: string): boolean {
    const expected = this.signPayload(payload);
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}

function getHeader(
  headers: Headers | Record<string, string>,
  name: string,
): string | null {
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(name);
  }
  const record = headers as Record<string, string>;
  return record[name] ?? record[name.toLowerCase()] ?? null;
}
