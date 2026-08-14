import type { CurrencyCode } from "@/constants/currency";
import type { PaymentStatus } from "@/constants/payment-status";

export interface CreatePaymentOrderInput {
  investmentId: string;
  investmentNumber: string;
  amountMinor: number;
  currency: CurrencyCode;
  metadata?: Record<string, unknown>;
}

export interface CreatePaymentOrderResult {
  provider: string;
  providerOrderId: string;
  amountMinor: number;
  currency: CurrencyCode;
  checkout: {
    /** Opaque token/URL info for client checkout handoff */
    mode: "mock_redirect" | "provider_redirect" | "provider_sdk";
    redirectUrl?: string;
    clientToken?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface VerifyPaymentInput {
  providerOrderId: string;
  providerPaymentId?: string;
  payload?: Record<string, unknown>;
}

export interface VerifyPaymentResult {
  provider: string;
  providerOrderId: string;
  providerPaymentId: string;
  providerTransactionId?: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: Extract<PaymentStatus, "SUCCESS" | "FAILED" | "PENDING">;
  failureCode?: string;
  failureMessage?: string;
}

export interface ParsedWebhookEvent {
  provider: string;
  eventId: string;
  eventType: string;
  providerOrderId: string;
  providerPaymentId: string;
  providerTransactionId?: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: Extract<PaymentStatus, "SUCCESS" | "FAILED" | "PENDING" | "CANCELLED" | "REFUNDED">;
  failureCode?: string;
  failureMessage?: string;
  raw?: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createOrder(input: CreatePaymentOrderInput): Promise<CreatePaymentOrderResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  parseWebhook(
    headers: Headers | Record<string, string>,
    body: unknown,
  ): Promise<ParsedWebhookEvent>;
  getPaymentStatus(providerPaymentId: string): Promise<VerifyPaymentResult>;
  refundPayment(providerPaymentId: string): Promise<never>;
}
