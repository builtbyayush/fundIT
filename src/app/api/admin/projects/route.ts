import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { adminProjectListQuerySchema, projectInputSchema } from "@/lib/validations/project";
import {
  createProject,
  listAdminProjects,
  serializeAdminProject,
} from "@/services/project.service";

export async function GET(request: Request) {
  try {
    await requireRole(UserRole.ADMIN);
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = adminProjectListQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 10,
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "",
      status: searchParams.get("status") ?? "",
    });

    const result = await listAdminProjects(query);
    return NextResponse.json(
      successResponse({
        ...result,
        items: result.items.map(serializeAdminProject),
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
    const user = await requireRole(UserRole.ADMIN);
    await connectToDatabase();
    const body = await request.json();
    const input = projectInputSchema.parse(body);
    const project = await createProject(input, user.id);
    await project.populate(["categories", "primaryCategory", "createdBy"]);
    return NextResponse.json(successResponse(serializeAdminProject(project)), {
      status: 201,
    });
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
