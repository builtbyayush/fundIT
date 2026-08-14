import { ApiError } from "@/lib/api/errors";
import { MockPaymentProvider } from "@/services/payments/mock-provider";
import type { PaymentProvider } from "@/services/payments/types";

/**
 * Resolves the configured payment provider.
 * Mock is blocked in production.
 */
export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER ?? "mock").toLowerCase();

  if (name === "mock") {
    if (process.env.NODE_ENV === "production") {
      throw new ApiError(
        500,
        "Mock payment provider cannot be used in production",
        "PAYMENT_CONFIG",
      );
    }

    return new MockPaymentProvider(
      process.env.MOCK_PAYMENT_WEBHOOK_SECRET ?? "dev-mock-webhook-secret",
    );
  }

  throw new ApiError(
    500,
    `Payment provider "${name}" is not configured. Production gateway selection is pending client confirmation.`,
    "PAYMENT_CONFIG",
  );
}
