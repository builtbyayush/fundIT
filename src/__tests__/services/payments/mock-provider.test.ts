import { describe, expect, it } from "vitest";

import { MockPaymentProvider } from "@/services/payments/mock-provider";
import { getPaymentProvider } from "@/services/payments";
import { CurrencyCode } from "@/constants/currency";
import { PaymentStatus } from "@/constants/payment-status";

describe("MockPaymentProvider", () => {
  it("creates deterministic mock orders", async () => {
    const provider = new MockPaymentProvider("secret");
    const order = await provider.createOrder({
      investmentId: "inv1",
      investmentNumber: "FD-INV-000001",
      amountMinor: 10000,
      currency: CurrencyCode.INR,
    });

    expect(order.provider).toBe("mock");
    expect(order.providerOrderId).toBe("mock_order_inv1");
    expect(order.checkout.mode).toBe("mock_redirect");
  });

  it("verifies success and failure outcomes", async () => {
    const provider = new MockPaymentProvider("secret");
    const ok = await provider.verifyPayment({
      providerOrderId: "mock_order_1",
      payload: { outcome: "success", amountMinor: 1000, currency: "INR" },
    });
    expect(ok.status).toBe(PaymentStatus.SUCCESS);

    const fail = await provider.verifyPayment({
      providerOrderId: "mock_order_1",
      payload: { outcome: "failure", amountMinor: 1000, currency: "INR" },
    });
    expect(fail.status).toBe(PaymentStatus.FAILED);
  });

  it("rejects unsigned webhooks", async () => {
    const provider = new MockPaymentProvider("secret");
    await expect(
      provider.parseWebhook(
        {},
        {
          eventId: "e1",
          providerOrderId: "o1",
          providerPaymentId: "p1",
          amountMinor: 100,
          currency: "INR",
        },
      ),
    ).rejects.toMatchObject({ code: "INVALID_WEBHOOK" });
  });
});

describe("getPaymentProvider registry", () => {
  it("returns mock provider outside production", () => {
    const prev = process.env.PAYMENT_PROVIDER;
    process.env.PAYMENT_PROVIDER = "mock";
    process.env.MOCK_PAYMENT_WEBHOOK_SECRET = "secret";

    expect(getPaymentProvider().name).toBe("mock");

    process.env.PAYMENT_PROVIDER = prev;
  });
});
