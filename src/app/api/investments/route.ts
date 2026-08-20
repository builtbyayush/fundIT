import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import {
  createInvestmentSchema,
  investorInvestmentListQuerySchema,
} from "@/lib/validations/investment";
import {
  createInvestment,
  listInvestorInvestments,
  serializeInvestment,
} from "@/services/investment.service";
import { createPaymentOrderForInvestment } from "@/services/payment.service";

export async function GET(request: Request) {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = investorInvestmentListQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
      status: searchParams.get("status") ?? "all",
      search: searchParams.get("search") ?? "",
    });

    const result = await listInvestorInvestments(investor.id, query);

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

export async function POST(request: Request) {
  try {
    const investor = await requireRole(UserRole.INVESTOR);
    await connectToDatabase();

    const body = await request.json();
    const input = createInvestmentSchema.parse(body);
    const investment = await createInvestment({
      projectId: input.projectId,
      investorId: investor.id,
      amountMinor: input.amountMinor,
    });

    const payment = await createPaymentOrderForInvestment(investment._id.toString());

    return NextResponse.json(
      successResponse({
        investment: serializeInvestment(investment),
        payment: {
          provider: payment.provider,
          checkout: payment.checkout,
          reused: payment.reused,
        },
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
