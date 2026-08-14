import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { opportunityInputSchema } from "@/lib/validations/investment";
import {
  getOpportunityByProjectId,
  serializeOpportunity,
  upsertOpportunityForProject,
} from "@/services/opportunity.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const { id } = await context.params;
    const opportunity = await getOpportunityByProjectId(id);
    return NextResponse.json(
      successResponse(opportunity ? serializeOpportunity(opportunity) : null),
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

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const input = opportunityInputSchema.parse(body);
    const opportunity = await upsertOpportunityForProject(id, input, admin.id);
    return NextResponse.json(successResponse(serializeOpportunity(opportunity)));
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
