import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { projectInputSchema } from "@/lib/validations/project";
import {
  getProjectById,
  serializeAdminProject,
  updateProject,
} from "@/services/project.service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const { id } = await context.params;
    const project = await getProjectById(id);
    await project.populate(["categories", "primaryCategory", "createdBy"]);
    return NextResponse.json(successResponse(serializeAdminProject(project)));
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
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const { id } = await context.params;
    const body = await request.json();
    const input = projectInputSchema.parse(body);
    const project = await updateProject(id, input);
    await project.populate(["categories", "primaryCategory", "createdBy"]);
    return NextResponse.json(successResponse(serializeAdminProject(project)));
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
