import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import {
  getInvestorInvestment,
  serializeInvestment,
} from "@/services/investment.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();
    const { id } = await context.params;
    const investment = await getInvestorInvestment(id, investor.id);
    await investment.populate("project", "title slug");
    return NextResponse.json(successResponse(serializeInvestment(investment)));
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(errorResponse(error.message, error.code), {
        status: error.statusCode,
      });
    }
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(apiError, { status });
  }
}
