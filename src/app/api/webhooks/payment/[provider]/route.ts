import { NextResponse } from "next/server";

import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { processPaymentWebhook } from "@/services/payment.service";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * Payment provider webhooks — no session auth.
 * Signature verification is performed by the provider adapter.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { provider } = await context.params;
    const body = await request.json();

    const result = await processPaymentWebhook(provider, request.headers, body);
    return NextResponse.json(successResponse(result));
  } catch (error) {
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 400;
    return NextResponse.json(
      error instanceof ApiError
        ? errorResponse(error.message, error.code)
        : apiError,
      { status },
    );
  }
}
