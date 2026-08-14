import { NextResponse } from "next/server";

import { ApiError, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { publicProjectListQuerySchema } from "@/lib/validations/project";
import {
  listPublishedProjects,
  serializePublicProject,
} from "@/services/project.service";

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const query = publicProjectListQuerySchema.parse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 12,
      search: searchParams.get("search") ?? "",
      category: searchParams.get("category") ?? "",
      sort: searchParams.get("sort") ?? "newest",
    });

    const result = await listPublishedProjects(query);
    return NextResponse.json(
      successResponse({
        ...result,
        items: result.items.map(serializePublicProject),
      }),
    );
  } catch (error) {
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(apiError, { status });
  }
}
