import mongoose from "mongoose";

import { InvestmentStatus } from "@/constants/investment-status";
import { PaymentStatus } from "@/constants/payment-status";
import { ApiError } from "@/lib/api/errors";
import { writeAuditLog } from "@/services/audit.service";
import {
  confirmInvestment,
  failInvestment,
  getInvestmentById,
  transitionInvestmentStatus,
} from "@/services/investment.service";
import { getPaymentProvider } from "@/services/payments";
import type { ParsedWebhookEvent } from "@/services/payments/types";
import { PaymentOrder } from "@/models/PaymentOrder";
import { PaymentTransaction } from "@/models/PaymentTransaction";
import { WebhookEvent } from "@/models/WebhookEvent";

export async function createPaymentOrderForInvestment(investmentId: string) {
  const investment = await getInvestmentById(investmentId);

  if (
    investment.status !== InvestmentStatus.INITIATED &&
    investment.status !== InvestmentStatus.PAYMENT_PENDING
  ) {
    throw new ApiError(
      400,
      "Payment cannot be created for this investment state",
      "INVALID_STATE",
    );
  }

  const existing = await PaymentOrder.findOne({
    investment: investmentId,
    status: { $in: [PaymentStatus.CREATED, PaymentStatus.PENDING] },
  });

  if (existing) {
    const provider = getPaymentProvider();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return {
      order: existing,
      checkout: {
        mode: "mock_redirect" as const,
        redirectUrl: `${appUrl}/payments/mock/checkout?orderId=${encodeURIComponent(existing.providerOrderId)}&investmentId=${encodeURIComponent(investmentId)}`,
        clientToken: existing.providerOrderId,
      },
      provider: provider.name,
      reused: true,
    };
  }

  const provider = getPaymentProvider();
  const created = await provider.createOrder({
    investmentId: investment._id.toString(),
    investmentNumber: investment.investmentNumber,
    amountMinor: investment.amountMinor,
    currency: investment.currency,
  });

  if (created.amountMinor !== investment.amountMinor || created.currency !== investment.currency) {
    throw new ApiError(500, "Provider returned mismatched amount/currency", "PAYMENT_MISMATCH");
  }

  let order;
  try {
    order = await PaymentOrder.create({
      investment: investment._id,
      provider: created.provider,
      providerOrderId: created.providerOrderId,
      amountMinor: created.amountMinor,
      currency: created.currency,
      status: PaymentStatus.CREATED,
      metadata: created.metadata ?? {},
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      const reused = await PaymentOrder.findOne({ investment: investmentId });
      if (reused) {
        return {
          order: reused,
          checkout: created.checkout,
          provider: created.provider,
          reused: true,
        };
      }
    }
    throw error;
  }

  investment.paymentOrder = order._id;
  investment.paymentStatus = PaymentStatus.CREATED;
  await transitionInvestmentStatus(investment, InvestmentStatus.PAYMENT_PENDING);

  await writeAuditLog({
    actorType: "SYSTEM",
    action: "payment_order.created",
    entityType: "PaymentOrder",
    entityId: order._id.toString(),
    metadata: {
      investmentNumber: investment.investmentNumber,
      providerOrderId: order.providerOrderId,
    },
  });

  return {
    order,
    checkout: created.checkout,
    provider: created.provider,
    reused: false,
  };
}

export async function processPaymentWebhook(
  providerName: string,
  headers: Headers | Record<string, string>,
  body: unknown,
) {
  const provider = getPaymentProvider();
  if (provider.name !== providerName) {
    throw new ApiError(400, "Unknown payment provider", "INVALID_PROVIDER");
  }

  const event = await provider.parseWebhook(headers, body);

  try {
    await WebhookEvent.create({
      provider: event.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      status: "PROCESSED",
      processedAt: new Date(),
      metadata: {
        providerOrderId: event.providerOrderId,
        providerPaymentId: event.providerPaymentId,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return { duplicate: true, processed: false };
    }
    throw error;
  }

  await applyPaymentEvent(event);
  return { duplicate: false, processed: true };
}

async function applyPaymentEvent(event: ParsedWebhookEvent) {
  const order = await PaymentOrder.findOne({
    provider: event.provider,
    providerOrderId: event.providerOrderId,
  });

  if (!order) {
    throw new ApiError(404, "Payment order not found", "ORDER_NOT_FOUND");
  }

  if (order.amountMinor !== event.amountMinor || order.currency !== event.currency) {
    throw new ApiError(400, "Webhook amount/currency mismatch", "PAYMENT_MISMATCH");
  }

  const investment = await getInvestmentById(order.investment.toString());

  if (investment.status === InvestmentStatus.CONFIRMED) {
    return investment;
  }

  let transaction = await PaymentTransaction.findOne({
    provider: event.provider,
    providerPaymentId: event.providerPaymentId,
  });

  if (!transaction) {
    transaction = await PaymentTransaction.create({
      investment: investment._id,
      paymentOrder: order._id,
      provider: event.provider,
      providerPaymentId: event.providerPaymentId,
      providerTransactionId: event.providerTransactionId ?? null,
      amountMinor: event.amountMinor,
      currency: event.currency,
      status: event.status,
      failureCode: event.failureCode ?? null,
      failureMessage: event.failureMessage ?? null,
      processedAt: new Date(),
    });
  }

  investment.paymentTransaction = transaction._id;
  order.status = event.status;
  await order.save();

  if (event.status === PaymentStatus.SUCCESS) {
    investment.paymentStatus = PaymentStatus.SUCCESS;
    if (investment.status === InvestmentStatus.PAYMENT_PENDING) {
      await transitionInvestmentStatus(investment, InvestmentStatus.PAYMENT_SUCCESS);
    }
    await confirmInvestment(investment._id.toString());
    return;
  }

  if (
    event.status === PaymentStatus.FAILED ||
    event.status === PaymentStatus.CANCELLED
  ) {
    await failInvestment(investment._id.toString(), event.failureMessage);
  }
}

export async function verifyAndCompleteMockPayment(input: {
  investmentId: string;
  providerOrderId: string;
  outcome: "success" | "failure";
}) {
  const investment = await getInvestmentById(input.investmentId);
  const order = await PaymentOrder.findOne({
    investment: investment._id,
    providerOrderId: input.providerOrderId,
  });

  if (!order) {
    throw new ApiError(404, "Payment order not found", "ORDER_NOT_FOUND");
  }

  const provider = getPaymentProvider();
  const verified = await provider.verifyPayment({
    providerOrderId: input.providerOrderId,
    payload: {
      outcome: input.outcome,
      amountMinor: order.amountMinor,
      currency: order.currency,
    },
  });

  // Simulate webhook delivery for mock provider (idempotent via WebhookEvent)
  const eventId = `mock_evt_${verified.providerPaymentId}_${input.outcome}`;
  const body = {
    eventId,
    eventType: input.outcome === "success" ? "payment.succeeded" : "payment.failed",
    providerOrderId: verified.providerOrderId,
    providerPaymentId: verified.providerPaymentId,
    providerTransactionId: verified.providerTransactionId,
    amountMinor: order.amountMinor,
    currency: order.currency,
    status: verified.status,
    failureCode: verified.failureCode,
    failureMessage: verified.failureMessage,
  };

  const { MockPaymentProvider } = await import("@/services/payments/mock-provider");
  if (!(provider instanceof MockPaymentProvider)) {
    throw new ApiError(400, "Manual verify is only available for mock provider", "INVALID_PROVIDER");
  }

  const payload = JSON.stringify(body);
  const signature = provider.signPayload(payload);

  return processPaymentWebhook(provider.name, { "x-mock-signature": signature }, body);
}

export function serializePaymentOrder(order: mongoose.Document & {
  _id: mongoose.Types.ObjectId;
  provider: string;
  providerOrderId: string;
  amountMinor: number;
  currency: string;
  status: string;
}) {
  return {
    id: order._id.toString(),
    provider: order.provider,
    providerOrderId: order.providerOrderId,
    amountMinor: order.amountMinor,
    currency: order.currency,
    status: order.status,
  };
}
