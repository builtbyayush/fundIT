import { NextResponse } from "next/server";
import { z } from "zod";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { getInvestorInvestment } from "@/services/investment.service";
import { verifyAndCompleteMockPayment } from "@/services/payment.service";

const bodySchema = z.object({
  investmentId: z.string().min(1),
  providerOrderId: z.string().min(1),
  outcome: z.enum(["success", "failure"]).default("success"),
});

export async function POST(request: Request) {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const body = bodySchema.parse(await request.json());
    await getInvestorInvestment(body.investmentId, investor.id);

    const result = await verifyAndCompleteMockPayment(body);
    return NextResponse.json(successResponse(result));
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
