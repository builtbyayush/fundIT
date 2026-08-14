import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { handleApiError, successResponse } from "@/lib/api";

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        successResponse({
          status: "not_configured",
          message: "MONGODB_URI is not set. Database connection skipped.",
        }),
      );
    }

    await connectToDatabase();

    return NextResponse.json(
      successResponse({
        status: "connected",
        message: "Database connection successful",
      }),
    );
  } catch (error) {
    const apiError = handleApiError(error);
    return NextResponse.json(apiError, { status: 500 });
  }
}
