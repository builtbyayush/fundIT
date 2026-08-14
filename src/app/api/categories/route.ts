import { NextResponse } from "next/server";

import { ApiError, handleApiError, successResponse } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { listActiveCategories, serializeCategory } from "@/services/category.service";

export async function GET() {
  try {
    await connectToDatabase();
    const categories = await listActiveCategories();
    return NextResponse.json(
      successResponse(categories.map(serializeCategory)),
    );
  } catch (error) {
    const apiError = handleApiError(error);
    const status = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(apiError, { status });
  }
}
