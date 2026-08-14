import { NextResponse } from "next/server";

import { ApiError, errorResponse, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import {
  getPublishedProjectBySlug,
  serializePublicProject,
} from "@/services/project.service";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await connectToDatabase();
    const { slug } = await context.params;
    const project = await getPublishedProjectBySlug(slug);
    if (!project) {
      return NextResponse.json(errorResponse("Project not found", "NOT_FOUND"), {
        status: 404,
      });
    }
    return NextResponse.json(successResponse(serializePublicProject(project)));
  } catch (error) {
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(apiError, { status });
  }
}
