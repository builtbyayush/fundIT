import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import {
  createPaymentOrderForInvestment,
  serializePaymentOrder,
} from "@/services/payment.service";
import { getInvestorInvestment } from "@/services/investment.service";

const bodySchema = z.object({
  investmentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const body = bodySchema.parse(await request.json());
    // Ownership check — never trust client investorId
    await getInvestorInvestment(body.investmentId, investor.id);

    const payment = await createPaymentOrderForInvestment(body.investmentId);

    return NextResponse.json(
      successResponse({
        order: serializePaymentOrder(payment.order),
        checkout: payment.checkout,
        provider: payment.provider,
        reused: payment.reused,
      }),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(errorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 400;
    return NextResponse.json(apiError, { status });
  }
}
