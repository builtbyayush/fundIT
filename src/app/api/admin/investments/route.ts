import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { adminInvestmentListQuerySchema } from "@/lib/validations/investment";
import {
  listAdminInvestments,
  serializeInvestment,
} from "@/services/investment.service";

export async function GET(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = adminInvestmentListQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      paymentStatus: searchParams.get("paymentStatus") ?? "",
    });

    const result = await listAdminInvestments(query);
    return NextResponse.json(
      successResponse({
        ...result,
        items: result.items.map(serializeInvestment),
      }),
    );
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
